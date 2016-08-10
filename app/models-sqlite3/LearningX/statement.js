/**
 * Created by Afzalan on 8/1/2016.
 */
'use strict';

var validator = require('./dataValidator');
var util = require('./util');

//Who did the same statement with same object
exports.whoSStmSObject = function (db, description, objectCode, time) {
        if (!time)
            time = null;
        return db.pGet('SELECT tblStatementType.id as id, tblObjectType.tblName as objectTable, tblActorType.tblName as actorTable FROM tblStatementType INNER JOIN tblObjectType ON tblObjectType.id = object_type INNER JOIN tblActorType ON actor_type = tblActorType.id INNER JOIN tblVerb ON verb_id = tblVerb.id WHERE description = ?;', [description])
            .then(function(row) {
                if(row === undefined)
                    throw('undefined ' + description + ' statement');
                else
                    return db.pAll(`SELECT ${row.actorTable}.code FROM tblStatement INNER JOIN ${row.objectTable} ON ${row.objectTable}.id = object INNER JOIN ${row.actorTable} ON ${row.actorTable}.id = actor WHERE tblStatement.type = ? AND ${row.objectTable}.code = ?  AND (time <= ? OR ? is Null)`, [row.id, objectCode, time, time])
                    .then(function(rows){
                        return rows.map( (x) => x.code);
                    })
            });
};
exports.statementOperation = function (db, description1, operation, description2, objectCode, time) {
    return new Promise(function (resolve, reject) {
        var res1 = [];
        var res2 = [];
        exports.whoSStmSObject(db, description1, objectCode, time)
            .then(function (res) {
                res1 = res;
                return exports.whoSStmSObject(db, description2, objectCode, time)
            })
            .then(function (res) {
                res2 = res;
                switch (operation) {
                    case 'but':
                        resolve(util.but(res1, res2));
                    case 'or':
                        resolve(util.or(res1, res2));
                    case 'and' :
                        resolve(util.and(res1, res2));
                    case 'sBut':
                        resolve(util.symmetricBut(res1, res2));
                    default:
                        reject('undefined operator: ' + operation);

                }
            })
            .catch(function (err) {
                reject(err);
            })
    })
};
exports.addStatement = function (db, description, data) {
    return validator.validateStatement(description, data)
    .then(function (data) {
        return db.pGet('SELECT tblStatementType.attribute_meta, tblStatementType.id as id, verb_id, tblVerb.caption as verb, tblActorType.caption as actor, tblActorType.id as actTypeID, tblObjectType.id as objTypeID, tblObjectType.caption as object, tblObjectType.tblName as objectTable, tblActorType.tblName as actorTable FROM tblStatementType INNER JOIN tblObjectType ON tblObjectType.id = object_type INNER JOIN tblActorType ON actor_type = tblActorType.id INNER JOIN tblVerb ON verb_id = tblVerb.id WHERE description = ?;', [description])
            .catch(function (err) {
                throw('addStatement failed with : ' + err)
            })
            .then(function (row) {
                if (row === undefined)
                    throw('undefined ' + description + ' statement');
                else {
                    if (row.attribute_meta)
                        if (data.hasOwnProperty('attribute')) {
                            let attribute_meta = JSON.parse(row.attribute_meta);
                            Object.keys(attribute_meta).forEach(function (key) {
                                if (data.attribute.hasOwnProperty(key)) {
                                    if (Array.isArray(attribute_meta[key])) {
                                        if (!attribute_meta[key].includes(data.attribute[key]))
                                            throw(`invalid ${data.attribute[key]} value for attribute.${key}`);
                                    }
                                } else {
                                    throw(`attribute ${key} not found`);
                                }
                            });
                        } else {
                            throw('attribute not found');
                        }
                    return db.pGet(`SELECT * FROM ${row.objectTable} WHERE code = ?`, data.object)
                        .catch(function (err) {
                            throw ('addStatement failed with : ' + err);
                        })
                        .then(function (obj) {
                            if (obj === undefined)
                                throw('undefined ' + data.object + ' object');
                            else if (obj.hasOwnProperty('type') && obj.type !== row.objTypeID)
                                throw('invalid object type for id=' + obj.id + ' type=' + row.object);
                            else {
                                var jdata = JSON.stringify(data.actor);
                                return db.pAll(`SELECT id, code, type FROM ${row.actorTable} WHERE code IN (${jdata.substr(1, jdata.length - 2)})`)
                                    .catch(function (err) {
                                        throw (`SELECT FROM ${row.actorTable} failed with : ` + err);
                                    })
                                    .then(function (acts) {
                                        if (acts.length === 0)
                                            throw('no actor');
                                        let actCodes = '';
                                        let pInserts = [];
                                        for (let act of acts) {
                                            if (act.type === row.actTypeID)
                                                pInserts.push(db.pRun('INSERT INTO tblStatement(actor, object, verb, time, attribute, logtime, type) VALUES (?, ?, ?, ?, ?, ?, ?)', [act.id, obj.id, row.verb_id, Date.now(), JSON.stringify(data.attribute), Date.now(), row.id])
                                                    .catch(function(err){
                                                       throw('INSERT INTO tblStatement failed with : ' + err);
                                                    })
                                                    .then(function(lastId){
                                                        if (lastId > 0)
                                                            actCodes += ' ' + act.code;
                                                        return lastId;
                                                    })
                                                );
                                            else
                                                console.log(`expected  actor type of ${row.actTypeID} but see ${act.type}`);
                                        }
                                        return Promise.all(pInserts)
                                            .then(function(resultArr){
                                                return (row.actor + ' ' + actCodes + ' ' + row.verb + ' ' + row.object + ' ' + obj.code);
                                            })
                                    });
                            }
                        });
                }
            })
    })
};