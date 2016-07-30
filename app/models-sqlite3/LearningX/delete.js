/**
 * Created by AliReza on 7/30/2016.
 */
'use strict';

exports.removeActor = function (db, data) {
    return new Promise(function (resolve, reject) {
        validator.validateForDelete('tblActor', data)
            .then(function (data) {
                return db.deleteRecords('tblActor', data);
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
                return db.deleteRecords('tblCourse', data);
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
                return db.deleteRecords('tblClass', data);
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
                return db.deleteRecords('tblGroup', data);
            })
            .catch(function (err) {
                reject(err);
            })
    });
};