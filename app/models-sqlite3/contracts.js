/**
 * Created by AliReza on 5/13/2016.
 */
'use strict';
var findMaxContract = function(/*sqlite3.Database*/ db, callback) {
    db.get('SELECT MAX(description) as newshomare FROM requests WHERE (requesttype="contract")', function (err, row) {
        if (err) {
            callback('select max description err=', err);
        } else {
            var newId = 1;
            if (typeof(row) !== 'undefined') {
                newId = row.newshomare + 1;
            }
            callback(newId);
        }
    });
};
exports.insertContract = function(/*sqlite3.Database*/ db, useritems, owneritems, owner, user, status, initdate, inittime, applicant, callback) {
    findMaxContract(db, function(newId, err) {
        if(!err) {
            this.insertRequest(useritems,owneritems,owner,user,status,initdate,inittime,newId,applicant,'contract', callback);
        } else {
            callback(newId, err);
        }
    });
};
exports.insertRequest = function(/*sqlite3.Database*/ db, useritems, owneritems, owner, user, status, initdate, inittime, description, applicant, requesttype, callback) {
    db.run('INSERT INTO requests (useritems,owneritems,owner,user,status,initdate,inittime,description,applicant,requesttype) VALUES (?,?,?,?,?,?,?,?,?,?)', [useritems, owneritems, owner, user, status, initdate, inittime, description, applicant, requesttype], function (err) {
        callback('insert request error=', err);
    });
};
exports.updateContractByKarshenas = function(owneritems, useritems, id, user, callback) {
    db().run('UPDATE requests SET owneritems=?, useritems=? WHERE (id=? AND user=?)', [owneritems, useritems, id, user], function (err) {
        callback('update contract by karshenas error=', err);
    });
};
exports.updateContractByOwner = function(owneritems, id, owner, callback) {
    db().run('UPDATE requests SET owneritems=? WHERE (id=? AND owner=?)', [owneritems, id, owner], function (err) {
        callback('update contract by owner error=', err);
    });
};
exports.updateRequestByUser = function (useritems, description, id, user, callback) {
    db().run('UPDATE requests SET useritems=?, description=? WHERE (id=? AND user=?)', [useritems, description, id, user], function (err) {
        callback('update request by user error=', err);
    });
};