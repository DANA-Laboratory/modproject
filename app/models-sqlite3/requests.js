/**
 * Created by AliReza on 5/13/2016.
 */
'use strict';
var createNewId = function(/*sqlite3.Database*/ db, requestType, callback) {
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

var addRequestAction = function(/*sqlite3.Database*/ db, requestId, actionDescription, actionUser, callback) {
    db.run('INSERT INTO tblActions (requestId, actionDescription, actionTime, actionUser) VALUES (?, ?, ?, ?);', [requestId, actionDescription, Date.now(), actionUser], callback);
};

var whoDid = function(/*sqlite3.Database*/ db, requestId, actionDescription, callback) {
    db.get('SELECT actionUser FROM tblActions WHERE requestId=? AND actionDescription=?;', [requestId, actionDescription], function(err, row) {
        !err ? (row ? callback(null, row.actionUser) : callback("no one")) : callback(err);
    });

};

var getItemPermissions = function(/*sqlite3.Database*/ db, requestId, description, callback) {
    db.get('SELECT privilege FROM tblRequestItems WHERE requestId=? AND description=?', [requestId, description], function(err , row){
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

exports.addItem = function(/*sqlite3.Database*/ db, requestId, requestItem, itemPrivilege, itemDescription, ownerUser, callback) {
    db.get('SELECT COUNT(id) as itemCount FROM tblRequestItems WHERE requestId=? AND description=?', [requestId, itemDescription], function(err, row){
        if (err) {
            callback(err);
        } else {
            if (row.itemCount > 0) {
                callback('item exists');
            } else {
                db.run('INSERT INTO tblRequestItems (requestId, item, privilege, description, ownerUser, createTime) VALUES (?, ?, ?, ?, ?, ?);', [requestId, requestItem, itemPrivilege, itemDescription, ownerUser, Date.now()], callback);
            }
        }
    });
};

exports.updateItem = function(/*sqlite3.Database*/ db, requestId, description, newValue, userId, callback) {
    permissionTo[exports.updateItem](db, requestId, description, userId, function(err, can) {
        if (can) {
            db.run('UPDATE tblRequestItems SET item=? WHERE requestId=? AND description=?', [newValue, requestId, description], callback);
        } else {
            callback(err);
        }
    });
};

exports.getItems = function(/*sqlite3.Database*/ db, requestId, callback) {
    db.all('SELECT item, privilege, ownerUser FROM tblRequestItems WHERE requestId=? ', [requestId], function(err, rows) {
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
};

exports.insertRequest = function(/*sqlite3.Database*/ db, status, description, requestType, creator, callback) {
    createNewId(db, requestType, function(newId, err) {
        if(!err) {
            db.run('INSERT INTO tblRequests (manualId, status, description, requestType) VALUES (?,?,?,?);', [newId, status, description, requestType], function (err) {
                if (err) {
                    callback(err);
                } else {
                    addRequestAction(db, this.lastID, 'Create', creator, function (err) {
                        callback(err, this.lastID);
                    });
                }
            });
        } else {
            callback(err);
        }
    });
};

exports.whereIs = function(/*sqlite3.Database*/ db, requestId, callback) {
    db.get('SELECT toUser FROM tblDiscipline WHERE requestId=? AND time in (SELECT MAX(time) FROM tblDiscipline WHERE requestId=?);', [requestId, requestId], function(err, row) {
        if (err) {
            callback(err);
        } else {
            if(row) {
                callback(err, row.toUser);
            } else {
                //"Create"//no one//
                whoDid(db, requestId, 'Create', function(err, actionUser) {
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

exports.updateStatus = function(/*sqlite3.Database*/ db, requestId, newStatus, userId, callback) {
    db.serialize(function() {
        db.exec("BEGIN");
        addRequestAction(db, requestId, newStatus, userId, function (err) {
            if (err) {
                callback(err);
            } else {
                db.run('UPDATE tblRequests SET status=? WHERE id=?', [newStatus, requestId], function (err) {
                    if (err) {
                        db.exec("ROLLBACK");
                    } else {
                        db.exec("COMMIT");
                    }
                    callback(err);
                })
            }
        });
    });
};

exports.sendRequestTo = function(/*sqlite3.Database*/ db, requestId, toUser, userId, callback) {
    permissionTo[exports.sendRequestTo](db, requestId, userId, function(err, can) {
        if(can) {
            exports.whereIs(db, requestId, function(err, fromUser) {
                if (err) {
                    callback(err);
                } else {
                    db.run('INSERT INTO tblDiscipline(requestId, fromUser, toUser, time) VALUES(?, ?, ?, ?)',[requestId, fromUser, toUser, Date.now()], callback);
                }
            })
        } else {
            callback(err);
        }
    });
};


permissionTo[exports.updateItem] = function (/*sqlite3.Database*/ db, requestId, description, userId, callback) {
    getItemPermissions(db, requestId, description, function (err, permissions) {
        if (err) {
            callback(err, false);
        } else {
            if (permissions[2] > 2) {
                callback(null, exports.updateItem);
            } else {
                exports.whereIs(db, requestId, function (err, whereUser) {
                    if (!err && whereUser === userId) {
                        db.run('SELECT id FROM tblRequestItems WHERE requestId=? AND description=? AND ((ownerUser=? AND ?>2) OR (ownerUser!=? AND ?>2))', [requestId, description, userId, permissions[0], userId, permissions[1]], function (err) {
                            callback(null, true);
                        });
                    } else {
                        callback('that is not here, you can`t touch that', false);
                    }
                });
            }
        }
    });
};

permissionTo[exports.sendRequestTo] = function (/*sqlite3.Database*/ db, requestId, userId, callback) {
    exports.whereIs(db, requestId, function(err, whereUser) {
        if (err) {
            callback(err);
        } else {
            whereUser === userId ? callback(null, true) : callback('that is not here, you can`t touch that');
        }
    })
}