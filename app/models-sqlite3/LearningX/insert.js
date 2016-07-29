/**
 * Created by AliReza on 7/28/2016.
 */
'use strict';

var validator = require('./dataValidator');

exports.addActor = function (db, data) {
    return new Promise(function (resolve, reject) {
        validator.validateForInsert('tblActor', data)
            .then(function (data) {
                db.run('INSERT INTO tblActor (type, name, family, code, attribute) SELECT ID, ?, ?, ?, ? FROM tblActorType WHERE Caption=?;', [data.name, data.family, data.code, data.attribute, data.type], function (err) {
                    err ? reject(err) : resolve(this.lastID);
                });
            })
            .catch(function (err) {
                reject(err)
            })
    });
};
exports.addCourse = function (db, data) {
    return new Promise(function (resolve, reject) {
        validator.validateForInsert('tblCourse', data)
            .then(function (data) {
                db.run('INSERT INTO tblCourse (caption, code, attribute) VALUES(?, ?, ?);', [data.caption, data.code, data.attribute], function (err) {
                    err ? reject(err) : resolve(this.lastID);
                });
            })
            .catch(function (err) {
                reject(err)
            })
    });
};
exports.addClass = function (db, data) {
    return new Promise(function (resolve, reject) {
        validator.validateForInsert('tblClass', data)
            .then(function (data) {
                db.run('INSERT INTO tblClass (timeStart, timeEnd, courseId, code, attribute) VALUES(?, ?, ?, ?, ?);', [data.timeStart, data.timeEnd, data.courseId, data.code, data.attribute], function (err) {
                    err ? reject(err) : resolve(this.lastID);
                });
            })
            .catch(function (err) {
                reject(err)
            })
    });
};
exports.addGroup = function (db, data) {
    return new Promise(function (resolve, reject) {
        validator.validateForInsert('tblGroup', data)
            .then(function (data) {
                db.run('INSERT INTO tblGroup (caption) VALUES(?);', [data.caption], function (err) {
                    err ? reject(err) : resolve(this.lastID);
                });
            })
            .catch(function (err) {
                reject(err)
            })
    });
};