/**
 * Created by AliReza on 7/5/2016.
 * 
 */
'use strict';
exports.getMaxCounter = function(/*sqlite3.Database*/ db, table, field, patt) {
    var len = -1;
    var digi = '';
    var zero = '';
    while(! isNaN(patt.substr(len))) {
        len -= 1;
        digi += '_';
        zero += '0';
    }
    var pre = patt.substr(0, Math.abs(patt.length + len + 1));
    return new Promise((resolve, reject) => {
        db.get(`SELECT MAX(${field}) as max FROM ${table} WHERE ${field} LIKE '${pre}${digi}'`, [], function (err, row) {
            if (err) {
                reject(err);
            } else {
                row.max ? resolve(row.max.substr(patt.length + len + 1)) : resolve(zero);
            }
        });
    });
};
exports.addActor = function (/*sqlite3.Database*/ db, /*LearningXData*/ data) {
    return new Promise(function (resolve, reject) {
          db.run('INSERT INTO tblActors (type, name, family, code, attributes) SELECT ID, ?, ?, ?, ? FROM tblActorTypes WHERE Caption=?;', [data.name, data.family, data.code, data.attributes, data.type], function (err) {
            err ? reject(err) : resolve();
        });
    });
};