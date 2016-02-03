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
            if ([user].id === row.owner) {
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
        if (row.requesttasks !== null) {
            row.requesttasks = row.requesttasks.replace(/[\"\[\]]/g, ' ');
        }
        if (row.requestitems !== null) {
            row.requestitems = row.requestitems.replace(/[\"\[\]]/g, ' ');
        }
    };

    app.get('/data/nsidebar', mypassport.ensureAuthenticated, function (req, res) {
        var ret = [];
        var callback = function (err, rows) {
            ret.push(rows.count);
            if (ret.length === 2 * appConfig.status.length) {
                res.json(ret);
            }
        };
        db.serialize(function () {
            for (var status in appConfig.status) {
                db.get('SELECT count(id) as count from requests where status=\'' + appConfig.status[status]  + '\' AND owner=' + req.user.id, callback);
                db.get('SELECT count(id) as count from requests where status=\'' + appConfig.status[status]  + '\' AND user=' + req.user.id, callback);
            }
        });
    });
  
    app.get('/data/table/:type', mypassport.ensureAuthenticated, function (req, res) {
        var callback = function (err, rows) {
            for (var row in rows) {
                formatdata(rows[row]);
            }
            res.json(rows);
        };
        db.all('SELECT * from requests where ((user=' + req.user.id  + ' OR owner=' + req.user.id + ') AND (status=? OR status=?) AND requesttype=?)', ['ثبت شده', 'در دست اقدام', req.params.type], callback);
    });
  
    app.get('/data/table/:type/:status', mypassport.ensureAuthenticated, function (req, res) {
        var callback = function (err, rows) {
            for (var row in rows) {
                formatdata(rows[row]);
            }
            res.json(rows);
        };
        if (req.params.status > 3) {
            req.params.status -= 4;
        }
        db.all('SELECT * from requests where (user=? OR owner=?) AND status=? AND requesttype=?', [req.user.id, req.user.id, appConfig.status[req.params.status], req.params.type], callback);
    });
    
    app.post('/data/updatetasks/:requestID', mypassport.ensureAuthenticated, function (req, res) {
        var callback = function (err) {
            console.log('update tasks error=', err);
            res.sendStatus(200);
        };
        db.run('UPDATE requests SET requesttasks=? WHERE (owner=? AND id=?)', [JSON.stringify(req.body.tasks), req.user.id, req.params.requestID], callback);
    });
    
    app.post('/data/updatestatus/:requestID', mypassport.ensureAuthenticated, function (req, res) {
        var callback = function (err) {
            console.log('update status error=', err);
            io.emit('update');
            res.sendStatus(200);
        };
        if (req.body.status === appConfig.status[1]) {
            db.run('UPDATE requests SET status=?, startdate=?, starttime=?, startuser=? WHERE id=?', [req.body.status, req.body.actiondate, req.body.actiontime, req.user.id, req.params.requestID], callback);
        }
        if (req.body.status === appConfig.status[2]) {
            db.run('UPDATE requests SET status=?, enddate=?, endtime=?, enduser=?, actiondescription=? WHERE id=?', [req.body.status, req.body.actiondate, req.body.actiontime, req.user.id, req.body.actiondescription, req.params.requestID], callback);
        }
        if (req.body.status === appConfig.status[3]) {
            db.run('UPDATE requests SET status=?, canceldate=?, canceltime=?, actiondescription=?, canceluser=? WHERE id=?', [req.body.status, req.body.actiondate, req.body.actiontime, req.body.cancelwhy, req.user.id, req.params.requestID], callback);
        }
    });
    
    app.post('/data/insertrequest', mypassport.ensureAuthenticated, function (req, res) {
        var callback = function (err) {
            console.log('insert request error=', err);
            io.emit('update');
            res.sendStatus(200);
        };
        if (req.body.requesttype === 'contract') {
            //var requestitems = {melicode: req.body.melicode, startdate: req.body.startdate, enddate: req.body.enddate, mablagh: req.body.mablagh, mablaghtype: req.body.mablaghtype, modat: req.body.modat, mablaghword: req.body.mablaghword};
            //var requesttasks = {name: req.body.name, family: req.body.family, fname: req.body.fname, madrak: req.body.madrak, address: req.body.address, tel: req.body.tel, c1: req.body.c1, c2: req.body.c2, c3: req.body.c3, c4: req.body.c4, branch: req.body.branch, accountnumber: req.body.accountnumber};
            db.run('INSERT INTO requests (requestitems,requesttasks,owner,user,status,initdate,inittime,description,applicant,requesttype) VALUES (?,?,?,?,?,?,?,?,?,?)', [JSON.stringify(req.body.requestitems), JSON.stringify(req.body.requesttasks), mypassport.findIdByMeliCode(Number(req.body.requestitems.melicode)), req.user.id, appConfig.status[0], req.body.initdate, req.body.inittime, req.body.description, req.body.requestitems.melicode, req.body.requesttype], callback);
        } else {
            db.run('INSERT INTO requests (requestitems,owner,user,status,initdate,inittime,description,applicant,requesttype) VALUES (?,?,?,?,?,?,?,?,?)', [JSON.stringify(req.body.requestitems), mypassport.ownerRowID(), req.user.id, appConfig.status[0], req.body.initdate, req.body.inittime, req.body.description, req.body.applicant, req.body.requesttype], callback);
        }
    });
       
    app.post('/data/updaterequest', mypassport.ensureAuthenticated, function (req, res) {
        var callback = function (err) {
            console.log('update request error=', err);
            res.sendStatus(200);
        };
        if (req.body.requesttype === 'contract') {
            //var requesttasks = {name: req.body.name, family: req.body.family, fname: req.body.fname, madrak: req.body.madrak, address: req.body.address, tel: req.body.tel, c1: req.body.c1, c2: req.body.c2, c3: req.body.c3, c4: req.body.c4, branch: req.body.branch, accountnumber: req.body.accountnumber};
            if (req.user.isKarshenas) {
                db.run('UPDATE requests SET requesttasks=?, requestitems=? WHERE (id=? AND user=?)', [JSON.stringify(req.body.requesttasks), JSON.stringify(req.body.requestitems), req.body.id, req.user.id], callback);
            } else {
                db.run('UPDATE requests SET requesttasks=? WHERE (id=? AND owner=?)', [JSON.stringify(req.body.requesttasks), req.body.id, req.user.id], callback);
            }
        } else {
            db.run('UPDATE requests SET requestitems=?, description=? WHERE (id=? AND user=?)', [JSON.stringify(req.body.requestitems), req.body.description, req.body.id, req.user.id], callback);
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
                replaceIDwithNameFamily(rows);
                res.json(rows);
            } else {
                res.sendStatus(404);
            }
        };
        db.get('SELECT * from requests where id=' + req.params.requestID + '  AND (user=' + req.user.id  + ' OR owner=' + req.user.id + ')', callback);
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
        db.all('SELECT * from requests where ((' + req.user.isKarshenas  + ' OR owner=' + req.user.id + ') AND applicant=? AND requesttype="contract") ORDER BY id ASC', req.params.melicode, callback);
    });
};
