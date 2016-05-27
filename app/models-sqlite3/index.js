/**
 * Created by AliReza on 5/10/2016.
 */
exports.basedb = require('./basedb.js');
var requests = require('./requests.js');
var requestPermissions = require('./requestPermissions.js');

Object.keys(requests).forEach (function(req_f) {
    exports[req_f] = function (/*sqlite3.Database*/ db, /*RequestData*/ data, callback) {
        var p;
        if (requestPermissions.hasOwnProperty(req_f)) {
            requestPermissions[req_f](db, data, function (err, can) {
                if (can) {
                    p = requests[req_f](db, data, callback, can);
                } else {
                    callback(err);
                }
            });
        } else {
            callback('permission to ' + req_f + 'is not defined');
        }
        return p;
    };
});
