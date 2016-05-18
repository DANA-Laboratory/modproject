/**
 * Created by AliReza on 5/13/2016.
 */
'use strict';
var findMaxContract = function(/*sqlite3.Database*/ db, requestType, callback) {
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
        if (err) {
            callback(err);
        } else {
            if (row) {
                callback(null, row.actionUser);
            } else {
                callback("no one");
            }
        }
    });

}

exports.insertRequest = function(/*sqlite3.Database*/ db, status, description, requestType, creator, callback) {
    findMaxContract(db, requestType, function(newId, err) {
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

exports.sendRequestTo = function(/*sqlite3.Database*/ db, requestId, toUser, callback) {
    exports.whereIs(db, requestId, function(err, fromUser) {
        if (err) {
            callback(err);
        } else {
            db.run('INSERT INTO tblDiscipline(requestId, fromUser, toUser, time) VALUES(?, ?, ?, ?)',[requestId, fromUser, toUser, Date.now()], callback);
        }
    })
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
    addRequestAction(db, requestId, newStatus, userId, function(err){
        if (err) {
            callback(err);
        } else {
            db.run('UPDATE tblRequests SET status=? WHERE id=?',[newStatus, requestId], function(err) {
                callback(err);
            });
        }
    });
};

exports.addRequestItem = function(/*sqlite3.Database*/ db, requestId, requestItem, itemPrivilege, itemDescription, ownerUser, callback) {
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

exports.getRequestItems = function(/*sqlite3.Database*/ db, requestId, callback) {
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

exports.updateItem = function(/*sqlite3.Database*/ db, requestId, description, newValue, userId, callback) {
    db.run('UPDATE tblRequestItems SET item=? WHERE requestId=? AND description=?', [newValue, requestId, description], function(err){
        callback(err);
    });
};