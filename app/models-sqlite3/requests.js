/**
 * Created by AliReza on 5/13/2016.
 */
'use strict';

var util = require('./util.js');

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
    db.run('INSERT INTO tblActions (requestId, action, actionComment, actionTime, actionUser) VALUES (?, ?, ?, ?, ?);', [data.requestId, data.action, data.actionComment, (typeof data.actionTime === 'number') ? data.actionTime : Date.now(), data.actionUser], callback);
};

exports.addItem = function(/*sqlite3.Database*/ db, /*RequestData*/ data) {
    return new Promise(function(resolve, reject) {
        db.get('SELECT COUNT(id) as itemCount FROM tblRequestItems WHERE requestId=? AND description=?', [data.requestId, data.itemDescription], function (err, row) {
            if (err) {
                reject(err);
            } else {
                if (row.itemCount > 0) {
                    reject('item exists');
                } else {
                    db.run('INSERT INTO tblRequestItems (requestId, item, privilege, description, ownerUser, createTime) VALUES (?, ?, ?, ?, ?, ?);', [data.requestId, data.requestItem, data.itemPrivilege, data.itemDescription, data.ownerUser, Date.now()], function(err) {
                        err ? reject(err) : resolve();
                    });
                }
            }
        });
    });
};

exports.updateItem = function(/*sqlite3.Database*/ db, /*RequestData*/ data) {
    return new Promise(function(resolve, reject) {
        db.run('UPDATE tblRequestItems SET item=? WHERE requestId=? AND description=?', [data.requestItem, data.requestId, data.itemDescription], function(err){
            err ? reject(err) : resolve();
        });
    });
};

exports.getItems = function(/*sqlite3.Database*/ db, data, can) {
    return new Promise(function(resolve, reject) {
        var inList = '';
        for (var i in can) {
            inList += can[i] + ',';
        }
        db.all('SELECT item, privilege, ownerUser FROM tblRequestItems WHERE Id in (' + inList.substr(0, inList.length - 1) + ')', [can], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                var items = [];
                var privileges = [];
                var ownerUsers = [];
                for (var row in rows) {
                    items.push(rows[row].item);
                    privileges.push(rows[row].privilege);
                    ownerUsers.push(rows[row].ownerUser);
                }
                resolve(items);
            }
        })
    })
};
//requestType, userId = actionUser, actionComment, actionTime?
exports.insertRequest = function(/*sqlite3.Database*/ db, /*RequestData*/ data) {
    return new Promise(function(resolve, reject) {
        getNewId(db, data.requestType, function(newId, err) {
            if(!err) {
                db.run('INSERT INTO tblRequests (manualId, status, requestType) VALUES (?,?,?);', [newId, 1, data.requestType], function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        data.action = 'Create';
                        data.requestId = this.lastID;
                        data.actionUser = data.userId;
                        addRequestAction(db, data, function (err) {
                            !err ? resolve(this.lastID) : reject(err);
                        });
                    }
                });
            } else {
                reject(err);
            }
        });
    });
};

exports.whereIs = util.whereIs;

exports.updateStatus = function(/*sqlite3.Database*/ db, /*RequestData*/ data) {
    return new Promise(function(resolve, reject) {
        db.serialize(function () {
            db.exec("BEGIN");
            data.actionUser = data.userId;
            addRequestAction(db, data, function (err) {
                if (err) {
                    db.exec("ROLLBACK");
                    reject(err);
                } else {
                    db.run('UPDATE tblRequests SET status=? WHERE id=?', [data.status, data.requestId], function (err) {
                        if(err) {
                            db.exec("ROLLBACK");
                            reject(err);
                        } else {
                            db.exec("COMMIT");
                            resolve();
                        }
                    })
                }
            });
        });
    });
};

exports.sendRequestTo = function(/*sqlite3.Database*/ db, /*RequestData*/ data) {
    return new Promise(function(resolve, reject) {
        exports.whereIs(db, {requestId: data.requestId})
            .then(function (fromUser) {
                db.run('INSERT INTO tblDiscipline(requestId, fromUser, toUser, time) VALUES(?, ?, ?, ?)', [data.requestId, fromUser, data.toUser, Date.now()], function(err){
                    err ? reject(err) :resolve();
                });
            })
            .catch(function (err) {
                reject(err);
            });
    })
};

exports.getDashboard = function(/*sqlite3.Database*/ db, /*RequestData*/ data) {
    return new Promise(function(resolve, reject) {
        var res={};
        var counter = 0;
        var error = null;
        var f = function() {
            if (counter==3) {
                !error ? resolve(res) : reject(error);
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
        db.all('SELECT * FROM tblRequests WHERE (id IN (SELECT requestId FROM tblActions WHERE action="Create" AND actionUser=?)) AND (id NOT IN (SELECT requestId FROM tblDiscipline WHERE toUser=? OR fromUser=?))', [data.userId, data.userId, data.userId], function (err, rows) {
            counter+=1;
            if (!err) {
                res.created = rows;
            } else {
                error = err;
            }
            f();
        });
    });
};

exports.rmRequest = function(/*sqlite3.Database*/ db, data) {
    return new Promise(function(resolve, reject) {
        db.exec('DELETE FROM tblRequests WHERE Id=' + data.requestId + ';DELETE FROM tblRequestItems WHERE requestId=' + data.requestId, function(err){
            err ? reject(err) : resolve();
        });
    });
};