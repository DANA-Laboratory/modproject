/**
 * Created by Reza Afzalan.
 */
'use strict';
var fs = require('fs');
//console.log('__dirname=', __dirname);
var requestdb = __dirname + '/../database/Requests.sqlite';
var malidb = __dirname + '/../database/Mali.sqlite';
var exists1 = fs.existsSync(requestdb);
var exists2 = fs.existsSync(malidb);
var sqlite3 = require('sqlite3').verbose();
var dbre = null;
function dbref() {
    return dbre;
}
var dbma = null;
function dbmaf() {
    return dbma;
}
var appConfig = require('../config/appConfig.json');
var readAppConfig = null;

function initializerequests() {
    if (!exists1) {
        console.log('request database not exists index.js!');
    } else {
        dbre = new sqlite3.Database(requestdb);

        var setTasks = function (error, data) {
            appConfig.tasks = data;
        };

        var setuseritems = function (error, data) {
            appConfig.useritems = data;
        };

        readAppConfig = function () {
            dbre.all('SELECT itemName as name, id FROM config WHERE itemType=0', setTasks);
            dbre.all('SELECT itemName as name, id FROM config WHERE itemType=1', setuseritems);
        };

        readAppConfig();
    }

    console.log('initializing requestdb.......');
}

if (!exists2) {
    console.log('mali database not exists index.js!');
} else {
    dbma = new sqlite3.Database(malidb);
}

initializerequests();

module.exports = function (app, passport, io) {
    require('./passportRoutes')(app, passport, appConfig);
    require('./databaseRoutes')(app, io, appConfig, dbref);
    require('./mapRoutes')(app, dbref);
    require('./usersRoutes')(app, dbref, readAppConfig, initializerequests);
    require('./maliRoutes')(app, dbmaf);
    require('./contractRoutes')(app);
    require('./filemanRoutes')(app, dbref);
};
