/**
 * Created by AliReza on 7/5/2016.
 * 
 */
'use strict';
var CSVParser = require('./csv-parser');
var insert = require('./insert');
var util = require('./util');

var getNextCode = function (lastCode) {
    var len = -1;
    while(! isNaN(lastCode.substr(len)))
        len -= 1;
    var pre = lastCode.substr(0, Math.abs(lastCode.length + len + 1));
    var currentCounter =  lastCode.substr(len + 1);
    return pre + ("0".repeat(currentCounter.length) + (parseInt(currentCounter) + 1)).substr(-1 * currentCounter.length);
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
                insert.addActor(db, actorData)
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
exports.importCoursesFromCSV = function (db, startCode, path, transformFunction) {
    return new Promise(function (resolve, reject) {
        var counter = 0;
        var lastCode = null;
        db.exec("BEGIN");
        var csvParser = new (CSVParser)(function (err, courseData, count) {
            if (!err) {
                lastCode = lastCode ? getNextCode(lastCode) : getNextCode(startCode);
                courseData.code = lastCode ;
                insert.addCourse(db, courseData)
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
        util.getMaxCounter(db, 'tblActor', 'code', startCode)
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