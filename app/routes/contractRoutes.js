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
        var texcommand = '\\def\\shomare{/33-2 ص پ' + req.body.description + '}\n';
        for (var itm in req.body.useritems) {
            texcommand = texcommand + '\\def\\' + itm + '{' + req.body.useritems[itm]  + '}\n';
        }
        for (itm in req.body.owneritems) {
            texcommand = texcommand + '\\def\\' + itm + '{' + req.body.owneritems[itm]  + '}\n';
        }
        var contractpath = path.join(__dirname, '..', '..', 'xelatex', 'contract');
        var tempname = path.join(contractpath, req.body.useritems.melicode + '.tex');
        console.log(tempname);
        xelatexapi.writecommandexectex(tempname, texcommand, contractpath, 'TeacherContract.tex', function (pathtopdf) {res.sendFile(pathtopdf); });
    });
};
