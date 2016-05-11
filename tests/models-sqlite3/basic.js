/**
 * Created by AliReza on 5/10/2016.

    CREATE TABLE statements (pid INTEGER NOT NULL, date TEXT NOT NULL, data TEXT NOT NULL, PRIMARY KEY (pid, date));
    CREATE TABLE config (id INTEGER PRIMARY KEY AUTOINCREMENT, itemName STRING NOT NULL, itemType INTEGER NOT NULL);
    CREATE TABLE mapdetails (name STRING NOT NULL, x REAL NOT NULL, y REAL NOT NULL, type INTEGER, info TEXT);
    CREATE TABLE requests (id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, owneritems TEXT, useritems TEXT, owner INTEGER NOT NULL, user INTEGER, status TEXT NOT NULL, initdate TEXT NOT NULL, inittime TEXT NOT NULL, enddate TEXT, endtime TEXT, description STRING, cancelwhy TEXT, startdate TEXT, starttime TEXT, canceldate TEXT, canceltime TEXT, canceluser INTEGER, startuser INTEGER, enduser INTEGER, applicant STRING NOT NULL, actiondescription TEXT, requesttype TEXT);
    CREATE TABLE users (id INTEGER PRIMARY KEY, username STRING NOT NULL UNIQUE, password STRING NOT NULL, name STRING, family STRING, melicode STRING, pid STRING, isSysAdmin BOOLEAN NOT NULL DEFAULT (0), isItAdmin BOOLEAN NOT NULL DEFAULT (0), isMaliAdmin BOOLEAN NOT NULL DEFAULT (0), isItUser BOOLEAN DEFAULT (0) NOT NULL, isMaliUser BOOLEAN NOT NULL DEFAULT (0), isKarshenas BOOLEAN NOT NULL DEFAULT (0), isGuest BOOLEAN NOT NULL DEFAULT (0), isTeacher BOOLEAN NOT NULL DEFAULT (0), defaultpass STRING NOT NULL, email STRING);
*/
var testmalidb = new (require('../../app/models-sqlite3/basic'))('testmalidb.sqlite3')
var testrequestdb = new (require('../../app/models-sqlite3/basic'))('testrequestdb.sqlite3')
console.log('models-sqlite3 basic, tests done.');