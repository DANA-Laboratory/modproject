/**
 * Created by AliReza on 5/22/2016.
 */
'use strict';

var util = require('./util.js');

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

exports.getItems = function (/*sqlite3.Database*/ db, data, callback) {
    util.whereIs(db, {requestId : data.requestId}, function (err, whereUser) {
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

exports.updateItem = function (/*sqlite3.Database*/ db, /*RequestData*/ data, callback) {
    util.whereIs(db, {requestId : data.requestId}, function (err, whereUser) {
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

var touchable = function(/*sqlite3.Database*/ db, /*RequestData*/ data, callback) {
    util.whereIs(db, {requestId : data.requestId}, function(err, whereUser) {
        if (err) {
            callback(err);
        } else {
            whereUser === data.userId ? callback(null, true) : callback('that is not here, you can`t touch that');
        }
    })
};

exports.updateStatus = touchable;
exports.sendRequestTo = touchable;
exports.addItem = touchable;

var allways = function(/*sqlite3.Database*/ db, /*RequestData*/ data, callback) {
    callback(null, true);
};

exports.insertRequest = allways;
exports.getDashboard = allways;
exports.whereIs = allways;

exports.rmRequest = function(/*sqlite3.Database*/ db, /*RequestData*/ data, callback) {
    db.get('SELECT requestId FROM tblActions WHERE requestId=? AND actionDescription="Create" AND actionUser=? AND requestId NOT IN (SELECT requestId FROM tblDiscipline)', [data.requestId, data.userId], function (err, row) {
        if (err) {
            callback(err);
        } else {
            row ? callback(null, true) : callback('only just created requests could removed by creator', false);
        }
    });
};