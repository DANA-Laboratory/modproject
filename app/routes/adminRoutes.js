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
            if (req.user.isItAdmin) {
              db.run('INSERT INTO users (username, password, name, family, melicode, pid, email, defaultpass, isItUser) VALUES (?,?,?,?,?,?,?,?,?)', [req.body.username, req.body.password, req.body.name, req.body.family, req.body.melicode, req.body.pid, req.body.email, req.body.password, 1], callback);
            }
            if (req.user.isMaliAdmin) {
              //username==pid
              db.run('INSERT INTO users (username, password, name, family, melicode, pid, email, defaultpass, isMaliUser) VALUES (?,?,?,?,?,?,?,?,?)', [req.body.username, req.body.password, req.body.name, req.body.family, req.body.melicode, req.body.pid, req.body.email, req.body.password, 1], callback);
            }
            if (req.user.isKarshenas) {
              //username==melicode
              db.run('INSERT INTO users (username, password, name, family, melicode, pid, email, defaultpass, isGuest) VALUES (?,?,?,?,?,?,?,?,?)', [req.body.username, req.body.password, req.body.name, req.body.family, req.body.melicode, req.body.pid, req.body.email, req.body.password, 1], callback);
            }
            if (req.user.isSysAdmin) {
              db.run('INSERT INTO users (username, password, name, family, melicode, pid, email, defaultpass, isGuest, isItUser, isMaliUser, isItAdmin, isMaliAdmin, isKarshenas, isTeacher) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [req.body.username, req.body.password, req.body.name, req.body.family, req.body.melicode, req.body.pid, req.body.email, req.body.password, req.body.isGuest, req.body.isItUser, req.body.isMaliUser, req.body.isItAdmin, req.body.isMaliAdmin, req.body.isKarshenas, req.body.isTeacher], callback);
            }          
          }
          if (req.params.whattodo === 'delete') {
            if (req.user.isItAdmin) {
              db.run('DELETE FROM users WHERE(id=? AND isGuest+isTeacher+isMaliUser+isItAdmin+isMaliAdmin+isKarshenas=0)', [req.body.id], callback);
            }
            if (req.user.isMaliAdmin) {
              db.run('DELETE FROM users WHERE(id=? AND isGuest+isTeacher+isItUser+isItAdmin+isMaliAdmin+isKarshenas=0)', [req.body.id], callback);
            }
            if (req.user.isKarshenas) {
              db.run('DELETE FROM users WHERE(id=? AND isItUser+isMaliUser+isItAdmin+isMaliAdmin+isKarshenas=0)', [req.body.id], callback);
            }
            if (req.user.isSysAdmin) {
              db.run('DELETE FROM users WHERE(id=?)', [req.body.id], callback);
            }          
          }
          if (req.params.whattodo === 'update') {
            if (req.user.isItAdmin) {
              db.run('UPDATE users SET password=?, name=?, family=?, melicode=?, pid=?, email=? WHERE (id=? AND isItUser=1)', [req.body.password, req.body.name, req.body.family, req.body.melicode, req.body.pid, req.body.email, req.user.id], callback);
            }
            if (req.user.isMaliAdmin) {
              db.run('UPDATE users SET password=?, name=?, family=?, melicode=?, pid=?, email=? WHERE (id=? AND isMaliUser=1)', [req.body.password, req.body.name, req.body.family, req.body.melicode, req.body.pid, req.body.email, req.user.id], callback);
            }
            if (req.user.isKarshenas) {
              db.run('UPDATE users SET password=?, name=?, family=?, melicode=?, pid=?, email=? WHERE (id=? AND isTeacher+isGuest>0)', [req.body.password, req.body.name, req.body.family, req.body.melicode, req.body.pid, req.body.email, req.user.id], callback);
            }
            if (req.user.isSysAdmin) {
              db.run('UPDATE users SET password=?, name=?, family=?, melicode=?, pid=?, email=?, isGuest=?, isItUser=?, isMaliUser=?, isItAdmin=?, isMaliAdmin=?, isKarshenas=?, isTeacher=? WHERE (id=?)', [req.body.password, req.body.name, req.body.family, req.body.melicode, req.body.pid, req.body.email, req.body.isGuest, req.body.isItUser, req.body.isMaliUser, req.body.isItAdmin, req.body.isMaliAdmin, req.body.isKarshenas, req.body.isTeacher, req.user.id], callback);
            }
          }
          if (req.params.whattodo === 'reset') {
            if (req.user.isItAdmin) {
              db.run('UPDATE users SET password=defaultpass WHERE (id=? AND isItUser=1)', [req.user.id], callback);
            }
            if (req.user.isMaliAdmin) {
              db.run('UPDATE users SET password=defaultpass WHERE (id=? AND isMaliUser=1)', [req.user.id], callback);
            }
            if (req.user.isKarshenas) {
              db.run('UPDATE users SET password=defaultpass WHERE (id=? AND isTeacher+isGuest>0)', [req.user.id], callback);
            }
            if (req.user.isSysAdmin) {
              db.run('UPDATE users SET password=defaultpass WHERE (id=?)', [req.user.id], callback);
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
