/**
 * Created by Reza Afzalan.
 */
'use strict';
var mypassport = require('../passport/mypassport');
var multer = require('multer');
var upload = multer({ dest : 'uploads/' });
var dbpath = __dirname + '/../database/Requests';
module.exports = function (app, db, readAppConfig) {
    app.post('/admin/import', mypassport.ensureAuthenticated, upload.single('Requests.sqlite'), function (req, res) {
        if (req.user.isOwner) {
            console.log('file uploaded', req.file);
            var fs = require('fs');
            var file = dbpath + '.sqlite';
            req.logout();
            var sqlite3 = require('sqlite3').verbose();
            db.close(function () {
                fs.rename(file, dbpath + Date.now() + '.sqlite', function () {
                    fs.rename(req.file.path, dbpath + '.sqlite', function () {
                        db = new sqlite3.Database(file);
                    });
                });
            });
        }
        res.redirect('/');
    });
    
    app.get('/admin/backup', mypassport.ensureAuthenticated, function (req, res) {
        if (req.user.isOwner) {
            res.download(dbpath + '.sqlite');
        } else {
            res.redirect('/');
        }
    });
    
    app.get('/admin/select/users', mypassport.ensureAuthenticated, function (req, res) {
        if (req.user.isOwner) {
            res.json(mypassport.userAccounts());
        } else {
            res.json([req.user]);
        }
    });
    
    app.post('/admin/user/:whattodo', mypassport.ensureAuthenticated, function (req, res) {
        var callback = function (err) {
            if (err) {
                console.log(req.params.whattodo + ' user error=', err);
            } else {
                mypassport.readAccounts();
            }
            res.sendStatus(200);
        };
        //It admin, can delete and update its users and reset common users pass
        if (req.user.isOwner) {
            if (req.params.whattodo === 'delete' && req.user.id !== req.body.id) {
                db.run('DELETE FROM config WHERE (id=? AND itemType=2)', [req.body.id], callback);
            } else {
                if (req.params.whattodo === 'update') {
                    db.run('UPDATE config SET itemName=? WHERE (id=? AND itemType=2)', [JSON.stringify(req.body.account), req.body.id], callback);
                } else {
                    if (req.params.whattodo === 'insert') {
                        db.run('INSERT INTO config (itemName,itemType) VALUES (?,2)', [JSON.stringify(req.body.account)], callback);
                    } else {
                        if (req.params.whattodo === 'reset') {
                            req.body.account.password = req.body.account.defaultpass;
                            db.run('UPDATE config SET itemName=? WHERE (id=? AND (itemType=2 OR itemType=5))', [JSON.stringify(req.body.account), req.body.id], callback);
                        }
                    }
                }
            }
        } else { //each user can update and reset its account pass OR data
            if (req.params.whattodo === 'update') {
                db.run('UPDATE config SET itemName=? WHERE (id=? AND itemType IN (2,3,5))', [JSON.stringify(req.body.account), req.user.id], callback);
            } else {
                if (req.params.whattodo === 'reset') {
                    req.user.password = req.user.defaultpass;
                    db.run('UPDATE config SET itemName=? WHERE (id=? AND itemType IN (2,3,5))', [JSON.stringify(req.user), req.user.id], callback);
                } else {
                    res.redirect('/');
                }
            }
        }
    });
    
    app.post('/admin/item/:whattodo', mypassport.ensureAuthenticated, function (req, res) {
        if (req.user.isOwner && req.body.itemType !== 2)  {
            var callback = function (err) {
                if (err) {
                    console.log(req.params.whattodo + ' item error=', err);
                    res.sendStatus(200);
                } else {
                    readAppConfig();
                    if (req.params.whattodo === 'insert') {
                        res.json({lastID: this.lastID});
                    }
                    else {
                        res.sendStatus(200);
                    }
                }
            };
            if (req.params.whattodo === 'insert') {
                db.run('INSERT INTO config (itemName,itemType) VALUES (?,?)', [req.body.name, req.body.itemType], callback);
            } else {
                if (req.params.whattodo === 'delete') {
                    db.run('DELETE FROM config WHERE (id=?)', [req.body.id], callback);
                } else {
                    if (req.params.whattodo === 'update') {
                        db.run('UPDATE config SET itemName=? WHERE (id=?)', [req.body.name, req.body.id], callback);
                    }
                }
            }
        } else {
            res.redirect('/');
        }
    });
    
    app.post('/admin/deleterequest', mypassport.ensureAuthenticated, function (req, res) {
        if (req.user.isOwner) {
            var callback = function (err) {
                if (err) {
                    console.log('delete requests error=', err);
                } else {
                    //TODO
                }
                res.sendStatus(200);
            };
            db.run('DELETE FROM requests WHERE (id=?)', [req.body.id], callback);
        }
    });
};
