/**
 *  * Created by Reza Afzalan.
 e   */
'use strict';
var path = require('path');
var xelatexapi = require(path.join(__dirname, '..', 'xelatexapi', 'xelatexapi.js'));
var mypassport = require('../passport/mypassport');

module.exports = function (app) {
    app.post('/contract/show', mypassport.ensureAuthenticated, function (req, res) {
        // TODO: shomare
        var texcommand = '\\def\\shomare{ص پ/2-33}\n';
        for (var itm in req.body.requestitems) {
            texcommand = texcommand + '\\def\\' + itm + '{' + req.body.requestitems[itm]  + '}\n';
        }
        for (itm in req.body.requesttasks) {
            texcommand = texcommand + '\\def\\' + itm + '{' + req.body.requesttasks[itm]  + '}\n';
        }
        var contractpath = path.join(__dirname, '..', '..', 'xelatex', 'contract');
        var tempname = path.join(contractpath, req.body.requestitems.melicode + '.tex');
        console.log(tempname);
        xelatexapi.writecommandexectex(tempname, texcommand, contractpath, 'TeacherContract.tex', function (pathtopdf) {res.sendFile(pathtopdf); });
    });
};