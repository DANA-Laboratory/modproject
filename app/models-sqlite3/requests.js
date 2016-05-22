/**
 * Created by AliReza on 5/13/2016.
 */
'use strict';

var getNewId = function(/*sqlite3.Database*/ db, requestType, callback) {
    db.get('SELECT MAX(manualId) as newId FROM tblRequests WHERE (requesttype=?)', [requestType], function (err, row) {
        if (err) {
            callback('select max description err=', err);
        } else {
            var newId = 1;
            if (typeof(row) !== 'undefined') {
                newId = row.newId + 1;
            }
            callback(newId);
        }
    });
};

var addRequestAction = function(/*sqlite3.Database*/ db, /*RequestData*/ data, callback) {
    db.run('INSERT INTO tblActions (requestId, actionDescription, actionTime, actionUser) VALUES (?, ?, ?, ?);', [data.requestId, data.actionDescription, Date.now(), data.actionUser], callback);
};

var whoDid = function(/*sqlite3.Database*/ db, /*RequestData*/ data, callback) {
    db.get('SELECT actionUser FROM tblActions WHERE requestId=? AND actionDescription=?;', [data.requestId, data.actionDescription], function(err, row) {
        !err ? (row ? callback(null, row.actionUser) : callback("no one")) : callback(err);
    });

};

var getItemPermissions = function(/*sqlite3.Database*/ db, /*RequestData*/ data, callback) {
    db.get('SELECT privilege FROM tblRequestItems WHERE requestId=? AND description=?', [data.requestId, data.itemDescription], function(err , row){
        if(!err) {
            var h = parseInt(row.privilege/100);
            var t = parseInt(row.privilege/10)-h*10;
            var o = row.privilege - t*10 - h*100;
            callback(null,[h, t, o])
        } else {
            callback(err);
        }
    });
};

var permissionTo = {};

exports.addItem = function(/*sqlite3.Database*/ db, /*RequestData*/ data, callback) {
    db.get('SELECT COUNT(id) as itemCount FROM tblRequestItems WHERE requestId=? AND description=?', [data.requestId, data.itemDescription], function(err, row){
        if (err) {
            callback(err);
        } else {
            if (row.itemCount > 0) {
                callback('item exists');
            } else {
                db.run('INSERT INTO tblRequestItems (requestId, item, privilege, description, ownerUser, createTime) VALUES (?, ?, ?, ?, ?, ?);', [data.requestId, data.requestItem, data.itemPrivilege, data.itemDescription, data.ownerUser, Date.now()], callback);
            }
        }
    });
};

exports.updateItem = function(/*sqlite3.Database*/ db, /*RequestData*/ data, callback) {
    permissionTo[exports.updateItem](db, data, function(err, can) {
        if (can) {
            db.run('UPDATE tblRequestItems SET item=? WHERE requestId=? AND description=?', [data.requestItem, data.requestId, data.description], callback);
        } else {
            callback(err);
        }
    });
};

exports.getItems = function(/*sqlite3.Database*/ db, data, callback) {
    permissionTo[exports.getItems](db, data, function(err, can) {
        if (can) {
            var inList = '';
            for (var i in can) {
                inList += can[i]+ ',';
            }
            db.all('SELECT item, privilege, ownerUser FROM tblRequestItems WHERE Id in (' + inList.substr(0,inList.length-1) + ')', [can], function(err, rows) {
                if(err) {
                    callback(err);
                } else {
                    var items=[];
                    var privileges=[];
                    var ownerUsers=[];
                    for (var row in rows) {
                        items.push(rows[row].item);
                        privileges.push(rows[row].privilege);
                        ownerUsers.push(rows[row].ownerUser);
                    }
                    callback(err, items);
                }
            })
        } else {
            callback(err);
        }
    })
};

exports.insertRequest = function(/*sqlite3.Database*/ db, /*RequestData*/ data, callback) {
    getNewId(db, data.requestType, function(newId, err) {
        if(!err) {
            db.serialize(function() {
                db.exec("BEGIN");
                db.run('INSERT INTO tblRequests (manualId, status, description, requestType) VALUES (?,?,?,?);', [newId, 1, data.description, data.requestType], function (err) {
                    if (err) {
                        db.exec("ROLLBACK");
                        callback(err);
                    } else {
                        data.actionDescription = 'Create';
                        data.requestId = this.lastID;
                        data.actionUser = data.userId;
                        addRequestAction(db, data, function (err) {
                            !err ? db.exec("COMMIT") : db.exec("ROLLBACK");
                            callback(err, this.lastID);
                        });
                    }
                });
            });
        } else {
            callback(err);
        }
    });
};

