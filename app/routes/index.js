/**
 * Created by Reza Afzalan.
 */
'use strict';

var fs = require('fs');
console.log(__dirname);
var file = __dirname + '/../database/Requests.sqlite';
var exists = fs.existsSync(file);
var sqlite3 = null;
var db = null;
var appConfig = require('../config/appConfig.json');

if (!exists) {
    console.log('database not exists index.js!');
} else {
    sqlite3 = require('sqlite3').verbose();
    db = new sqlite3.Database(file);
    
    var setTasks = function (error, data) {
        appConfig.tasks = data;
    };
    
    var setRequestItems = function (error, data) {
        appConfig.requestItems = data;
    };
    
    var readAppConfig = function () {
        db.all('SELECT itemName as name, id FROM config WHERE itemType=0', setTasks);
        db.all('SELECT itemName as name, id FROM config WHERE itemType=1', setRequestItems);
    };
    
    readAppConfig();
}
module.exports = function (app, passport, io) {
    require('./passportRoutes')(app, passport, appConfig);
    require('./databaseRoutes')(app, io, appConfig, db);
    require('./mapRoutes')(app, db);
    require('./adminRoutes')(app, db, readAppConfig);
};
