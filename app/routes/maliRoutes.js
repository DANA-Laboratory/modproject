/**
 *  * Created by Reza Afzalan.
 e   */
'use strict';
//console.log('__dirname2=', __dirname);

var path = require('path');
var xelatexapi = require(path.join(__dirname, '..', 'xelatexapi', 'xelatexapi.js'));

module.exports = function (app, dbma) {
    app.post('/mali/sendstatement', function (req, res) {
		// TODO: remove hardcoded pass, use userpass instead
        if (((req.connection.remoteAddress === '172.18.1.10') || (req.connection.remoteAddress === '172.18.1.234')) && (req.body.pass === '02122315')) {
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
            dbma.serialize(function () {
                for (var id in req.body.datas) {
                    var d = req.body.datas[id];
                    if (req.body.overwrite === 'True') {
                        dbma.run('DELETE FROM statements WHERE (pid=? AND date=?)', [d[0], req.body.date], callbackdelete);
                    }
                    dbma.run('INSERT INTO statements (pid,date,data) VALUES (?,?,?)', [d[0], req.body.date, JSON.stringify(d)], callback);
                }
            });
            res.sendStatus(200);
        } else {
            res.sendStatus(400);
            console.log(req.connection.remoteAddress);
        }
    });
    app.post('/mali/show', function (req, res) {
        var pid = '';
        if (req.user.isMaliAdmin) {
            pid = req.body.pid;
        } else {
            pid = req.user.pid;
        }
        var callback = function (err, row) {
            var stmdata = JSON.parse(row.data);
            var texcommand = '\\def\\ya{' + req.body.date  + '}\n';
            var j = 98;
            var achar = 'y';
            for (var i in stmdata) {
                texcommand = texcommand + '\\def\\' + achar + String.fromCharCode(j) + '{' + stmdata[i]  + '}\n';
                j += 1;
                if (j === 123) {
                    j = 97;
                    achar = 'z';
                }
            }
            var statementpath = path.join(__dirname, '..', '..', 'xelatex', 'statement');
            var tempname = path.join(statementpath, pid + '_' + charcodeat(req.body.date) + '.tex');
            console.log(tempname);
            xelatexapi.writecommandexectex(tempname, texcommand, statementpath, 'statement.tex', function (pathtopdf) {res.sendFile(pathtopdf); });
        };
        dbma.get('SELECT data FROM statements WHERE pid=? AND date=?', [pid, req.body.date], callback);
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
            dbma.all('SELECT DISTINCT pid FROM statements', callbackpid);
            dbma.all('SELECT DISTINCT date FROM statements', callbackdate);
        } else {
            dbma.all('SELECT date FROM statements WHERE pid=?', [req.user.pid], callbackdate);
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
