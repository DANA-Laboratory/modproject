/**
 *  * Created by Reza Afzalan.
 e   */
'use strict';
var exec = require('child_process').exec;
var fs = require('fs');
var tmp = require('tmp');

function execute(command, callback) {
    exec(command, function (error, stdout) {callback(stdout); });
}
module.exports = function (app, dbma) {
    app.post('/mali/sendstatement', function (req, res) {
        if (((req.connection.remoteAddress === '172.18.1.10') || (req.connection.remoteAddress === '172.18.1.234')) && (req.body.pass === '123')) {
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
//        execute('rm /home/rfpc/modproject/xelatex/tmp*.*', function (out) {
//        });
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
            var path = '/home/rfpc/modproject/xelatex/';
            var tempname = tmp.tmpNameSync({template : path + 'tmp-XXXXXX.tex'});
            console.log(tempname);
            fs.writeFileSync(tempname, texcommand);
            fs.appendFileSync(tempname, fs.readFileSync(path + 'statement.tex'));
            execute('xelatex -interaction=batchmode -output-directory=' + path + ' ' + tempname,
                function (out) {
                    console.log(out);
                    res.sendFile(tempname.slice(0, -3) + 'pdf');
                }
            );
        };
        console.log(req.user.pid, req.body.date);
        dbma.get('SELECT data FROM statements WHERE pid=? AND date=?', [req.user.pid, req.body.date], callback);
    });
    
    app.get('/mali/list', function (req, res) {
        var callback = function (err, rows) {
            if (!err) {
                var dates = [];
                for (var i in rows) {
                    dates[i] = (rows[i].date);
                }
                res.json(dates);
            } else {
                console.log('Error get list of dates for pid=' + req.user.pid);
                res.sendStatus(400);
            }
        };
        dbma.all('SELECT date FROM statements WHERE pid=?', [req.user.pid], callback);
    });
};
