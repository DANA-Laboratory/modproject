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
        var texcommand = '\\def\\shomare{ص پ 33-2/1}\n';
        for (var itm in req.body) {
            texcommand = texcommand + '\\def\\'+ itm +'{' + req.body[itm]  + '}\n';
        };
        var contractpath = path.join(__dirname, '..', '..', 'xelatex', 'contract');
        var tempname = path.join(contractpath, req.body.melicode + '_' + charcodeat(req.body.initdate) + '.tex');
        console.log(tempname);
        xelatexapi.writecommandexectex(tempname, texcommand, contractpath, 'TeacherContract.tex', function (pathtopdf) {res.sendFile(pathtopdf); });
    });
};
function charcodeat(s) {
    var ret = 0;
    for (var i = 1; i < s.length; i++) {
        ret += s.charCodeAt(i);
    }
    return ret;
};