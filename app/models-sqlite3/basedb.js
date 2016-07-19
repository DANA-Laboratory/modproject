/**
 * Created by AliReza on 5/10/2016.
 */
'use strict';
var sqlite3 = require('sqlite3');
var fs = require('fs');
class DBExtend extends sqlite3.Database {
    constructor(dbname, ddl, callback) {
        if(!ddl) {
            if (!fs.existsSync(dbname)) {
                callback(dbname + ' not exists!');
            } else {
                super(dbname,
                    sqlite3.OPEN_READWRITE,
                    function(err) {
                        if (err) callback(err);
                        else callback();
                    }
                );
            }
        } else {
            if (fs.existsSync(dbname)) {
                callback(dbname + ' exists!');
            } else {
                super(dbname, (err) => {
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
        }
        this.getRecord = function(tblName, data) {
            return new Promise((resolve, reject) => {
                var where = '';
                var param = [];
                for (var key of Object.keys(data)) {
                    if (where.length > 0)
                        where += ' AND ';
                    where += key + ' = ?';
                    param.push(data[key]);
                }
                this.get(`SELECT * FROM ${tblName} WHERE ${where}`, param, function (err, row) {
                    err ? reject(err) : resolve(row);
                });
            });
        };
        this.matchRecords = function(tblName, data) {
            return new Promise((resolve, reject) => {
                var where = '';
                for (var key of Object.keys(data)) {
                    if (where.length > 0)
                        where += ' AND ';
                    where += key + ` LIKE '%${data[key]}%'`;
                }
                this.all(`SELECT * FROM ${tblName} WHERE ${where}`, [], function (err, rows) {
                    err ? reject(err) : resolve(rows);
                });
            });
        };
    };
}

module.exports = function (dbname, ddl, callback) {
    return (new DBExtend(dbname, ddl, callback));
};
