/**
 * Created by AliReza on 5/10/2016.
 */
'use strict';
var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
module.exports = function (dbname) {
    this.db = undefined;
    this.dbname = dbname;
    this.connect = function(callback) {
        if (!fs.existsSync(dbname)) {
            callback(dbname + ' not exists!');
        } else {
            this.db = new sqlite3.Database(dbname,
                sqlite3.OPEN_READWRITE,
                function(err) {
                    if (err) callback(err);
                    else callback();
                }
            )
        }
    };
    this.createdb = function(ddl, callback) {
        if (fs.existsSync(dbname)) {
            callback(dbname + ' exists!');
        } else {
            this.db = new sqlite3.Database(dbname, function (err) {
                if (err) {
                    callback('could not create database');
                } else {
                    this.exec(ddl, function (err) {
                        if (err) {
                            console.log(err);
                            callback('create tables error');
                        } else {
                            callback(null);
                        }
                    });
                }
            });
        }
    };
    this.disconnect = function(callback) {
        this.db.close(callback);
    }
};
