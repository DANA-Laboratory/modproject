/**
 * Created by Reza Afzalan.
 */
'use strict';

var mypassport = require('../passport/mypassport');
var fs = require('fs');
var multer = require('multer');
var upload = multer({ dest : 'uploads/',
                      limits: { fileSize: 10000000 }
                    });
var archiver = require('archiver');
var path = require('path');
var rimraf = require('rimraf');
var glob = require('glob');

module.exports = function (app, db) {

    app.get('/fileman/contract/attachment/:requestID/:attachmentID', mypassport.ensureAuthenticated, function (req, res) {
        var callback = function (err, rows) {
            if (err) {
                console.log('get attachment error ', err);
                res.sendFile(path.resolve('app/public/images/attachment.png'));
            } else {
                var p = path.resolve('uploads/requests/', req.params.requestID, req.params.attachmentID);
                if (rows.length === 1 && fs.existsSync(p)) {
                    console.log('attach file exists: ' + p);
                    res.sendFile(path.resolve('uploads/requests/', req.params.requestID, req.params.attachmentID));
                } else {
                    res.sendFile(path.resolve('app/public/images/attachment.png'));
                }
            }
        };
        db().all('SELECT id from requests where ((' + req.user.isKarshenas  + ' OR owner=' + req.user.id + ') AND id=? AND requesttype="contract")', req.params.requestID, callback);
    });

    app.post('/fileman/:whattodo', mypassport.ensureAuthenticated, upload.single('file'), function (req, res) {
        var src = 'uploads/users/' + req.user.id;
        var fi = '';
        if (typeof(req.body.requestid) !== 'undefined') {
            src = 'uploads/requests/' + req.body.requestid;
        }
        var callback = function (path) {
            if (fs.existsSync(path)) {
                res.json(fs.readdirSync(path));
            } else {
                res.json({});
            }
        };
        if (req.params.whattodo === 'upload') {
            console.log(req.file);
            var dpath = req.file.destination + 'users/' + req.user.id;
            if (!fs.existsSync(dpath)) {
                fs.mkdirSync(dpath);
            }
            fs.rename(req.file.path, dpath + '/' + req.body.filename, function (err) {
                if (err) {
                    console.log(err);
                    res.sendStatus(403);
                } else {
                    callback(dpath);
                }
            });
        } else if (req.params.whattodo === 'remove') {
            for (fi in req.body.filename) {
                fs.unlinkSync(src + '/' + req.body.filename[fi]);
            }
            callback(src);
        } else if (req.params.whattodo === 'removeall') {
            rimraf(src, function (error) {
                console.log('removeall Error: ', error);
                callback(src);
            });
        } else if (req.params.whattodo === 'attachto') {
            if (typeof(req.body.requestid) !== 'undefined' &&  req.body.requestid >= 0 && req.body.filename !== 'undefined') {
                var dst = 'uploads/requests/' + req.body.requestid + '/';
                src = 'uploads/users/' + req.user.id + '/' + req.body.filename;
                var files = glob.sync(dst + req.body.attachemntid + '.*');
                if (files.length === 0 && fs.existsSync(src)) {
                    if (!fs.existsSync(dst)) {
                        fs.mkdirSync(dst);
                    }
                    fs.createReadStream(src).pipe(fs.createWriteStream(dst + req.body.attachemntid + path.extname(src)));
                    res.sendStatus(200);
                } else {
                    console.log('source not exists or dist allready exists');
                    res.sendStatus(403);
                }
            } else {
                console.log(req.params.whattodo + ' error');
                res.sendStatus(403);
            }
        } else if (req.params.whattodo === 'dir') {
            callback(src);
        } else if (req.params.whattodo === 'download') {
            if (req.body.filename.length > 1) {
                var archive = archiver('zip');
                archive.on('error', function (err) {
                    res.status(500).send({error: err.message});
                });
                //on stream closed we can end the request
                archive.on('end', function () {
                    console.log('Archive wrote %d bytes', archive.pointer());
                });
                //set the archive name
                res.attachment('userarchive.zip');
                //this is the streaming magic
                archive.pipe(res);
                for (fi in req.body.filename) {
                    var _file = src + '/' + req.body.filename[fi];
                    archive.file(_file, { name: path.basename(_file) });
                }
                archive.finalize();
            } else if (req.body.filename.length === 1) {
                res.attachment(req.body.filename[0]);
                res.sendFile(path.resolve(src, req.body.filename[0]));
            }
        }
    });
};
