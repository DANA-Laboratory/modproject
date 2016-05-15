/**
 * Created by AliReza on 5/13/2016.
 */
'use strict';
var findMaxContract = function(/*sqlite3.Database*/ db, requestType, callback) {
    db.get('SELECT MAX(description) as newId FROM requests WHERE (requesttype=?)', [requestType], function (err, row) {
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

exports.addRequestItem = function(/*sqlite3.Database*/ db, requestId, requestItem, itemPrivilege, itemDescription, ownerUser, callback) {
    db.run('INSERT INTO tblRequestItems (requestId, item, privilege, description, ownerUser, createTime) VALUES (?, ?, ?, ?, ?, ?);', [requestId, requestItem, itemPrivilege, itemDescription, ownerUser, Date.now()], callback);
};