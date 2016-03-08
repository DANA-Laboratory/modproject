/**
 *  * Created by Reza Afzalan.
 e   */
'use strict';
var path = require('path');
var glob = require('glob');
var xelatexapi = require(path.join(__dirname, '..', 'xelatexapi', 'xelatexapi.js'));
var mypassport = require('../passport/mypassport');

module.exports = function (app) {
    app.post('/contract/show', mypassport.ensureAuthenticated, function (req, res) {
        // TODO: shomare
        var dst = path.resolve(app.get('rootpath'), 'uploads/requests/' + req.body.id);
        var files = glob.sync(dst + '/6.*');
        var texcommand = '';
        if (files.length === 1) {
            texcommand += '\\def\\pathtosignature{' + files[0] + '}\n';
        } else {
            texcommand += '\\def\\pathtosignature{' + path.resolve(app.get('rootpath'), 'app/public/images/blanksignature.png') + '}\n';
        }
        console.log(files);
        console.log(texcommand);
        texcommand += '\\def\\shomare{33-2/' + req.body.description + ' ص پ}\n';
        texcommand += '\\def\\initdate{' + req.body.initdate + '}\n';
        for (var itm in req.body.useritems) {
            texcommand += '\\def\\' + itm + '{' + req.body.useritems[itm]  + '}\n';
        }
        for (itm in req.body.owneritems) {
            texcommand += '\\def\\' + itm + '{' + req.body.owneritems[itm]  + '}\n';
        }
        var contractpath = path.join(__dirname, '..', '..', 'xelatex', 'contract');
        var tempname = path.join(contractpath, req.body.useritems.melicode + '.tex');
        xelatexapi.writecommandexectex(tempname, texcommand, contractpath, 'TeacherContract.tex', function (pathtopdf) {res.sendFile(pathtopdf); });
    });
};
