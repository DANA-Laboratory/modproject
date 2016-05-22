/**
 * Created by AliReza on 5/22/2016.
 */
'use strict';

var whoDid = function(/*sqlite3.Database*/ db, /*RequestData*/ data, callback) {
    db.get('SELECT actionUser FROM tblActions WHERE requestId=? AND actionDescription=?;', [data.requestId, data.actionDescription], function(err, row) {
        !err ? (row ? callback(null, row.actionUser) : callback("no one")) : callback(err);
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