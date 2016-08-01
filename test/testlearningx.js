/**
 * Created by AliReza on 7/6/2016.
 */

var modelsSqlite3 = require('../app/models-sqlite3');
var fs = require('fs');
var assert = require('chai').assert;
var dbpath = __dirname + '/learnxdb.sqlite';
var basedb = null;
var learnX = require('../app/models-sqlite3/LearningX');
var ddl = `
    --
    -- File generated with SQLiteStudio v3.0.6 on چهارشنبه ژوئيه 6 11:12:41 2016
    --
    -- Text encoding used: UTF-8
    --
    PRAGMA foreign_keys = off;
    BEGIN TRANSACTION;
      
    -- Table: tblClass
    CREATE TABLE tblClass (id INTEGER PRIMARY KEY AUTOINCREMENT, timeStart BIGINT NOT NULL, timeEnd BIGINT NOT NULL, courseId INTEGER REFERENCES tblCourse (id), code TEXT NOT NULL UNIQUE, attribute STRING);
    
    -- Table: tblCourse
    CREATE TABLE tblCourse (id INTEGER PRIMARY KEY AUTOINCREMENT, caption TEXT NOT NULL, code TEXT NOT NULL UNIQUE, attribute STRING);
     
    -- Table: tblStatement
    CREATE TABLE tblStatement (id INTEGER PRIMARY KEY AUTOINCREMENT, actor INTEGER REFERENCES tblActors (id), object INTEGER REFERENCES tblObjectType (id), verb INTEGER REFERENCES tblVerbs (id), time BIGINT NOT NULL, attribute TEXT);
    
    -- Table: tblStatementType
    CREATE TABLE tblStatementType (id INTEGER PRIMARY KEY AUTOINCREMENT, verb_id INTEGER REFERENCES tblVerbs (id) NOT NULL, actor_type INTEGER REFERENCES tblActorType (id) NOT NULL, object_type INTEGER REFERENCES tblObjectTypes (id) NOT NULL, date_caption STRING, description STRING NOT NULL, attribute_type STRING);
    INSERT INTO tblStatementType (id, verb_id, actor_type, object_type, date_caption, description, attribute_type) VALUES (1, 1, 2, 1, 'زمان ورود', 'ورود کارآموز به محل کارآموزی یا کارورزی', NULL);
    INSERT INTO tblStatementType (id, verb_id, actor_type, object_type, date_caption, description, attribute_type) VALUES (2, 2, 2, 1, 'زمان خروج', 'خروج کارآموز از محل کارآموزی یا کارورزی به دلیل ترخیص، اتمام دوره یا اخراج', '{status:["ترخیص","اخراج"]}');
    INSERT INTO tblStatementType (id, verb_id, actor_type, object_type, date_caption, description, attribute_type) VALUES (3, 3, 2, 2, 'زمان قرار گرفتن', 'گروه بندی', NULL);
    INSERT INTO tblStatementType (id, verb_id, actor_type, object_type, date_caption, description, attribute_type) VALUES (4, 4, 2, 3, 'زمان شروع', 'شرکت در کلاس آموزشی', NULL);
    INSERT INTO tblStatementType (id, verb_id, actor_type, object_type, date_caption, description, attribute_type) VALUES (5, 5, 2, 3, 'زمان اتمام', 'اتمام کلاس آموزشی', '{result:0, status:["قبول","رد"]}');
    INSERT INTO tblStatementType (id, verb_id, actor_type, object_type, date_caption, description, attribute_type) VALUES (6, 6, 2, 3, 'تاریخ غیبت', 'غیبت در کلاس آموزشی', NULL);
    INSERT INTO tblStatementType (id, verb_id, actor_type, object_type, date_caption, description, attribute_type) VALUES (7, 7, 2, 3, 'زمان تنظیم', 'تنظیم روکش حق التدریس', NULL);
    INSERT INTO tblStatementType (id, verb_id, actor_type, object_type, date_caption, description, attribute_type) VALUES (8, 8, 1, 3, 'زمان شروع', 'تدریس کلاس آموزشی', NULL);
    INSERT INTO tblStatementType (id, verb_id, actor_type, object_type, date_caption, description, attribute_type) VALUES (9, 9, 1, 4, 'زمان ارزیابی', 'تکیل فرم ارزیابی کارآموزی', '{result:{}}');
    INSERT INTO tblStatementType (id, verb_id, actor_type, object_type, date_caption, description, attribute_type) VALUES (10, 10, 2, 5, 'زمان آزمون ', 'طی کردن آزمون', '{result:{}}');
    INSERT INTO tblStatementType (id, verb_id, actor_type, object_type, date_caption, description, attribute_type) VALUES (11, 6, 2, 1, 'تاریخ غیبت', 'غیبت در محل', NULL);
    
    -- Table: tblActorType
    CREATE TABLE tblActorType (id INTEGER PRIMARY KEY AUTOINCREMENT, caption TEXT NOT NULL, tblName TEXT NOT NULL);
    INSERT INTO tblActorType (id, caption, tblName) VALUES (1, 'مدرس', 'tblActor');
    INSERT INTO tblActorType (id, caption, tblName) VALUES (2, 'فرآگیر', 'tblActor');
    
    -- Table: tblActor
    CREATE TABLE tblActor (id INTEGER PRIMARY KEY AUTOINCREMENT, type INTEGER NOT NULL REFERENCES tblActorType (id), name STRING NOT NULL, family STRING NOT NULL, code TEXT NOT NULL UNIQUE, attribute STRING);
    
    -- Table: tblGroup
    CREATE TABLE tblGroup (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL UNIQUE);
            
    -- Table: tblVerb
    CREATE TABLE tblVerb (id INTEGER PRIMARY KEY AUTOINCREMENT, caption STRING NOT NULL);
    INSERT INTO tblVerb (id, caption) VALUES (1, 'وارد شد');
    INSERT INTO tblVerb (id, caption) VALUES (2, 'خارج شد ');
    INSERT INTO tblVerb (id, caption) VALUES (3, 'گروه بندی شد ');
    INSERT INTO tblVerb (id, caption) VALUES (4, 'شرکت کرد');
    INSERT INTO tblVerb (id, caption) VALUES (5, 'تمام کرد ');
    INSERT INTO tblVerb (id, caption) VALUES (6, 'غیبت کرد');
    INSERT INTO tblVerb (id, caption) VALUES (7, 'روکش تنظیم شد');
    INSERT INTO tblVerb (id, caption) VALUES (8, 'تدریس کرد');
    INSERT INTO tblVerb (id, caption) VALUES (9, 'ارزیابی شد');
    INSERT INTO tblVerb (id, caption) VALUES (10, 'آزمون داد ');

    -- Table: tblObjectType
    CREATE TABLE tblObjectType (id INTEGER PRIMARY KEY AUTOINCREMENT, caption TEXT NOT NULL, tblName TEXT NOT NULL);
    INSERT INTO tblObjectType (id, caption, tblName) VALUES (1, 'محل', 'tblObject');
    INSERT INTO tblObjectType (id, caption, tblName) VALUES (2, 'گروه', 'tblGroup');
    INSERT INTO tblObjectType (id, caption, tblName) VALUES (3, 'کلاس', 'tblClass');
    INSERT INTO tblObjectType (id, caption, tblName) VALUES (4, 'فرم ارزیابی', 'tblObject');
    INSERT INTO tblObjectType (id, caption, tblName) VALUES (5, 'فرم آزمون', 'tblObject');

    -- Table: tblObject
    CREATE TABLE tblObject (id INTEGER PRIMARY KEY AUTOINCREMENT, type INTEGER NOT NULL REFERENCES tblObjectTypes (id), attribute STRING);
    
    COMMIT TRANSACTION;
    PRAGMA foreign_keys = on;
`;
function transferActorData(record) {
    var data = {};
    data.name = record.first_name;
    data.family = record.last_name;
    delete record.first_name;
    delete record.last_name;
    data.attribute = JSON.stringify(record);
    return data;
}
function transferCourseData(record) {
    var data = {};
    data.caption = record.COURSE_TITLE;
    delete record.caption;
    data.attribute = JSON.stringify(record);
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
                learnX.getMaxCounter(basedb, 'tblActor', 'code', startCode)
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
                learnX.getMaxCounter(basedb, 'tblActor', 'code', startCode)
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
                learnX.getMaxCounter(basedb, 'tblActor', 'code', startCode)
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
        var startCode = 'cur/0000';
        learnX.importCoursesFromCSV(basedb, startCode, __dirname + '/allpoly_2017courseslist_20160713.testcsv', transferCourseData)
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
    it('get record by value', function (done) {
        basedb.getRecord('tblCourse', {id: 1})
            .then(function (res) {
                assert.equal(res.id, 1);
                return basedb.getRecord('tblActor', {name: 'Rebbecca', family: 'Didio'});
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
        basedb.matchRecords('tblCourse', {attribute: 'NYP'})
            .then(function (res) {
                assert.equal(res.length, 49);
                return basedb.matchRecords('tblActor', {attribute: '"phone1":"07-9997-3366"'});
            })
            .then(function (res) {
                assert.equal(res.length, 1);
                return basedb.matchRecords('tblActor', {attribute: learnX.getSearchStrForAttribute({phone1 : "07-9997-3366"})});
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
    it('remove course', function (done) {
        learnX.removeCourse(basedb, [1,3,12])
        .then(function (res) {
            done();
        })
        .catch(function (err) {
            console.log(err);
            assert.isNull(err);
            done();
        });
    });
    it('add course', function (done) {
        learnX.addCourse(basedb, {caption: 'test course', code : 'crs001', attribute : JSON.stringify({})})
        .then(function (res) {
            assert.equal(res, 233);
            done();
        });
    });
    it('add actor', function (done) {
        let data = {name : 'name', family : 'family', code : 'trn001', attribute : '{}', type : 'فرآگیر'};
        learnX.addActor(basedb, data)
        .then(function (res) {
            assert.equal(res, 1501);
            done();
        })
        .catch(function (err) {
            console.log(err);
            assert.isNull(err);
            done();
        });
    });
    it('append actor', function (done) {
        let data = {name : 'name', family : 'family', code : 'trn001', attribute : '{}', type : 'فرآگیر'};
        learnX.appendActor(basedb, data, 'trn001')
        .then(function (res) {
            assert.equal(res, 1502);
            done();
        })
        .catch(function (err) {
            console.log(err);
            assert.isNull(err);
            done();
        });
    });
    it('append class', function (done) {
        learnX.appendClass(basedb, {timeStart : Date.now(), timeEnd : Date.now() + 10000, courseId : 99, attribute : JSON.stringify({})}, 'cls001')
        .then(function (res) {
            assert.equal(res, 1);
            done();
        })
    });
    it('add class', function (done) {
        learnX.addClass(basedb, {timeStart : Date.now(), timeEnd : Date.now() + 10000, courseId : 99, code : 'cls002', attribute : JSON.stringify({})})
        .then(function (res) {
            assert.equal(res, 2);
            done();
        })
    });
    it('add group', function (done) {
        learnX.addGroup(basedb, {code: 'D12'})
        .then(function (res) {
            assert.equal(res, 1);
            done();
        })
    });
    it('reject undefined statement caption', function (done) {
        learnX.addStatement(basedb, 'undef', {})
        .catch(function (err) {
            assert.isNotNull(err);
            done();
        });
    });
    it('add trainee to group', function (done) {
        let data = {object : 1, actor : [1,2,3,4,5,6,7]};
        learnX.addStatement(basedb, 'گروه بندی', data)
            .then(function (res) {
                assert.equal(res, data.actor.length);
                done();
            })
            .catch(function (err) {
                assert.isNull(err);
                done();
            });
    });
    /*
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