/**
 * Created by AliReza on 5/12/2016.
 */
var assert = require('chai').assert;
var fs = require('fs');
var ddl = '\
    CREATE TABLE statements (pid INTEGER NOT NULL, date TEXT NOT NULL, data TEXT NOT NULL, PRIMARY KEY (pid, date));\
    CREATE TABLE config (id INTEGER PRIMARY KEY AUTOINCREMENT, itemName STRING NOT NULL, itemType INTEGER NOT NULL);\
    CREATE TABLE mapdetails (name STRING NOT NULL, x REAL NOT NULL, y REAL NOT NULL, type INTEGER, info TEXT);\
    CREATE TABLE requests (id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, owneritems TEXT, useritems TEXT, owner INTEGER NOT NULL, user INTEGER, status TEXT NOT NULL, initdate TEXT NOT NULL, inittime TEXT NOT NULL, enddate TEXT, endtime TEXT, description STRING, cancelwhy TEXT, startdate TEXT, starttime TEXT, canceldate TEXT, canceltime TEXT, canceluser INTEGER, startuser INTEGER, enduser INTEGER, applicant STRING NOT NULL, actiondescription TEXT, requesttype TEXT);\
    CREATE TABLE users (id INTEGER PRIMARY KEY, username STRING NOT NULL UNIQUE, password STRING NOT NULL, name STRING, family STRING, melicode STRING, pid STRING, isSysAdmin BOOLEAN NOT NULL DEFAULT (0), isItAdmin BOOLEAN NOT NULL DEFAULT (0), isMaliAdmin BOOLEAN NOT NULL DEFAULT (0), isItUser BOOLEAN DEFAULT (0) NOT NULL, isMaliUser BOOLEAN NOT NULL DEFAULT (0), isKarshenas BOOLEAN NOT NULL DEFAULT (0), isGuest BOOLEAN NOT NULL DEFAULT (0), isTeacher BOOLEAN NOT NULL DEFAULT (0), defaultpass STRING NOT NULL, email STRING)';
var dbpath = __dirname + '/testdb.sqlite3';
var basedb = new (require('../app/models-sqlite3/basedb'))(dbpath);
var contractModel = require('../app/models-sqlite3/contracts');
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
    it('basedb returns an error if try to recreate existing db', function () {
        basedb.createdb(ddl, function (err) {
            assert.isDefined(err);
        })
    });
    it('insertContract inserts new contract', function(){
        contractModel.insertContract(basedb.db, '', '', 0, 0, '', '', '', '', function (res, err) {
            assert.isUndefined(err);
        });
    });
    it('insertRequest inserts new request', function(){
        contractModel.insertRequest(basedb.db, '', '', 0, 0, '', '', '', '10', '', 'contract', function (res, err) {
             assert.isUndefined(err);
        });
    });
    after(function() {
        basedb.disconnect(function() {
            fs.unlinkSync(dbpath);
        })
    });
});