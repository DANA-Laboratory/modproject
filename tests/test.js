/**
 * Created by AliReza on 5/12/2016.
 */
var assert = require('chai').assert;
var fs = require('fs');
var ddl = '\
    CREATE TABLE tblRequests (id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, manualId INTEGER NOT NULL, status INTEGER NOT NULL, description TEXT, requestType TEXT);\
    CREATE TABLE tblDiscipline (id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, requestId INTEGER NOT NULL, fromUser INTEGER NOT NULL, toUser INTEGER NOT NULL, time INTEGER NOT NULL);\
    CREATE TABLE tblRequestItems (id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, requestId  INTEGER NOT NULL, item TEXT, privilege TINYINT, ownerUser INTEGER NOT NULL, description TEXT, createTime  INTEGER NOT NULL, modifiedTime INTEGER);\
    CREATE TABLE tblActions (id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, requestId INTEGER NOT NULL, actionDescription STRING NOT NULL, actionTime INTEGER NOT NULL, actionUser INTEGER NOT NULL);\
    CREATE TABLE statements (pid INTEGER NOT NULL, date TEXT NOT NULL, data TEXT NOT NULL, PRIMARY KEY (pid, date));\
    CREATE TABLE config (id INTEGER PRIMARY KEY AUTOINCREMENT, itemName STRING NOT NULL, itemType INTEGER NOT NULL);\
    CREATE TABLE mapdetails (name STRING NOT NULL, x REAL NOT NULL, y REAL NOT NULL, type INTEGER, info TEXT);\
    CREATE TABLE requests (id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, owneritems TEXT, useritems TEXT, owner INTEGER NOT NULL, user INTEGER, status TEXT NOT NULL, initdate TEXT NOT NULL, inittime TEXT NOT NULL, enddate TEXT, endtime TEXT, description STRING, cancelwhy TEXT, startdate TEXT, starttime TEXT, canceldate TEXT, canceltime TEXT, canceluser INTEGER, startuser INTEGER, enduser INTEGER, applicant STRING NOT NULL, actiondescription TEXT, requesttype TEXT);\
    CREATE TABLE users (id INTEGER PRIMARY KEY, username STRING NOT NULL UNIQUE, password STRING NOT NULL, name STRING, family STRING, melicode STRING, pid STRING, isSysAdmin BOOLEAN NOT NULL DEFAULT (0), isItAdmin BOOLEAN NOT NULL DEFAULT (0), isMaliAdmin BOOLEAN NOT NULL DEFAULT (0), isItUser BOOLEAN DEFAULT (0) NOT NULL, isMaliUser BOOLEAN NOT NULL DEFAULT (0), isKarshenas BOOLEAN NOT NULL DEFAULT (0), isGuest BOOLEAN NOT NULL DEFAULT (0), isTeacher BOOLEAN NOT NULL DEFAULT (0), defaultpass STRING NOT NULL, email STRING)';
var dbpath = __dirname + '/testdb.sqlite3';
var modelsSqlite3 = require('../app/models-sqlite3');
var basedb = new (modelsSqlite3.basedb)(dbpath);
var requestModel = modelsSqlite3.requests;
describe('models-sqlite3', function() {
    before(function(done){
        if (fs.existsSync(dbpath)) {
            fs.unlinkSync(dbpath);
            done();
        } else {
            done();
        }
    });
    beforeEach(function(){
        // The beforeEach() callback gets run before each test in the suite.
    });
    it('basedb could create new db if not exists', function (done) {
        basedb.createdb(ddl, function (err) {
            assert.isNull(err);
            done();
        })
    });
    it('basedb returns an error if try to recreate existing db', function (done) {
        basedb.createdb(ddl, function (err) {
            assert.isNotNull(err);
            done();
        })
    });
    var creator = 1;
    it('create new request', function(done){
        requestModel.insertRequest(basedb.db, 0, 'description', 'contract', creator, function (err, requestId) {
            assert.isNull(err);
            this.requestId = requestId;
            done();
        });
    });
    it('finds where is a new request', function(done){
        requestModel.whereIs(basedb.db, requestId, function(err, userId) {
            assert.isNull(err);
            assert.equal(userId, creator);
            done();
        });
    });
    var sendto = 2;
    it('sends request to someone', function(done){
        requestModel.sendRequestTo(basedb.db, requestId, sendto, function(err) {
            assert.isNull(err);
            done();
        });
    });
    describe('working with items', function() {
        var description = 'item description';
        it('writes request item', function(done){
            requestModel.addRequestItem(basedb.db, requestId, 'testItem', 300, description, creator, function(err) {
                assert.isNull(err);
                done();
            });
        });
        it('donsn`t duplicate description', function(done){
            requestModel.addRequestItem(basedb.db, requestId, 'testItem2', 300, description, creator, function(err) {
                assert.isNotNull(err);
                done();
            });
        });
        it('reads request items', function(done){
            requestModel.getRequestItems(basedb.db, requestId, function(err, items) {
                assert.isNull(err);
                done();
            });
        });
        it('updates request item', function(done){
            requestModel.updateItem(basedb.db, requestId, description, 'testItem2', creator, function(err) {
                assert.isNull(err);
                done();
            });
        });
    });
    it('changes request status', function(done){
        requestModel.updateStatus(basedb.db, requestId, 1, 3, function(err) {
            assert.isNull(err);
            done();
        });
    });
    after(function(done) {
        basedb.disconnect(function() {
            fs.unlinkSync(dbpath);
            done();
        })
    });
});