exports.whereIs = function(/*sqlite3.Database*/ db, /*RequestData*/ data, callback) {
    db.get('SELECT toUser FROM tblDiscipline WHERE requestId=? AND time in (SELECT MAX(time) FROM tblDiscipline WHERE requestId=?);', [data.requestId, data.requestId], function(err, row) {
        if (err) {
            callback(err);
        } else {
            if(row) {
                callback(err, row.toUser);
            } else {
                //"Create"//no one//
                data.actionDescription = 'Create';
                whoDid(db, data, function(err, actionUser) {
                    if (err) {
                        err === 'no one' ? callback(err) : callback('i don`t know where is it');
                    } else {
                        callback(null, actionUser);
                    }
                });
            }
        }
    });
};

exports.updateStatus = function(/*sqlite3.Database*/ db, /*RequestData*/ data, callback) {
    permissionTo[exports.updateStatus](db, data, function(err, can) {
        if(can) {
            db.serialize(function() {
                db.exec("BEGIN");
                data.actionUser = data.userId;
                addRequestAction(db, data, function (err) {
                    if (err) {
                        db.exec("ROLLBACK");
                        callback(err);
                    } else {
                        db.run('UPDATE tblRequests SET status=? WHERE id=?', [data.status, data.requestId], function (err) {
                            !err ? db.exec("COMMIT") : db.exec("ROLLBACK");
                            callback(err);
                        })
                    }
                });
            });
        } else {
            callback(err);
        }
    });
};

exports.sendRequestTo = function(/*sqlite3.Database*/ db, /*RequestData*/ data, callback) {
    permissionTo[exports.sendRequestTo](db, data, function(err, can) {
        if(can) {
            exports.whereIs(db, {requestId : data.requestId}, function(err, fromUser) {
                if (err) {
                    callback(err);
                } else {
                    db.run('INSERT INTO tblDiscipline(requestId, fromUser, toUser, time) VALUES(?, ?, ?, ?)',[data.requestId, fromUser, data.toUser, Date.now()], callback);
                }
            })
        } else {
            callback(err);
        }
    });
};

exports.getDashboard = function(/*sqlite3.Database*/ db, /*RequestData*/ data, callback) {
    permissionTo[exports.getDashboard](db, data, function(err, can) {
        if(can) {
            var res={};
            var counter = 0;
            var error = null;
            var f = function() {
                if (counter==3) {
                    !error ? callback(null, res) : callback(error);
                }
            };
            db.all('SELECT * FROM tblRequests WHERE id IN (SELECT requestId FROM tblDiscipline WHERE toUser=?)', [data.userId], function (err, rows) {
                counter+=1;
                if (!err) {
                    res.recieved = (rows ? rows : []);
                } else {
                    error = err;
                }
                f();
            });
            db.all('SELECT * FROM tblRequests WHERE id IN (SELECT requestId FROM tblDiscipline WHERE fromUser=?)', [data.userId], function (err, rows) {
                counter+=1;
                if (!err) {
                    res.sent = rows ? rows : [];
                } else {
                    error = err;
                }
                f();
            });
            db.all('SELECT * FROM tblRequests WHERE (id IN (SELECT requestId FROM tblActions WHERE actionDescription="Create" AND actionUser=?)) AND (id NOT IN (SELECT requestId FROM tblDiscipline WHERE toUser=? OR fromUser=?))', [data.userId, data.userId, data.userId], function (err, rows) {
                counter+=1;
                if (!err) {
                    res.created = rows;
                } else {
                    error = err;
                }
                f();
            });
        } else {
            callback(err);
        }
    });
};

exports.rmRequest = function(/*sqlite3.Database*/ db, data, callback) {
    permissionTo[exports.rmRequest](db, data, function(err, can) {
        if(can) {
            db.exec('DELETE FROM tblRequests WHERE Id=' + data.requestId + ';DELETE FROM tblRequestItems WHERE requestId=' + data.requestId, callback);
        } else {
            callback(err);
        }
    })
};