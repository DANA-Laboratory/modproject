/**
 * Created by Afzalan on 8/1/2016.
 */
'use strict';

var validator = require('./dataValidator');
var util = require('./util');

exports.addStatement = function (db, description, data) {
    return new Promise(function (resolve, reject) {
        validator.validateStatement(description, data)
        .then(function (data) {
            db.get('SELECT tblVerb.caption as verb, tblActorType.caption as actor, tblActorType.id as actTypeID, tblObjectType.id as objTypeID, tblObjectType.caption as object, tblObjectType.tblName as objectTable, tblActorType.tblName as actorTable FROM tblStatementType INNER JOIN tblObjectType ON tblObjectType.id=object_type INNER JOIN tblActorType ON actor_type=tblActorType.id INNER JOIN tblVerb ON verb_id=tblVerb.id WHERE description = ?;', [description], function (err, row) {
                if(err)
                    reject(err);
                else {
                    if (row === undefined)
                        reject('undefined ' + description + ' statement');
                    else {
                        db.get(`SELECT * FROM ${row.objectTable} WHERE id=?`, data.object, function (err, obj) {
                            if(err)
                                reject(err);
                            else
                                if (obj === undefined)
                                    reject('undefined ' + data.object + ' object');
                                else
                                    if (obj.type !== row.objTypeID)
                                        reject('invalid object type for id=' + obj.id + ' type=' + row.object);
                                    else
                                        db.all(`SELECT id FROM ${row.actorTable} WHERE id IN ?`, data.actor, function (err, acts) {
                                            if(err)
                                                reject(err);
                                            else
                                                resolve(acts);
                                        })
                        });
                        //row.verb_id;
                        //row.actor_type;
                        //row.object_type;
                        //row.date_caption;
                        //row.description;
                        //row.attribute_type;
                    }
                }
            });
        })
        .catch(function (err) {
            reject(err);
        })
    })
};