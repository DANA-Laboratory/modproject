/**
 * Created by AliReza on 7/6/2016.
 */

var modelsSqlite3 = require('../app/models-sqlite3');
var fs = require('fs');
var assert = require('chai').assert;
var dbpath = __dirname + '/learnxdb.sqlite';
var basedb = new (modelsSqlite3.basedb)(dbpath);
var learnX = require('../app/models-sqlite3/learningx');
var CSVParser = require('../app/models-sqlite3/csv-parser');
var ddl = `
    --
    -- File generated with SQLiteStudio v3.0.6 on چهارشنبه ژوئيه 6 11:12:41 2016
    --
    -- Text encoding used: UTF-8
    --
    PRAGMA foreign_keys = off;
    BEGIN TRANSACTION;
    
    -- Table: tblStatements
    CREATE TABLE tblStatements (ID INTEGER PRIMARY KEY AUTOINCREMENT, Actor INTEGER REFERENCES tblActors (ID), Object INTEGER REFERENCES tblObjectTypes (ID), Verb INTEGER REFERENCES tblVerbs (ID), Time BIGINT NOT NULL, Attributes STRING);
    
    -- Table: tblClass
    CREATE TABLE tblClass (ID INTEGER PRIMARY KEY AUTOINCREMENT, TimeStart BIGINT NOT NULL, TimeEnd BIGINT NOT NULL, Course INTEGER REFERENCES tblCourse (ID), Attribute STRING);
    
    -- Table: tblStatementTypes
    CREATE TABLE tblStatementTypes (ID INTEGER PRIMARY KEY AUTOINCREMENT, VerbID INTEGER REFERENCES tblVerbs (ID) NOT NULL, ActorType INTEGER REFERENCES tblActorTypes (ID) NOT NULL, ObjectType INTEGER REFERENCES tblObjectTypes (ID) NOT NULL, DateCaption STRING, Description STRING NOT NULL, AttributeType STRING);
    INSERT INTO tblStatementTypes (ID, VerbID, ActorType, ObjectType, DateCaption, Description, AttributeType) VALUES (1, 1, 2, 1, 'زمان ورود', 'ورود کارآموز به محل کارآموزی یا کارورزی', NULL);
    INSERT INTO tblStatementTypes (ID, VerbID, ActorType, ObjectType, DateCaption, Description, AttributeType) VALUES (2, 2, 2, 1, 'زمان خروج', 'خروج کارآموز از محل کارآموزی یا کارورزی به دلیل ترخیص، اتمام دوره یا اخراج', '{status:["ترخیص","اخراج"]}');
    INSERT INTO tblStatementTypes (ID, VerbID, ActorType, ObjectType, DateCaption, Description, AttributeType) VALUES (3, 3, 2, 2, 'زمان قرار گرفتن', 'گروه بندی', NULL);
    INSERT INTO tblStatementTypes (ID, VerbID, ActorType, ObjectType, DateCaption, Description, AttributeType) VALUES (4, 4, 2, 3, 'زمان شروع', 'شرکت در کلاس آموزشی', NULL);
    INSERT INTO tblStatementTypes (ID, VerbID, ActorType, ObjectType, DateCaption, Description, AttributeType) VALUES (5, 5, 2, 3, 'زمان اتمام', 'اتمام کلاس آموزشی', '{result:0, status:["قبول","رد"]}');
    INSERT INTO tblStatementTypes (ID, VerbID, ActorType, ObjectType, DateCaption, Description, AttributeType) VALUES (6, 6, 2, 3, 'تاریخ غیبت', 'غیبت در کلاس آموزشی', NULL);
    INSERT INTO tblStatementTypes (ID, VerbID, ActorType, ObjectType, DateCaption, Description, AttributeType) VALUES (7, 7, 2, 3, 'زمان تنظیم', 'تنظیم روکش حق التدریس', NULL);
    INSERT INTO tblStatementTypes (ID, VerbID, ActorType, ObjectType, DateCaption, Description, AttributeType) VALUES (8, 8, 1, 3, 'زمان شروع', 'تدریس کلاس آموزشی', NULL);
    INSERT INTO tblStatementTypes (ID, VerbID, ActorType, ObjectType, DateCaption, Description, AttributeType) VALUES (9, 9, 1, 4, 'زمان ارزیابی', 'تکیل فرم ارزیابی کارآموزی', '{result:{}}');
    INSERT INTO tblStatementTypes (ID, VerbID, ActorType, ObjectType, DateCaption, Description, AttributeType) VALUES (10, 10, 2, 5, 'زمان آزمون ', 'طی کردن آزمون', '{result:{}}');
    INSERT INTO tblStatementTypes (ID, VerbID, ActorType, ObjectType, DateCaption, Description, AttributeType) VALUES (11, 6, 2, 1, 'تاریخ غیبت', 'غیبت در محل', NULL);
    
    -- Table: tblActorTypes
    CREATE TABLE tblActorTypes (ID INTEGER PRIMARY KEY AUTOINCREMENT, Caption STRING NOT NULL);
    INSERT INTO tblActorTypes (ID, Caption) VALUES (1, 'مدرس');
    INSERT INTO tblActorTypes (ID, Caption) VALUES (2, 'فرآگیر');
    
    -- Table: tblObjects
    CREATE TABLE tblObjects (ID INTEGER PRIMARY KEY AUTOINCREMENT, Type INTEGER NOT NULL REFERENCES tblObjectTypes (ID), ForeignKey INTEGER, Atributes STRING);
    
    -- Table: tblGroups
    CREATE TABLE tblGroups (ID INTEGER PRIMARY KEY AUTOINCREMENT, Caption TEXT NOT NULL);
    
    -- Table: tblActors
    CREATE TABLE tblActors (ID INTEGER PRIMARY KEY AUTOINCREMENT, type INTEGER NOT NULL REFERENCES tblActorTypes (ID), name STRING NOT NULL, family STRING NOT NULL, code STRING NOT NULL UNIQUE, attributes STRING);
    
    -- Table: tblGrouping
    CREATE TABLE tblGrouping (ID INTEGER PRIMARY KEY AUTOINCREMENT, "Group" INTEGER NOT NULL REFERENCES tblGroups (ID), Actors STRING);
    
    -- Table: tblCourse
    CREATE TABLE tblCourse (ID INTEGER PRIMARY KEY AUTOINCREMENT, Caption TEXT NOT NULL, Attributes STRING);
    
    -- Table: tblVerbs
    CREATE TABLE tblVerbs (ID INTEGER PRIMARY KEY AUTOINCREMENT, Caption STRING NOT NULL);
    INSERT INTO tblVerbs (ID, Caption) VALUES (1, 'وارد شد');
    INSERT INTO tblVerbs (ID, Caption) VALUES (2, 'خارج شد ');
    INSERT INTO tblVerbs (ID, Caption) VALUES (3, 'گروه بندی شد ');
    INSERT INTO tblVerbs (ID, Caption) VALUES (4, 'شرکت کرد');
    INSERT INTO tblVerbs (ID, Caption) VALUES (5, 'تمام کرد ');
    INSERT INTO tblVerbs (ID, Caption) VALUES (6, 'غیبت کرد');
    INSERT INTO tblVerbs (ID, Caption) VALUES (7, 'روکش تنظیم شد');
    INSERT INTO tblVerbs (ID, Caption) VALUES (8, 'تدریس کرد');
    INSERT INTO tblVerbs (ID, Caption) VALUES (9, 'ارزیابی شد');
    INSERT INTO tblVerbs (ID, Caption) VALUES (10, 'آزمون داد ');
    
    -- Table: tblObjectTypes
    CREATE TABLE tblObjectTypes (ID INTEGER PRIMARY KEY AUTOINCREMENT, Caption STRING NOT NULL);
    INSERT INTO tblObjectTypes (ID, Caption) VALUES (1, 'محل');
    INSERT INTO tblObjectTypes (ID, Caption) VALUES (2, 'گروه');
    INSERT INTO tblObjectTypes (ID, Caption) VALUES (3, 'کلاس');
    INSERT INTO tblObjectTypes (ID, Caption) VALUES (4, 'فرم ارزیابی');
    INSERT INTO tblObjectTypes (ID, Caption) VALUES (5, 'فرم آزمون');
    
    COMMIT TRANSACTION;
    PRAGMA foreign_keys = on;
`;

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
    var counter = 0;
    var counterCode = 0;
    it('add trainee', function (done) {
        learnX.getMaxCounter(basedb.db, 'tblActors', 'code', 'test000')
            .then(function (res) {
                basedb.beginTransaction();
                var csvParser = new (CSVParser)(function(err, record, count){
                    if(!err) {
                        var actorData = {};
                        actorData.type = 'فرآگیر';
                        actorData.name = record.first_name;
                        actorData.family = record.last_name;
                        counterCode += 1;
                        actorData.code = 'test' + (res + counterCode).substr(-1 * res.length);
                        delete record.first_name;
                        delete record.last_name;
                        actorData.attributes=JSON.stringify(record);
                        learnX.addActor(basedb.db, actorData)
                            .then(function (res) {
                                counter += 1;
                                if (count == counter) {
                                    console.log(counter, ' is the last');
                                    basedb.db.exec("COMMIT");
                                    learnX.getMaxCounter(basedb.db, 'tblActors', 'code', 'test000')
                                        .then(function (res) {
                                            assert.equal(res, '500');
                                            done();
                                        })
                                }
                            })
                            .catch(function (err) {
                                counter += 1;
                                console.log(counter, err);
                                if (count == counter) {
                                    console.log(counter, ' is the last');
                                    basedb.commitTransaction();
                                    done();
                                }
                            });
                    } else {
                        console.log(err);
                    }
                });
                csvParser.read(__dirname + '/fs_read.csv');
            })
            .catch(function (err) {
                console.log(err);
            });
    });
/*
    it('add teacher', function (done) {

    });
    it('add course', function (done) {

    });
    it('add class', function (done) {

    });
    it('add group', function (done) {

    });
    it('remove trainee', function (done) {

    });
    it('remove teacher', function (done) {

    });
    it('remove course', function (done) {

    });
    it('remove class', function (done) {

    });
    it('remove group', function (done) {

    });
    it('add trainee to group', function (done) {

    });
    it('program a class for group', function (done) {

    });
*/
    after(function (done) {
        basedb.disconnect(function (err) {
            fs.unlinkSync(dbpath);
            done();
        })
    });
});