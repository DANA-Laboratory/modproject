/**
 * Created by AliReza on 7/6/2016.
 */

var modelsSqlite3 = require('../app/models-sqlite3');
var fs = require('fs');
var assert = require('chai').assert;
var dbpath = __dirname + '/learnxdb.sqlite';
var basedb = null;
var learnX = require('../app/models-sqlite3/learningx');

var ddl = `
    --
    -- File generated with SQLiteStudio v3.0.6 on چهارشنبه ژوئيه 6 11:12:41 2016
    --
    -- Text encoding used: UTF-8
    --
    PRAGMA foreign_keys = off;
    BEGIN TRANSACTION;
    
    -- Table: tblStatements
    CREATE TABLE tblStatements (id INTEGER PRIMARY KEY AUTOINCREMENT, actor INTEGER REFERENCES tblActors (id), object INTEGER REFERENCES tblObjectTypes (id), verb INTEGER REFERENCES tblVerbs (id), time BIGINT NOT NULL, attributes STRING);
    
    -- Table: tblClass
    CREATE TABLE tblClass (id INTEGER PRIMARY KEY AUTOINCREMENT, timeStart BIGINT NOT NULL, timeEnd BIGINT NOT NULL, course INTEGER REFERENCES tblCourse (id), attribute STRING);
    
    -- Table: tblStatementTypes
    CREATE TABLE tblStatementTypes (id INTEGER PRIMARY KEY AUTOINCREMENT, VerbID INTEGER REFERENCES tblVerbs (id) NOT NULL, actorType INTEGER REFERENCES tblActorTypes (id) NOT NULL, object_type INTEGER REFERENCES tblObjectTypes (id) NOT NULL, date_caption STRING, description STRING NOT NULL, attribute_type STRING);
    INSERT INTO tblStatementTypes (id, VerbID, actorType, object_type, date_caption, description, attribute_type) VALUES (1, 1, 2, 1, 'زمان ورود', 'ورود کارآموز به محل کارآموزی یا کارورزی', NULL);
    INSERT INTO tblStatementTypes (id, VerbID, actorType, object_type, date_caption, description, attribute_type) VALUES (2, 2, 2, 1, 'زمان خروج', 'خروج کارآموز از محل کارآموزی یا کارورزی به دلیل ترخیص، اتمام دوره یا اخراج', '{status:["ترخیص","اخراج"]}');
    INSERT INTO tblStatementTypes (id, VerbID, actorType, object_type, date_caption, description, attribute_type) VALUES (3, 3, 2, 2, 'زمان قرار گرفتن', 'گروه بندی', NULL);
    INSERT INTO tblStatementTypes (id, VerbID, actorType, object_type, date_caption, description, attribute_type) VALUES (4, 4, 2, 3, 'زمان شروع', 'شرکت در کلاس آموزشی', NULL);
    INSERT INTO tblStatementTypes (id, VerbID, actorType, object_type, date_caption, description, attribute_type) VALUES (5, 5, 2, 3, 'زمان اتمام', 'اتمام کلاس آموزشی', '{result:0, status:["قبول","رد"]}');
    INSERT INTO tblStatementTypes (id, VerbID, actorType, object_type, date_caption, description, attribute_type) VALUES (6, 6, 2, 3, 'تاریخ غیبت', 'غیبت در کلاس آموزشی', NULL);
    INSERT INTO tblStatementTypes (id, VerbID, actorType, object_type, date_caption, description, attribute_type) VALUES (7, 7, 2, 3, 'زمان تنظیم', 'تنظیم روکش حق التدریس', NULL);
    INSERT INTO tblStatementTypes (id, VerbID, actorType, object_type, date_caption, description, attribute_type) VALUES (8, 8, 1, 3, 'زمان شروع', 'تدریس کلاس آموزشی', NULL);
    INSERT INTO tblStatementTypes (id, VerbID, actorType, object_type, date_caption, description, attribute_type) VALUES (9, 9, 1, 4, 'زمان ارزیابی', 'تکیل فرم ارزیابی کارآموزی', '{result:{}}');
    INSERT INTO tblStatementTypes (id, VerbID, actorType, object_type, date_caption, description, attribute_type) VALUES (10, 10, 2, 5, 'زمان آزمون ', 'طی کردن آزمون', '{result:{}}');
    INSERT INTO tblStatementTypes (id, VerbID, actorType, object_type, date_caption, description, attribute_type) VALUES (11, 6, 2, 1, 'تاریخ غیبت', 'غیبت در محل', NULL);
    
    -- Table: tblActorTypes
    CREATE TABLE tblActorTypes (id INTEGER PRIMARY KEY AUTOINCREMENT, caption STRING NOT NULL);
    INSERT INTO tblActorTypes (id, caption) VALUES (1, 'مدرس');
    INSERT INTO tblActorTypes (id, caption) VALUES (2, 'فرآگیر');
    
    -- Table: tblObjects
    CREATE TABLE tblObjects (id INTEGER PRIMARY KEY AUTOINCREMENT, type INTEGER NOT NULL REFERENCES tblObjectTypes (id), foreignKey INTEGER, attributes STRING);
    
    -- Table: tblGroups
    CREATE TABLE tblGroups (id INTEGER PRIMARY KEY AUTOINCREMENT, caption TEXT NOT NULL);
    
    -- Table: tblActors
    CREATE TABLE tblActors (id INTEGER PRIMARY KEY AUTOINCREMENT, type INTEGER NOT NULL REFERENCES tblActorTypes (id), name STRING NOT NULL, family STRING NOT NULL, code STRING NOT NULL UNIQUE, attributes STRING);
    
    -- Table: tblGrouping
    CREATE TABLE tblGrouping (id INTEGER PRIMARY KEY AUTOINCREMENT, caption INTEGER NOT NULL REFERENCES tblGroups (id), actors STRING);
    
    -- Table: tblCourse
    CREATE TABLE tblCourse (id INTEGER PRIMARY KEY AUTOINCREMENT, caption TEXT NOT NULL, attributes STRING);
    
    -- Table: tblVerbs
    CREATE TABLE tblVerbs (id INTEGER PRIMARY KEY AUTOINCREMENT, caption STRING NOT NULL);
    INSERT INTO tblVerbs (id, caption) VALUES (1, 'وارد شد');
    INSERT INTO tblVerbs (id, caption) VALUES (2, 'خارج شد ');
    INSERT INTO tblVerbs (id, caption) VALUES (3, 'گروه بندی شد ');
    INSERT INTO tblVerbs (id, caption) VALUES (4, 'شرکت کرد');
    INSERT INTO tblVerbs (id, caption) VALUES (5, 'تمام کرد ');
    INSERT INTO tblVerbs (id, caption) VALUES (6, 'غیبت کرد');
    INSERT INTO tblVerbs (id, caption) VALUES (7, 'روکش تنظیم شد');
    INSERT INTO tblVerbs (id, caption) VALUES (8, 'تدریس کرد');
    INSERT INTO tblVerbs (id, caption) VALUES (9, 'ارزیابی شد');
    INSERT INTO tblVerbs (id, caption) VALUES (10, 'آزمون داد ');
    
    -- Table: tblObjectTypes
    CREATE TABLE tblObjectTypes (id INTEGER PRIMARY KEY AUTOINCREMENT, caption STRING NOT NULL);
    INSERT INTO tblObjectTypes (id, caption) VALUES (1, 'محل');
    INSERT INTO tblObjectTypes (id, caption) VALUES (2, 'گروه');
    INSERT INTO tblObjectTypes (id, caption) VALUES (3, 'کلاس');
    INSERT INTO tblObjectTypes (id, caption) VALUES (4, 'فرم ارزیابی');
    INSERT INTO tblObjectTypes (id, caption) VALUES (5, 'فرم آزمون');
    
    COMMIT TRANSACTION;
    PRAGMA foreign_keys = on;
`;
function transferActorData(record) {
    var data = {};
    data.name = record.first_name;
    data.family = record.last_name;
    delete record.first_name;
    delete record.last_name;
    data.attributes=JSON.stringify(record);
    return data;
}
function transferCourseData(record) {
    var data = {};
    data.caption = record.COURSE_TITLE;
    delete record.caption;
    data.attributes=JSON.stringify(record);
    return data;
}
describe('do import', function() {
    before(function (done) {
        if (fs.existsSync(dbpath)) {
            fs.unlinkSync(dbpath);
        }
        basedb = new (modelsSqlite3.basedb)(dbpath, ddl, function (err) {
            assert.isNull(err);
            done();
        });
    });
    it('import teachers', function (done) {
        var startCode = 'teau/0000';
        learnX.importActorsFromCSV(basedb, startCode, 'مدرس', __dirname + '/au-500.testcsv', transferActorData)
            .then(function (count) {
                learnX.getMaxCounter(basedb, 'tblActors', 'code', startCode)
                    .then(function (maxCounter) {
                        assert.equal(maxCounter, 'teau/0' + count);
                        done();
                    })
            })
            .catch(function (err) {
                console.log(err);
                assert.isNull(err);
                done();
            });
    });
    var inserted = 0;
    it('import trainees', function (done) {
        var startCode = 'trus/0000';
        learnX.importActorsFromCSV(basedb, startCode, 'فرآگیر', __dirname + '/us-500.testcsv', transferActorData)
            .then(function (count) {
                learnX.getMaxCounter(basedb, 'tblActors', 'code', startCode)
                    .then(function (maxCounter) {
                        assert.equal(maxCounter, 'trus/0' + count);
                        inserted = count;
                        done();
                    })
            })
            .catch(function (err) {
                console.log(err);
                assert.isNull(err);
                done();
            });
    });
    it('import trainees append', function (done) {
        var startCode = 'teau/0000';
        learnX.importAppendActorsFromCSV(basedb, startCode, 'فرآگیر', __dirname + '/ca-500.testcsv', transferActorData)
            .then(function (count) {
                learnX.getMaxCounter(basedb, 'tblActors', 'code', startCode)
                    .then(function (maxCounter) {
                        assert.equal(maxCounter, 'teau/' + (inserted + count));
                        done();
                    })
            })
            .catch(function (err) {
                console.log(err);
                assert.isNull(err);
                done();
            });
    });
    it('import course', function (done) {
        learnX.importCoursesFromCSV(basedb, __dirname + '/allpoly_2017courseslist_20160713.testcsv', transferCourseData)
            .then(function (count) {
                    assert.equal(count, 232);
                    done();
            })
            .catch(function (err) {
                console.log(err);
                assert.isNull(err);
                done();
            });
    });
    it('get record by id', function (done) {
        basedb.getRecord('tblCourse', {id: 1})
            .then(function (res) {
                assert.equal(res.id, 1);
                return basedb.getRecord('tblActors', {name: 'Rebbecca', family: 'Didio'});
            })
            .then(function (res) {
                assert.equal(res.name, 'Rebbecca');
                done();
            })
            .catch(function (err) {
                console.log(err);
                assert.isNull(err);
                done();
            });
    });
    it('find records', function (done) {
        basedb.matchRecords('tblCourse', {attributes: 'NYP'})
            .then(function (res) {
                assert.equal(res.length, 49);
                return basedb.matchRecords('tblActors', {attributes: '"phone1":"07-9997-3366"'});
            })
            .then(function (res) {
                assert.equal(res.length, 1);
                return basedb.matchRecords('tblActors', {attributes: learnX.getSearchStrForAttribute({phone1 : "07-9997-3366"})});
            })
            .then(function (res) {
                assert.equal(res.length, 1);
                done();
            })
            .catch(function (err) {
                console.log(err);
                assert.isNull(err);
                done();
            });
    });
    it('delete records', function (done) {
        basedb.deleteRecords('tblCourse', [1,3,12])
            .then(function (res) {
                done();
            })
            .catch(function (err) {
                console.log(err);
                assert.isNull(err);
                done();
            });
    });
    /*
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
        basedb.close(function (err) {
            fs.unlinkSync(dbpath);
            done();
        })
    });
});