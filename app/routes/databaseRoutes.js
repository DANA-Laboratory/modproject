/**
 * Created by Reza Afzalan.
 */
'use strict';
var mypassport = require('../passport/mypassport');
//var path = require('path');

module.exports = function (app, io, appConfig, db) {

    var replaceIDwithNameFamily = function (row) {
        var userAccounts = mypassport.userAccounts();
        for (var user in userAccounts) {
            if (userAccounts[user].id === row.owner) {
                row.owner = userAccounts[user].name + ' ' + userAccounts[user].family;
            }
            if (userAccounts[user].id === row.user) {
                row.user = userAccounts[user].name + ' ' + userAccounts[user].family;
            }
            if (userAccounts[user].id === row.canceluser) {
                row.canceluser = userAccounts[user].name + ' ' + userAccounts[user].family;
            }
            if (userAccounts[user].id === row.enduser) {
                row.enduser = userAccounts[user].name + ' ' + userAccounts[user].family;
            }
        }
    };

    var formatdata = function (row) {
        //replaceIDwithNameFamily
        replaceIDwithNameFamily(row);
        row.init = row.initdate !== null ? row.initdate + ' ' + row.inittime : '-';
        row.end = row.enddate !== null ? row.enddate + ' ' + row.endtime : '-';
        row.start = row.startdate !== null ? row.startdate + ' ' + row.starttime : '-';

        //remove formats from string
        if (row.requesttype === 'contract') {
            var useritems = JSON.parse(row.useritems);
            row.useritems = 'تکمیل قرارداد به مبلغ ' + useritems.mablagh + ' ریال ' + ' به ازای هر ' + useritems.mablaghtype + ' به مدت ' + useritems.moddat + ' روز' + ' از تاریخ ' + useritems.startdate;
            switch (row.status) {
            case appConfig.status[0]:
                row.owneritems = 'انتظار تکمیل';
                break;
            case appConfig.status[1]:
                row.owneritems = 'تکمیل گردید، انتظار چاپ';
                break;
            case appConfig.status[2]:
                row.owneritems = 'چاپ شده';
                break;
            case appConfig.status[3]:
                row.owneritems = 'رد شده';
                break;
            }
        } else {
            if (row.owneritems !== null) {
                row.owneritems = row.owneritems.replace(/[\"\[\]]/g, ' ');
            }
            if (row.useritems !== null) {
                row.useritems = row.useritems.replace(/[\"\[\]]/g, ' ');
            }
        }
    };

    app.get('/data/nsidebar', mypassport.ensureAuthenticated, function (req, res) {
        var ret = [];
        var callback = function (err, row) {
            ret.push(row.count);
            if (ret.length === 2 * appConfig.status.length) {
                res.json(ret);
            }
        };
        db().serialize(function () {
            for (var status in appConfig.status) {
                db().get('SELECT count(id) as count from requests where status=\'' + appConfig.status[status]  + '\'AND owner<>' + req.user.id + ' AND user=' + req.user.id, callback);
                db().get('SELECT count(id) as count from requests where status=\'' + appConfig.status[status]  + '\' AND owner=' + req.user.id, callback);
            }
        });
    });

    app.get('/data/table/:type/:status/:isreceive', mypassport.ensureAuthenticated, function (req, res) {
        var callback = function (err, rows) {
            if (err) {
                console.log('get table data fails: ', err);
            } else {
                for (var row in rows) {
                    formatdata(rows[row]);
                }
                res.json(rows);
            }
        };
        var status = parseInt(req.params.status, 10);
        if (status > 3) {
            status -= 4;
        }
        db().all('SELECT * from requests where ((((not ?) AND (owner<>' + req.user.id + ' AND user=' + req.user.id  + ')) OR ((?) AND (owner=' + req.user.id + '))) AND (((status=\'' + appConfig.status[0] + '\' OR status=\'' + appConfig.status[1] + '\') AND ?<0) OR status=?) AND (requesttype=? OR ?=\'ALL\'))', [req.params.isreceive, req.params.isreceive, status, appConfig.status[status], req.params.type, req.params.type], callback);
    });

    app.post('/data/updateowneritems/:requestID', mypassport.ensureAuthenticated, function (req, res) {
        var callback = function (err) {
            console.log('update updateowneritems error=', err);
            res.sendStatus(200);
        };
        db().run('UPDATE requests SET owneritems=? WHERE (owner=? AND id=?)', [JSON.stringify(req.body.owneritems), req.user.id, req.params.requestID], callback);
    });

    app.post('/data/updatestatus/:requestID', mypassport.ensureAuthenticated, function (req, res) {
        var callback = function (err) {
            console.log('update status error=', err);
            io.emit('update');
            res.sendStatus(200);
        };
        if (req.body.status === appConfig.status[1]) {
            db().run('UPDATE requests SET status=?, startdate=?, starttime=?, startuser=? WHERE id=?', [req.body.status, req.body.actiondate, req.body.actiontime, req.user.id, req.params.requestID], callback);
        }
        if (req.body.status === appConfig.status[2]) {
            db().run('UPDATE requests SET status=?, enddate=?, endtime=?, enduser=?, actiondescription=? WHERE id=?', [req.body.status, req.body.actiondate, req.body.actiontime, req.user.id, req.body.actiondescription, req.params.requestID], callback);
        }
        if (req.body.status === appConfig.status[3]) {
            db().run('UPDATE requests SET status=?, canceldate=?, canceltime=?, actiondescription=?, canceluser=? WHERE id=?', [req.body.status, req.body.actiondate, req.body.actiontime, req.body.cancelwhy, req.user.id, req.params.requestID], callback);
        }
    });

    app.post('/data/insertrequest', mypassport.ensureAuthenticated, function (req, res) {
        var callback = function (err) {
            console.log('insert request error=', err);
            io.emit('update');
            res.sendStatus(200);
        };
        if (req.body.requesttype === 'contract') {
            db().get('SELECT MAX(description) as newshomare FROM requests WHERE (requesttype="contract")', function (err, row) {
                if (err) {
                    console.log('select max description err=', err);
                    res.sendStatus(200);
                } else {
                    var newshomare = 1;
                    if (typeof(row) !== 'undefined') {
                        newshomare = row.newshomare + 1;
                    }
                    db().run('INSERT INTO requests (useritems,owneritems,owner,user,status,initdate,inittime,description,applicant,requesttype) VALUES (?,?,?,?,?,?,?,?,?,?)', [JSON.stringify(req.body.useritems), JSON.stringify(req.body.owneritems), mypassport.findIdByMeliCode(req.body.useritems.melicode), req.user.id, appConfig.status[0], req.body.initdate, req.body.inittime, newshomare, req.body.useritems.melicode, req.body.requesttype], callback);
                }
            });
        } else {
            db().run('INSERT INTO requests (useritems,owner,user,status,initdate,inittime,description,applicant,requesttype) VALUES (?,?,?,?,?,?,?,?,?)', [JSON.stringify(req.body.useritems), mypassport.ownerRowID(), req.user.id, appConfig.status[0], req.body.initdate, req.body.inittime, req.body.description, req.body.applicant, req.body.requesttype], callback);
        }

    });

    app.post('/data/updaterequest', mypassport.ensureAuthenticated, function (req, res) {
        var callback = function (err) {
            console.log('update request error=', err);
            res.sendStatus(200);
        };
        if (req.body.requesttype === 'contract') {
            if (req.user.isKarshenas) {
                db().run('UPDATE requests SET owneritems=?, useritems=? WHERE (id=? AND user=?)', [JSON.stringify(req.body.owneritems), JSON.stringify(req.body.useritems), req.body.id, req.user.id], callback);
            } else {
                console.log(req.body);
                if (req.body.status === appConfig.status[0]) {
                    req.body.status = appConfig.status[1];
                }
                db().run('UPDATE requests SET owneritems=?, status=? WHERE (id=? AND owner=?)', [JSON.stringify(req.body.owneritems), req.body.status, req.body.id, req.user.id], callback);
            }
        } else {
            db().run('UPDATE requests SET useritems=?, description=? WHERE (id=? AND user=?)', [JSON.stringify(req.body.useritems), req.body.description, req.body.id, req.user.id], callback);
        }
    });

    app.get('/data/:requestID', mypassport.ensureAuthenticated, function (req, res) {
        var callback = function (err, rows) {
            //console.log(rows.user,req.user.id);
            if (typeof rows !== 'undefined') {
                if (rows.user === req.user.id) {
                    rows.isCreator = true;
                } else {
                    rows.isCreator = false;
                }
                if (rows.owner === req.user.id) {
                    rows.isOwner = true;
                } else {
                    rows.isOwner = false;
                }
                replaceIDwithNameFamily(rows);
                res.json(rows);
            } else {
                res.sendStatus(404);
            }
        };
        db().get('SELECT * from requests where id=' + req.params.requestID + '  AND (user=' + req.user.id  + ' OR owner=' + req.user.id + ')', callback);
    });

    app.get('/data/findcontract/:melicode', mypassport.ensureAuthenticated, function (req, res) {
        var callback = function (err, rows) {
            if (err) {
                console.log(err);
                res.sendStatus(404);
            } else {
                res.json(rows);
            }
        };
        db().all('SELECT * from requests where ((' + req.user.isKarshenas  + ' OR owner=' + req.user.id + ') AND applicant=? AND requesttype="contract") ORDER BY id ASC', req.params.melicode, callback);
    });
};
