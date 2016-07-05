--
-- File generated with SQLiteStudio v3.0.6 on سه شنبه ژوئيه 5 03:03:13 2016
--
-- Text encoding used: UTF-8
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- Table: tblObjectTypes
CREATE TABLE tblObjectTypes (ID INTEGER PRIMARY KEY AUTOINCREMENT, Caption STRING NOT NULL);
INSERT INTO tblObjectTypes (ID, Caption) VALUES (1, 'دوره کارآموزی');
INSERT INTO tblObjectTypes (ID, Caption) VALUES (2, 'کلاس آموزشی');
INSERT INTO tblObjectTypes (ID, Caption) VALUES (3, 'دوره کاروزی');

-- Table: tblGrouping
CREATE TABLE tblGrouping (ID INTEGER PRIMARY KEY AUTOINCREMENT, "Group" INTEGER NOT NULL REFERENCES tblGroups (ID), Actors STRING);
INSERT INTO tblGrouping (ID, "Group", Actors) VALUES (1, 1, '[102]');

-- Table: tblActorTypes
CREATE TABLE tblActorTypes (ID INTEGER PRIMARY KEY AUTOINCREMENT, Caption STRING NOT NULL);
INSERT INTO tblActorTypes (ID, Caption) VALUES (21, 'مدرس');
INSERT INTO tblActorTypes (ID, Caption) VALUES (22, 'کارآموز');

-- Table: tblVerbs
CREATE TABLE tblVerbs (ID INTEGER PRIMARY KEY AUTOINCREMENT, Caption STRING NOT NULL);
INSERT INTO tblVerbs (ID, Caption) VALUES (1, 'ثبت نام شد');
INSERT INTO tblVerbs (ID, Caption) VALUES (2, 'ترخیص شد');
INSERT INTO tblVerbs (ID, Caption) VALUES (3, 'شرکت کرد');
INSERT INTO tblVerbs (ID, Caption) VALUES (4, 'غیبت کرد');
INSERT INTO tblVerbs (ID, Caption) VALUES (5, 'نمره گرفت');
INSERT INTO tblVerbs (ID, Caption) VALUES (6, 'تدریس کرد');
INSERT INTO tblVerbs (ID, Caption) VALUES (7, 'اخراج شد');
INSERT INTO tblVerbs (ID, Caption) VALUES (8, 'گروه بندی شد');
INSERT INTO tblVerbs (ID, Caption) VALUES (9, 'ارزیابی شد');
INSERT INTO tblVerbs (ID, Caption) VALUES (10, 'آزمون داد');
INSERT INTO tblVerbs (ID, Caption) VALUES (11, 'روکش تنظیم شد');

-- Table: tblGroups
CREATE TABLE tblGroups (ID INTEGER PRIMARY KEY AUTOINCREMENT, Caption TEXT NOT NULL);
INSERT INTO tblGroups (ID, Caption) VALUES (1, 'TG');

-- Table: tblStatements
CREATE TABLE tblStatements (ID INTEGER PRIMARY KEY AUTOINCREMENT, Actor INTEGER REFERENCES tblActors (ID), Object INTEGER REFERENCES tblObjectTypes (ID), Verb INTEGER REFERENCES tblVerbs (ID), Time BIGINT NOT NULL, Attributes STRING);

-- Table: tblObjects
CREATE TABLE tblObjects (ID INTEGER PRIMARY KEY AUTOINCREMENT, Type INTEGER NOT NULL REFERENCES tblObjectTypes (ID), ForeignKey INTEGER, Atributes STRING);

-- Table: tblActors
CREATE TABLE tblActors (ID INTEGER PRIMARY KEY AUTOINCREMENT, Type INTEGER REFERENCES tblActorTypes (ID), Name STRING, Family STRING, Code STRING, Attributes STRING);
INSERT INTO tblActors (ID, Type, Name, Family, Code, Attributes) VALUES (101, 22, 'صفدر', 'حسینی', 35, '{}');
INSERT INTO tblActors (ID, Type, Name, Family, Code, Attributes) VALUES (102, 21, 'کمال', 'احمدی', 10001, '{}');

-- Table: tblClass
CREATE TABLE tblClass (ID INTEGER PRIMARY KEY AUTOINCREMENT, TimeStart BIGINT NOT NULL, TimeEnd BIGINT NOT NULL, Course INTEGER REFERENCES tblCourse (ID), Attribute STRING);
INSERT INTO tblClass (ID, TimeStart, TimeEnd, Course, Attribute) VALUES (1, 1467664306348, 1467665306348, 1, '{}');

-- Table: tblCourse
CREATE TABLE tblCourse (ID INTEGER PRIMARY KEY AUTOINCREMENT, Caption TEXT NOT NULL, Attributes STRING);
INSERT INTO tblCourse (ID, Caption, Attributes) VALUES (1, 'آموزش بانکداری', '{}');

COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
