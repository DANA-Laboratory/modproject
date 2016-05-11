/**
 * Created by AliReza on 5/10/2016.
 */
var sqlite3 = require('sqlite3');
var fs = require('fs');
module.exports = function (dbname) {
    this.db = undefined;
    this.dbname = dbname;
    this.connect = function(callback) {
        if (!fs.existsSync(dbname)) {
            callback(dbname + ' not exists!');
        } else {
            db = new sqlite3.Database(dbname,
                sqlite3.OPEN_READWRITE,
                function(err) {
                    if (err) callback(err);
                    else callback();
                }
            )
        }
    }
    this.create = function(ddl, callback) {
        if (fs.existsSync(dbname)) {
            callback(dbname + ' exists!');
        } else {
            db = new sqlite3.Database(dbname,
                sqlite3.OPEN_CREATE,
                function(err) {
                    if (err) callback(err);
                    else callback();
                }
            )
        }
    }
    this.disconnect = function(callback) {
        callback();
    }
}
