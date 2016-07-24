/**
 * Created by AliReza on 5/10/2016.
 */
'use strict';
var sqlite3 = require('sqlite3');
var fs = require('fs');
class DBExtend extends sqlite3.Database {
    constructor(dbname, ddl, callback) {
        super(dbname,
            (err) => {
                if (err) {
                    callback('could not create database err : ' + err);
                } else {
                    if (ddl) {
                        this.exec(ddl, function (err) {
                            if (err) {
                                callback('create tables error with : ' + err);
                            } else {
                                callback(null);
                            }
                        });
                    } else {
                        callback(null);
                    }
                }
            }
        );

        this.getRecord = function (tblName, data) {
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
                    err ? reject('getRecord failed with : ' + err) : resolve(row);
                });
            });
        };
        this.matchRecords = function (tblName, data) {
            return new Promise((resolve, reject) => {
                var where = '';
                for (var key of Object.keys(data)) {
                    if (where.length > 0)
                        where += ' AND ';
                    where += key + ` LIKE '%${data[key]}%'`;
                }
                this.all(`SELECT * FROM ${tblName} WHERE ${where}`, [], function (err, rows) {
                    err ? reject('matchRecords failed with : ' + err) : resolve(rows);
                });
            });
        };
        this.deleteRecords = function (tblName, data) {
            return new Promise((resolve, reject) => {
                var jdata = JSON.stringify(data);
                this.run(`DELETE FROM ${tblName} WHERE id IN (?)`, jdata.substr(1, jdata.length - 2), function (err) {
                    err ? reject('deleteRecords failed with : ' + err) : resolve();
                });
            });
        };
    };
}

module.exports = function (dbname, ddl, callback) {
    if(!ddl) {
        if (!fs.existsSync(dbname)) {
            callback(dbname + ' not exists!');
            return {};
        }
    } else {
        if (fs.existsSync(dbname)) {
            callback(dbname + ' exists!');
            return {};
        }
    }
    return (new DBExtend(dbname, ddl, callback));
};
