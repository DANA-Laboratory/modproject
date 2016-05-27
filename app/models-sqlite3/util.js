/**
 * Created by AliReza on 5/22/2016.
 */
'use strict';

var whoDid = function(/*sqlite3.Database*/ db, /*RequestData*/ data) {
    return new Promise(function(resolve, reject) {
        db.get('SELECT actionUser FROM tblActions WHERE requestId=? AND action=?;', [data.requestId, data.action], function (err, row) {
            !err ? (row ? resolve(row.actionUser) : reject("no one")) : reject(err);
        });
    });
};

exports.whereIs = function(/*sqlite3.Database*/ db, /*RequestData*/ data) {
    return new Promise(function(resolve, reject) {
        db.get('SELECT toUser FROM tblDiscipline WHERE requestId=? AND time in (SELECT MAX(time) FROM tblDiscipline WHERE requestId=?);', [data.requestId, data.requestId], function(err, row) {
            if (err) {
                reject(err);
            } else {
                if(row) {
                    resolve(row.toUser);
                } else {
                    data.action = 'Create';
                    whoDid(db, data)
                        .then(function (actionUser) {
                            resolve(actionUser);
                        })
                        .catch(function (err) {
                            err === 'no one' ? reject(err) : reject('i don`t know where is it');
                        });
                }
            }
        });
    });
};