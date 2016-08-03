/**
 * Created by Afzalan on 8/1/2016.
 */
'use strict';

var validator = require('./dataValidator');
var util = require('./util');

//Who did the same statement with same object
exports.whoSStmSObject = function (db, description, objectCode, time) {
    return new Promise(function (resolve, reject) {
        if (!time)
            time = null;
        db.get('SELECT tblStatementType.id as id, tblObjectType.tblName as objectTable, tblActorType.tblName as actorTable FROM tblStatementType INNER JOIN tblObjectType ON tblObjectType.id = object_type INNER JOIN tblActorType ON actor_type = tblActorType.id INNER JOIN tblVerb ON verb_id = tblVerb.id WHERE description = ?;', [description], function (err, row) {
            if (err)
                reject(err);
            else
                if(row === undefined)
                    reject('undefined ' + description + ' statement');
                else
                    db.all(`SELECT ${row.actorTable}.code FROM tblStatement INNER JOIN ${row.objectTable} ON ${row.objectTable}.id = object INNER JOIN ${row.actorTable} ON ${row.actorTable}.id = actor WHERE tblStatement.type = ? AND ${row.objectTable}.code = ?  AND (time <= ? OR ? is Null)`, [row.id, objectCode, time, time], function (err, rows) {
                        err ?  reject(err) : resolve(rows.map( (x) => x.code));
                    });
        })
    })
};
exports.whoSStmSObjectsDiff = function (db, didDescription, didntDescription, objectCode, time) {
    return new Promise(function (resolve, reject) {
        var didres = [];
        var didntres = [];
        exports.whoSStmSObject(db, didDescription, objectCode, time)
            .then(function (res) {
                didres = res;
                return exports.whoSStmSObject(db, didntDescription, objectCode, time)
            })
            .then(function (res) {
                didntres = res;
                resolve(util.difference(didres, didntres))
            })
            .catch(function (err) {
                reject(err);
            })
    })
};
exports.addStatement = function (db, description, data) {
    return new Promise(function (resolve, reject) {
        validator.validateStatement(description, data)
        .then(function (data) {
            db.get('SELECT tblStatementType.id as id, verb_id, tblVerb.caption as verb, tblActorType.caption as actor, tblActorType.id as actTypeID, tblObjectType.id as objTypeID, tblObjectType.caption as object, tblObjectType.tblName as objectTable, tblActorType.tblName as actorTable FROM tblStatementType INNER JOIN tblObjectType ON tblObjectType.id = object_type INNER JOIN tblActorType ON actor_type = tblActorType.id INNER JOIN tblVerb ON verb_id = tblVerb.id WHERE description = ?;', [description], function (err, row) {
                if(err)
                    reject('addStatement failed with : ' + err);
                else {
                    if (row === undefined)
                        reject('undefined ' + description + ' statement');
                    else {
                        db.get(`SELECT * FROM ${row.objectTable} WHERE code = ?`, data.object, function (err, obj) {
                            if(err)
                                reject('addStatement failed with : ' + err);
                            else
                                if (obj === undefined)
                                    reject('undefined ' + data.object + ' object');
                                else
                                    if (obj.hasOwnProperty('type') && obj.type !== row.objTypeID)
                                        reject('invalid object type for id=' + obj.id + ' type=' + row.object);
                                    else {
                                        var jdata = JSON.stringify(data.actor);
                                        db.all(`SELECT id, code FROM ${row.actorTable} WHERE code IN (${jdata.substr(1, jdata.length - 2)})`, function (err, acts) {
                                            if(err)
                                                reject(`SELECT FROM ${row.actorTable} failed with : ` + err);
                                            else {
                                                if (acts.length === 0)
                                                    reject('no actor');
                                                let cnt = 0;
                                                let actCodes = '';
                                                for (let act of acts) {
                                                    db.run('INSERT INTO tblStatement(actor, object, verb, time, attribute, logtime, type) VALUES (?, ?, ?, ?, ?, ?, ?)', [act.id, obj.id, row.verb_id, Date.now(), JSON.stringify(data.attribute), Date.now(), row.id], function (err) {
                                                        if(err)
                                                            reject('INSERT INTO tblStatement failed with : ' + err);
                                                        else {
                                                            cnt++;
                                                            actCodes += ' ' + act.code;
                                                            if (cnt === acts.length)
                                                                resolve(row.actor + ' ' + actCodes + ' ' + row.verb + ' ' + row.object + ' ' + obj.code);
                                                        }
                                                    });
                                                }
                                            }
                                        })
                                    }
                        });
                    }
                }
            });
        })
        .catch(function (err) {
            reject(err);
        })
    })
};