/**
 *  * Created by Reza Afzalan.
 e   */
'use strict';
//console.log('__dirname2=', __dirname);

var path = require('path');
var xelatexapi = require(path.join(__dirname, '..', 'xelatexapi', 'xelatexapi.js'));
var addhroroof = require('./addadhoroof.js');

module.exports = function (app, dbma) {
    app.post('/mali/sendstatement', function (req, res) {
		// TODO: remove hardcoded pass, use userpass instead
        console.log('mali data recive.....');
        if (((req.connection.remoteAddress === '::ffff:172.18.1.10') || (req.connection.remoteAddress === '172.18.1.234')) && (req.body.pass === '02122315')) {
            console.log('you can have enough privilege to send mali data');
            var callback = function (err) {
                if (err) {
                    console.log('insert statements error=', err);
                }
            };
            var callbackdelete = function (err) {
                if (err) {
                    console.log('delete statements error=', err);
                }
            };
            if (req.body.newformat) {
                var date = req.body.date;
                dbma().serialize(function () {
                    for (var id in req.body.datas) {
                        var d = req.body.datas[id];
                        var header;
                        if (id === '0') {
                            header = req.body.datas[id];
                        } else {
                            var pid = d['کد پرسنلی'];
                            d.header = header;
                            if (typeof pid !== 'undefined' && pid !== null) {
                                if (req.body.overwrite) {
                                    dbma().run('DELETE FROM statements WHERE (pid=? AND date=?)', [pid, date], callbackdelete);
                                }
                                dbma().run('INSERT INTO statements (pid,date,data) VALUES (?,?,?)', [pid, date, JSON.stringify(d)], callback);
                            }
                        }
                    }
                });
                res.sendStatus(200);
            } else {
                dbma().serialize(function () {
                    for (var id in req.body.datas) {
                        var d = req.body.datas[id];
                        if (req.body.overwrite === 'True') {
                            dbma().run('DELETE FROM statements WHERE (pid=? AND date=?)', [d[0], req.body.date], callbackdelete);
                        }
                        dbma().run('INSERT INTO statements (pid,date,data) VALUES (?,?,?)', [d[0], req.body.date, JSON.stringify(d)], callback);
                    }
                });
                res.sendStatus(200);
            }
        } else {
            res.sendStatus(400);
            console.log(req.connection.remoteAddress);
        }
    });
    app.post('/statement/show', function (req, res) {
        var pid = '';
        if (req.user.isMaliAdmin) {
            pid = req.body.pid;
        } else {
            pid = req.user.pid;
        }
        var callback = function (err, row) {
            var stmdata = JSON.parse(row.data);
            if (stmdata.newformat) {
                var clm1 = [];
                var clm2 = [];
                var clm3 = [];
                var clms = [clm1, clm2, clm3];
                var clmno = 2;
                var j = 0;
                var texdef = '\\def\\ya{' + req.body.date  + '}\n';
                for (var i in stmdata.header) {
                    var val = stmdata[stmdata.header[i]];
                    if (typeof val !== 'undefined' && val !== null) {
                        if (stmdata.header[i] === 'جمع مزایا' || stmdata.header[i] === 'جمع کسور' || stmdata.header[i] === 'خالص پرداختی') {
                            if (stmdata.header[i] === 'جمع مزایا') {
                                texdef += '\\def\\zz{' + val  + '}\n';
                            }
                            if (stmdata.header[i] === 'جمع کسور') {
                                texdef += '\\def\\zg{' + val  + '}\n';
                            }
                            if (stmdata.header[i] === 'خالص پرداختی') {
                                texdef += '\\def\\zx{' + val  + '}\n';
                                texdef += '\\def\\zy{' + addhroroof(val.replace(/,/g, ''))  + '}\n';
                            }
                        } else {
                            if (stmdata.header[i] === 'نام و کد پرسنلی' || stmdata.header[i] === 'کد پرسنلی') {
                                if (stmdata.header[i] === 'کد پرسنلی') {
                                    texdef += '\\def\\yb{' + val  + '}\n';
                                }
                                if (stmdata.header[i] === 'نام و کد پرسنلی') {
                                    texdef += '\\def\\yc{' + val  + '}\n';
                                }
                            } else {
                                (clms[clmno])[j++] = stmdata.header[i] + ' & ' + val;
                            }
                        }
                        if (stmdata.header[i] === 'جمع مزایا') {
                            j = 0;
                            clmno = 1;
                        }
                        if (stmdata.header[i] === 'حقوق پایه') {
                            j = 0;
                            clmno = 0;
                        }
                    }
                }
                var textable = '';
                for (i = 1; i <= Math.max(clm1.length, clm2.length, clm3.length); i++) {
                    var str1 = clm1.length - i >= 0 ? clm1[clm1.length - i] : '\\dsh & \\dsh';
                    var str2 = clm2.length - i >= 0 ? clm2[clm2.length - i] : '\\dsh & \\dsh';
                    var str3 = clm3.length - i >= 0 ? clm3[clm3.length - i] : '\\dsh & \\dsh';
                    textable += (str1 + ' & ' + str2 + ' & ' + str3 + '\\\\ \n');
                }
                var statementpath = path.join(__dirname, '..', '..', 'xelatex', 'statement');
                var tempname = path.join(statementpath, pid + '_' + charcodeat(req.body.date) + '.tex');
                console.log(tempname);
                xelatexapi.writeNewcommandexectex(tempname, texdef, textable, statementpath, 'newStatementHeader.tex', 'newStatementFooter.tex', function (pathtopdf) {res.sendFile(pathtopdf); });

            } else {
                var texcommand = '\\def\\ya{' + req.body.date  + '}\n';
                var k = 98;
                var achar = 'y';
                for (var ii in stmdata) {
                    texcommand = texcommand + '\\def\\' + achar + String.fromCharCode(k) + '{' + stmdata[ii]  + '}\n';
                    k += 1;
                    if (k === 123) {
                        k = 97;
                        achar = 'z';
                    }
                }
                var oldstatementpath = path.join(__dirname, '..', '..', 'xelatex', 'statement');
                var statementtemplate = stmdata.length === 47 ? 'statement.tex' : 'statement4.tex';
                var oldtempname = path.join(oldstatementpath, pid + '_' + charcodeat(req.body.date) + '.tex');
                console.log(oldtempname);
                xelatexapi.writecommandexectex(oldtempname, texcommand, oldstatementpath, statementtemplate, function (pathtopdf) {res.sendFile(pathtopdf); });
            }
        };
        dbma().get('SELECT data FROM statements WHERE pid=? AND date=?', [pid, req.body.date], callback);
    });

    app.get('/mali/list', function (req, res) {
        var data = {};
        var callbackpid = function (err, rows) {
            if (!err) {
                var pids = [];
                for (var i in rows) {
                    pids[i] = (rows[i].pid);
                }
                data.pids = pids;
                if (data.dates) {
                    res.json(data);
                }
            } else {
                console.log('Error get list of pid for pid=' + req.user.pid);
                res.sendStatus(400);
            }
        };
        var callbackdate = function (err, rows) {
            if (!err) {
                var dates = [];
                for (var i in rows) {
                    dates[i] = (rows[i].date);
                }
                data.dates = dates;
                if (!req.user.isMaliAdmin) {
                    data.pids = [req.user.pid];
                    res.json(data);
                } else {
                    if (data.pids) {
                        res.json(data);
                    }
                }
            } else {
                console.log('Error get list of dates for pid=' + req.user.pid);
            }
        };
        if (req.user.isMaliAdmin) {
            dbma().all('SELECT DISTINCT pid FROM statements', callbackpid);
            dbma().all('SELECT DISTINCT date FROM statements', callbackdate);
        } else {
            dbma().all('SELECT date FROM statements WHERE pid=?', [req.user.pid], callbackdate);
        }
    });

    function charcodeat(s) {
        var ret = 0;
        for (var i = 1; i < s.length; i++) {
            ret += s.charCodeAt(i);
        }
        return ret;
    }
};
