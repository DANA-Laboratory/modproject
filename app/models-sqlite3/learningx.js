/**
 * Created by AliReza on 7/5/2016.
 * 
 */
'use strict';
var CSVParser = require('./csv-parser');
var getNextCode = function (lastCode) {
    var len = -1;
    while(! isNaN(lastCode.substr(len)))
        len -= 1;
    var pre = lastCode.substr(0, Math.abs(lastCode.length + len + 1));
    var currentCounter =  lastCode.substr(len + 1);
    return pre + ("0".repeat(currentCounter.length) + (parseInt(currentCounter) + 1)).substr(-1 * currentCounter.length);
};
exports.getSearchStrForAttribute = function (attribute) {
    var str = JSON.stringify(attribute);
    return str.substr(1,str.length-2);
};
exports.getMaxCounter = function(db, table, field, patt) {
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
                row.max ? resolve(row.max) : resolve(pre + zero);
            }
        });
    });
};
exports.addActor = function (db, data) {
    return new Promise(function (resolve, reject) {
          db.run('INSERT INTO tblActors (type, name, family, code, attributes) SELECT ID, ?, ?, ?, ? FROM tblActorTypes WHERE Caption=?;', [data.name, data.family, data.code, data.attributes, data.type], function (err) {
            err ? reject(err) : resolve();
        });
    });
};
exports.addCourse = function (db, data) {
    return new Promise(function (resolve, reject) {
        db.run('INSERT INTO tblCourse (caption, attributes) VALUES(?, ?);', [data.caption, data.attributes], function (err) {
            err ? reject(err) : resolve();
        });
    });
};
exports.importActorsFromCSV = function (/*basedb*/ db, startCode, actorType, path, transformFunction) {
    return new Promise(function (resolve, reject) {
        var counter = 0;
        var lastCode = null;
        db.exec("BEGIN");
        var csvParser = new (CSVParser)(function (err, actorData, count) {
            if (!err) {
                actorData.type = actorType;
                lastCode = lastCode ? getNextCode(lastCode) : getNextCode(startCode);
                actorData.code = lastCode ;
                exports.addActor(db, actorData)
                    .then(function (res) {
                        counter += 1;
                        if (count == counter) {
                            db.exec("COMMIT");
                            resolve(count);
                        }
                    })
                    .catch(function (err) {
                        db.exec("ROLLBACK");
                        reject('addActor failed with ' + err);
                    });
            } else {
                reject('Create new CSVParser failed with ' + err);
            }
        }, transformFunction);
        csvParser.read(path);
    });
};
exports.importCoursesFromCSV = function (db, path, transformFunction) {
    return new Promise(function (resolve, reject) {
        var counter = 0;
        db.exec("BEGIN");
        var csvParser = new (CSVParser)(function (err, courseData, count) {
            if (!err) {
                exports.addCourse(db, courseData)
                    .then(function (res) {
                        counter += 1;
                        if (count == counter) {
                            db.exec("COMMIT");
                            resolve(count);
                        }
                    })
                    .catch(function (err) {
                        db.exec("ROLLBACK");
                        reject('addCourse failed with ' + err);
                    });
            } else {
                reject('Create new CSVParser failed with ' + err);
            }
        }, transformFunction);
        csvParser.read(path);
    });
};
exports.importAppendActorsFromCSV = function (db, startCode, actorType, path, transformFunction) {
    return new Promise(function (resolve, reject) {
        exports.getMaxCounter(db, 'tblActors', 'code', startCode)
            .then(function (startCode, pre) {
                exports.importActorsFromCSV(db, startCode, actorType, path, transformFunction)
                    .then(function (count) {
                        resolve(count);
                    })
                    .catch(function (err) {
                        reject(err);
                    })
            })
    })
};