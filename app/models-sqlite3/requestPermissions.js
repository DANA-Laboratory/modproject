/**
 * Created by AliReza on 5/22/2016.
 */

permissionTo[exports.getItems] = function (/*sqlite3.Database*/ db, data, callback) {
    exports.whereIs(db, {requestId : data.requestId}, function (err, whereUser) {
        if (!err) {
            var isReciever = false;
            if (whereUser === data.userId) {
                isReciever = true;
            }
            db.all('SELECT id FROM tblRequestItems WHERE requestId=? AND ((ownerUser=? AND (privilege like "1__" OR privilege like "2__")) OR (? AND (privilege like "_1_" OR privilege like "_2_")) OR (privilege like "__1") OR (privilege like "__2"))', [data.requestId, data.userId, isReciever], function (err, rows) {
                if (err) {
                    callback(err);
                } else {
                    if(rows.length) {
                        var itemIds = [];
                        for (var row in rows) {
                            itemIds.push(rows[row].id);
                        }
                        callback(null, itemIds);
                    } else {
                        callback('user don`t have permission to get this request items', false);
                    }
                }
            });
        } else {
            callback(err, false);
        }
    });
};

permissionTo[exports.updateItem] = function (/*sqlite3.Database*/ db, /*RequestData*/ data, callback) {
    exports.whereIs(db, {requestId : data.requestId}, function (err, whereUser) {
        if (!err && whereUser === data.userId) {
            getItemPermissions(db, data, function (err, permissions) {
                if (err) {
                    callback(err, false);
                } else {
                    if (permissions[2] > 1) {
                        callback(null, true);
                    } else {
                        db.get('SELECT id FROM tblRequestItems WHERE requestId=? AND description=? AND ((ownerUser=? AND ?>1) OR (ownerUser!=? AND ?>1))', [data.requestId, data.itemDescription, data.userId, permissions[0], data.userId, permissions[1]], function (err, row) {
                            if (err) {
                                callback(err);
                            } else {
                                row ? callback(null, true) : callback('user don`t have permission to update this request items', false);
                            }
                        });
                    }
                }
            });
        } else {
            callback('that is not here, you can`t touch that', false);
        }
    });
};

permissionTo[exports.sendRequestTo] = function(/*sqlite3.Database*/ db, /*RequestData*/ data, callback) {
    exports.whereIs(db, {requestId : data.requestId}, function(err, whereUser) {
        if (err) {
            callback(err);
        } else {
            whereUser === data.userId ? callback(null, true) : callback('that is not here, you can`t touch that');
        }
    })
};

permissionTo[exports.updateStatus] = permissionTo[exports.sendRequestTo];

permissionTo[exports.getDashboard] = function(/*sqlite3.Database*/ db, /*RequestData*/ data, callback) {
    callback(null, true);
};

permissionTo[exports.rmRequest] = function(/*sqlite3.Database*/ db, /*RequestData*/ data, callback) {
    db.get('SELECT requestId FROM tblActions WHERE requestId=? AND actionDescription="Create" AND actionUser=? AND requestId NOT IN (SELECT requestId FROM tblDiscipline)', [data.requestId, data.userId], function (err, row) {
        if (err) {
            callback(err);
        } else {
            row ? callback(null, true) : callback('only just created requests could removed by creator', false);
        }
    });
};