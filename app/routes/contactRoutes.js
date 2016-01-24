/**
 *  * Created by Reza Afzalan.
 e   */
'use strict';
//console.log('__dirname2=', __dirname);
/*var exec = require('child_process').exec;
  var fs = require('fs');
  var path = require('path');

function execute(command, callback) {
    exec(command, function (error, stdout) {callback(stdout); });
}
*/
module.exports = function (app) {
    app.post('/contact/show', function (req, res) {
        for (var prop in req.body) {
            console.log(prop + '=' + req.body[prop]);
        }
        res.sendStatus(400);
    });
};
