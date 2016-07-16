/**
 * Created by AliReza on 5/26/2016.
 */

var modelsSqlite3 = require('../app/models-sqlite3');
var fs = require('fs');
var dbToImport = require('../app/models-sqlite3/importer.js');
var assert = require('chai').assert;
var dbpath = __dirname + '/testdb.sqlite3';
var basedb = new (modelsSqlite3.basedb)(dbpath);
var olddbpath = __dirname + '/Requests.sqlite';
var olddb = new (modelsSqlite3.basedb)(olddbpath);
var ddl = '\
    CREATE TABLE tblRequests (id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, manualId INTEGER NOT NULL, status INTEGER NOT NULL, requestType TEXT);\
    CREATE TABLE tblDiscipline (id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, requestId INTEGER NOT NULL, fromUser INTEGER NOT NULL, toUser INTEGER NOT NULL, time INTEGER NOT NULL);\
    CREATE TABLE tblRequestItems (id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, requestId  INTEGER NOT NULL, item TEXT, privilege TINYINT, ownerUser INTEGER NOT NULL, description TEXT, createTime  INTEGER NOT NULL, modifiedTime INTEGER);\
    CREATE TABLE tblActions (id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, requestId INTEGER NOT NULL, action STRING NOT NULL, actionTime INTEGER NOT NULL, actionUser INTEGER NOT NULL, actionComment TEXT);';

describe('do import', function() {
    before(function (done) {
        if (fs.existsSync(dbpath)) {
            fs.unlinkSync(dbpath);
        }
        basedb.createdb(ddl, function (err) {
            assert.isNull(err);
            done();
        })
    });
    it('olddb could connect', function (done) {
        olddb.connect(done);
    });
    it('import old requests', function (done) {
        basedb.beginTransaction();
        this.timeout(200000);
        dbToImport(olddb.db, function (err, oldData) {
            assert.isNull(err);
            oldData.forEach(function (oldRequest, i, arr) {
                var tmpData = {
                    requestType: oldRequest.requestType,
                    userId: oldRequest.actionUsers[0],
                    actionComment: oldRequest.actionComment[0],
                    actionTime: oldRequest.militimes[0]
                };
                modelsSqlite3.insertRequest(basedb.db, tmpData).then(function (requestId) {
                    if (requestId === arr.length) {
                        basedb.commitTransaction();
                        done();
                    }
                });
            });
        });
    });
    after(function (done) {
        basedb.disconnect(function () {
            fs.unlinkSync(dbpath);
            done();
        })
    });
});