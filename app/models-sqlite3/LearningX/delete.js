/**
 * Created by AliReza on 7/30/2016.
 */
'use strict';

var validator = require('./dataValidator');

exports.removeActor = function (db, data) {
    return new Promise(function (resolve, reject) {
        validator.validateForDelete('tblActor', data)
            .then(function (data) {
                resolve(db.deleteRecords('tblActor', 'Code', data));
            })
            .catch(function (err) {
                reject(err);
            })
    });
};

exports.removeCourse = function (db, data) {
    return new Promise(function (resolve, reject) {
        validator.validateForDelete('tblCourse', data)
            .then(function (data) {
                resolve(db.deleteRecords('tblCourse', 'Code', data));
            })
            .catch(function (err) {
                reject(err);
            })
    });
};

exports.removeClass = function (db, data) {
    return new Promise(function (resolve, reject) {
        validator.validateForDelete('tblClass', data)
            .then(function (data) {
                resolve(db.deleteRecords('tblClass', 'Code', data));
            })
            .catch(function (err) {
                reject(err);
            })
    });
};

exports.removeGroup = function (db, data) {
    return new Promise(function (resolve, reject) {
        validator.validateForDelete('tblGroup', data)
            .then(function (data) {
                resolve(db.deleteRecords('tblGroup', 'Code', data));
            })
            .catch(function (err) {
                reject(err);
            })
    });
};