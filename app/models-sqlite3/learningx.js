/**
 * Created by AliReza on 7/5/2016.
 * 
 */
'use strict';
var CSVParser = require('./csv-parser');
var getMaxCounter = function(/*sqlite3.Database*/ db, table, field, patt) {
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
var addActor = function (/*sqlite3.Database*/ db, /*LearningXData*/ data) {
    return new Promise(function (resolve, reject) {
          db.run('INSERT INTO tblActors (type, name, family, code, attributes) SELECT ID, ?, ?, ?, ? FROM tblActorTypes WHERE Caption=?;', [data.name, data.family, data.code, data.attributes, data.type], function (err) {
            err ? reject(err) : resolve();
        });
    });
};
exports.addActor = addActor;
exports.importActorsFromCSV = function (/*sqlite3.Database*/ db, pre, actorType, path, getActorData) {
    return new Promise(function (resolve, reject) {
        var counter = 0;
        var counterCode = 0;
        getMaxCounter(db, 'tblActors', 'code', pre + '000')
            .then(function (res) {
                db.exec("BEGIN");
                var csvParser = new (CSVParser)(function (err, record, count) {
                    if (!err) {
                        var actorData = getActorData(record);
                        actorData.type = actorType;
                        counterCode += 1;
                        actorData.code = pre + (res + counterCode).substr(-1 * res.length);
                        addActor(db, actorData)
                            .then(function (res) { 
                                counter += 1;
                                if (count == counter) {
                                    db.exec("COMMIT");
                                    resolve(count);
                                }
                            })
                            .catch(function (err) {
                                db.exec("ROLLBACK");
                                reject(err);
                            });
                    } else {
                        reject(err);
                    }
                });
                csvParser.read(path);
            })
            .catch(function (err) {
                reject(err);
            });
    });
};