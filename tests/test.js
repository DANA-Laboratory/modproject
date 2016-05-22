/**
 * Created by AliReza on 5/12/2016.
 */
function RequestData() {
    this.description= 'description';
    this.requestType= 'contract';

    this.requestId= 1;
    this.userId= 0;
    this.toUser= 2;

    this.itemDescription= 'item description';
    this.requestItem='{test : 100}';
    this.itemPrivilege= 220;
    this.ownerUser= 1;

    this.actionDescription= '';
    this.status= 3;
};

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
        data = new RequestData();
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
    it('create new request', function(done){
        requestModel.insertRequest(basedb.db, data, function (err, requestId) {
            assert.isNull(err);
            assert.equal(1, requestId);
            done();
        });
    });
    it('add request', function(done){
        requestModel.insertRequest(basedb.db, data, function (err, requestId) {
            assert.isNull(err);
            assert.equal(2, requestId);
            done();
        });
    });
    it('finds where is a new request', function(done){
        requestModel.whereIs(basedb.db, {requestId : 1}, function(err, userId) {
            assert.isNull(err);
            assert.equal(userId, data.userId);
            done();
        });
    });

    it('doesn`t send untouchable request', function(done){
        data.userId= 1;
        requestModel.sendRequestTo(basedb.db, data, function(err) {
            assert.equal(err, 'that is not here, you can`t touch that');
            done();
        });
    });

    it('sends request to someone', function(done){
        data.toUser= 2;
        requestModel.sendRequestTo(basedb.db, data, function(err) {
            assert.isNull(err);
            done();
        });
    });

    describe('working with items', function() {
        it('writes request item', function(done){
            requestModel.addItem(basedb.db, data, function(err) {
                assert.isNull(err);
                done();
            });
        });
        it('doesn`t duplicate description', function(done){
            requestModel.addItem(basedb.db, data, function(err) {
                assert.isNotNull(err);
                done();
            });
        });
        it('dosen`t read other`s request items', function(done){
            requestModel.getItems(basedb.db, data, function(err, items) {
                assert.equal(err, 'user don`t have permission to get this request items');
                done();
            });
        });
        it('reads request items', function(done){
            data.userId= data.toUser;
            requestModel.getItems(basedb.db, data, function(err, items) {
                assert.isNull(err);
                assert.equal(items.length, 1);
                assert.equal(items[0], data.requestItem);
                done();
            });
        });
        it('doesn`t update untouchable request item', function(done){
            requestModel.updateItem(basedb.db, data, function(err) {
                assert.equal(err, 'that is not here, you can`t touch that');
                done();
            });
        });
        it('updates request item', function(done){
            data.userId = data.toUser;
            data.requestItem = {test : 200};
            requestModel.updateItem(basedb.db, data, function(err) {
                assert.isNull(err);
                done();
            });
        });
    });
    it('doesn`t change status of untouchable request', function(done){
        requestModel.updateStatus(basedb.db, data, function(err) {
            assert.equal(err, 'that is not here, you can`t touch that');
            done();
        });
    });
    it('changes status of touchable request', function(done){
        data.userId = data.toUser;
        requestModel.updateStatus(basedb.db, data, function(err) {
            assert.isNull(err);
            done();
        });
    });
    it('get dashboard', function (done) {
        data.userId = data.toUser;
        requestModel.getDashboard(basedb.db, data, function(err, dashboard) {
            assert.isNull(err);
            done();
        });
    });
    it('doesn`t remove working request', function (done) {
        requestModel.rmRequest(basedb.db, data, function(err) {
            assert.equal(err, 'only just created requests could removed by creator');
            done();
        });
    });
    it('removes request', function (done) {
        data.requestId = 2;
        requestModel.rmRequest(basedb.db, data, function(err) {
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