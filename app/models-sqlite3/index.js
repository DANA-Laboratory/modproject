/**
 * Created by AliReza on 5/10/2016.
 */
exports.basedb = require('./basedb.js');
var requests = require('./requests.js');
var requestPermissions = require('./requestPermissions.js');

Object.keys(requests).forEach (function(req_f) {
    exports[req_f] = function (/*sqlite3.Database*/ db, /*RequestData*/ data) {
        return new Promise(function(resolve, reject) {
            if (requestPermissions.hasOwnProperty(req_f)) {
                requestPermissions[req_f](db, data)
                    .then(function(can){
                        requests[req_f](db, data, can)
                            .then(function(res){
                                resolve(res);
                            })
                            .catch(function(err){
                                reject(err);
                            });
                    })
                    .catch(function(err){
                        reject(err);
                    });
            } else {
                reject('permission to ' + req_f + 'is not defined');
            }
        });
    };
});
