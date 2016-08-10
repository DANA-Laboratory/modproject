/**
 * Created by AliReza on 7/28/2016.
 */
'use strict';

var validator = require('./dataValidator');
var util = require('./util');

exports.addActor = function (db, data) {
    return validator.validateForInsert('tblActor', data)
        .then(function (resData) {
            return db.pRun('INSERT INTO tblActor (type, name, family, code, attribute) SELECT ID, ?, ?, ?, ? FROM tblActorType WHERE Caption=?;', [data.name, data.family, data.code, data.attribute, data.type]);
        })
};
exports.addCourse = function (db, data) {
    return validator.validateForInsert('tblCourse', data)
        .then(function (resData) {
            return db.pRun('INSERT INTO tblCourse (caption, code, attribute) VALUES(?, ?, ?);', [data.caption, data.code, data.attribute]);
        })
};
exports.addObject = function (db, data) {
    return new validator.validateForInsert('tblObject', data)
        .then(function (resData) {
            if(resData.hasOwnProperty('class_code')){
                return db.pGet('SELECT id FROM tblClass WHERE code=?', [resData.class_code])
                    .then(function(res){
                        if (res === undefined)
                            throw(`undefined ${resData.class_code} class code`);
                        else
                            return db.pRun('INSERT INTO tblObject (type, code, attribute) SELECT ID, ?, ? FROM tblObjectType WHERE Caption=? AND tblName="tblObject";', [data.code, data.attribute, data.type]);
                    })
            } else
                return db.pRun('INSERT INTO tblObject (type, code, attribute) SELECT ID, ?, ? FROM tblObjectType WHERE Caption=? AND tblName="tblObject";', [data.code, data.attribute, data.type]);
        })
};
exports.addClass = function (db, data) {
    return validator.validateForInsert('tblClass', data)
        .then(function (resData) {
            return db.pRun('INSERT INTO tblClass (timeStart, timeEnd, courseId, code, duration, status, attribute) SELECT ?, ?, id, ?, ?, ?, ? FROM tblCourse WHERE code=?;', [data.timeStart, data.timeEnd, data.code, data.duration, data.status, data.attribute ,data.courseCode]);
        })
};
exports.addGroup = function (db, data) {
    return validator.validateForInsert('tblGroup', data)
        .then(function (resData) {
            return db.pRun('INSERT INTO tblGroup (code) VALUES(?);', [data.code]);
        })
};
exports.appendActor = function (db, data, startCode) {
    return util.getMaxCounter(db, 'tblActor', 'code', startCode)
        .then(function (startCode, pre) {
            data.code = util.getNextCode(startCode);
            return exports.addActor(db, data);
        });
};
exports.appendCourse = function (db, data, startCode) {
    return util.getMaxCounter(db, 'tblCourse', 'code', startCode)
        .then(function (startCode, pre) {
            data.code = util.getNextCode(startCode);
            return exports.addCourse(db, data);
        });
};
exports.appendClass = function (db, data, startCode) {
    return util.getMaxCounter(db, 'tblClass', 'code', startCode)
        .then(function (startCode, pre) {
            data.code = util.getNextCode(startCode);
            return exports.addClass(db, data);
        });
};