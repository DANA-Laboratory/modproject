/**
 * Created by Reza Afzalan.
 */
//user types, in users table:
//isSysAdmin, isItAdmin, isMaliAdmin, isItUser, isMaliUser, isKarshenas, isGuest, isTeacher

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
        if (req.user.isSysAdmin) {
            res.json(mypassport.userAccounts());
        } else {
            var accounts = [];
            if (req.user.isMaliAdmin) {
                accounts = mypassport.maliAccounts();
            }
            if (req.user.isItAdmin) {
                accounts = accounts.concat(mypassport.itAccounts());
            }
            if (req.user.isKarshenas) {
                accounts = accounts.concat(mypassport.teachAccounts());
            }
            if (!req.user.isMaliAdmin && !req.user.isItAdmin && !req.user.isKarshenas) {
                res.json([req.user]);
            } else {
                res.json(accounts);
            }
        }
    });

    app.post('/admin/user/:whattodo', mypassport.ensureAuthenticated, function (req, res) {
        var callback = function (err) {
            if (err) {
                console.log(req.params.whattodo + ' user error=', err);
                res.sendStatus(403);
            } else {
                mypassport.readAccounts(function () { res.sendStatus(200); });
            }
        };
        //Check if user want do somthing with his account
        if (req.user.id === req.body.id) {
            //Each user could 1-update his account informations or 2-reset his password
            if (req.params.whattodo === 'update') {
                db.run('UPDATE users SET password=?, name=?, family=?, melicode=?, pid=?, email=? WHERE id=?', [req.body.password, req.body.name, req.body.family, req.body.melicode, req.body.pid, req.body.email, req.user.id], callback);
            } else {
                if (req.params.whattodo === 'reset') {
                    req.user.password = req.user.defaultpass;
                    db.run('UPDATE users SET password=defaultpass WHERE id=?', [req.user.id], callback);
                } else {
                    res.redirect('/');
                }
            }
        } else {
            if (req.params.whattodo === 'insert') {
                if ((req.body.isItUser && !req.user.isItAdmin) || (req.body.isMaliAdmin && !req.user.isMaliUser) || ((req.body.isGuest || req.body.isTeacher) && !req.user.isKarshenas) || ((req.body.isSysAdmin || req.body.isMaliAdmin || req.body.isItAdmin) && !req.user.isSysAdmin)) {
                    console.log('permission denied');
                    res.sendStatus(403);
                } else {
                    if (req.body.isGuest == null) {
                        req.body.isGuest = 0;
                    }
                    if (req.body.isItUser == null) {
                        req.body.isItUser = 0;
                    }
                    if (req.body.isMaliUser == null) {
                        req.body.isMaliUser = 0;
                    }
                    if (req.body.isItAdmin == null) {
                        req.body.isItAdmin = 0;
                    }
                    if (req.body.isMaliAdmin == null) {
                        req.body.isMaliAdmin = 0;
                    }
                    if (req.body.isKarshenas == null) {
                        req.body.isKarshenas = 0;
                    }
                    if (req.body.isTeacher == null) {
                        req.body.isTeacher = 0;
                    }
                    db.run('INSERT INTO users (username, password, name, family, melicode, pid, email, defaultpass, isGuest, isItUser, isMaliUser, isItAdmin, isMaliAdmin, isKarshenas, isTeacher) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [req.body.username, req.body.password, req.body.name, req.body.family, req.body.melicode, req.body.pid, req.body.email, req.body.password, req.body.isGuest, req.body.isItUser, req.body.isMaliUser, req.body.isItAdmin, req.body.isMaliAdmin, req.body.isKarshenas, req.body.isTeacher], callback);
                }
            }
            if (req.params.whattodo === 'delete') {
                if (req.user.isSysAdmin) {
                    db.run('DELETE FROM users WHERE(id=?)', [req.body.id], callback);
                } else {
                    db.run('DELETE FROM users WHERE(id=? AND ((isGuest+isTeacher+isMaliUser+isItAdmin+isMaliAdmin+isKarshenas=0 AND ?) OR (isGuest+isTeacher+isItUser+isItAdmin+isMaliAdmin+isKarshenas=0 AND ?) OR (isItUser+isMaliUser+isItAdmin+isMaliAdmin+isKarshenas=0 AND ?)))', [req.body.id, req.user.isItAdmin, req.user.isMaliAdmin, req.user.isKarshenas], callback);
                }
            }
            if (req.params.whattodo === 'update') {
                if (req.user.isSysAdmin) {
                    db.run('UPDATE users SET name=?, family=?, melicode=?, pid=?, email=?, isGuest=?, isItUser=?, isMaliUser=?, isItAdmin=?, isMaliAdmin=?, isKarshenas=?, isTeacher=? WHERE (id=?)', [req.body.name, req.body.family, req.body.melicode, req.body.pid, req.body.email, req.body.isGuest, req.body.isItUser, req.body.isMaliUser, req.body.isItAdmin, req.body.isMaliAdmin, req.body.isKarshenas, req.body.isTeacher, req.body.id], callback);
                    if (req.body.password !== '***') {
                        db.run('UPDATE users SET password=? where id=?', [req.body.password, req.body.id]);
                    }
                } else {
                    db.run('UPDATE users SET name=?, family=?, melicode=?, pid=?, email=? WHERE (id=? AND ((isItUser=1 AND ?) OR (isMaliUser=1 AND ?) OR (isTeacher+isGuest>0 AND ?))', [req.body.name, req.body.family, req.body.melicode, req.body.pid, req.body.email, req.body.id, req.user.isItAdmin, req.user.isMaliAdmin, req.user.isKarshenas], callback);
                    if (req.body.password !== '***') {
                        db.run('UPDATE users SET password=? where id=?', [req.body.password, req.body.id]);
                    }
                }
            }
            if (req.params.whattodo === 'reset') {
                db.run('UPDATE users SET password=defaultpass WHERE (id=? AND ((isItUser=1 AND ?) OR  (isMaliUser=1 AND ?) OR (isTeacher+isGuest>0 AND ?) || ?))', [req.body.id, req.user.isItAdmin, req.user.isMaliAdmin, req.user.isKarshenas, req.user.isSysAdmin], callback);
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
