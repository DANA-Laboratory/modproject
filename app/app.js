'use strict';

var appConfig = require('./config/appConfig.json');

var PORT_LISTENER = appConfig.app.devPort;

console.log('I am listening to this port: http://localhost:%s', PORT_LISTENER);
global.DEVELOPMENT = (process.argv.indexOf('development') > 0);
var express = require('express'),
    http = require('http'),
    path = require('path'),
    passport = require('passport'),
    flash = require('connect-flash'),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    methodOverride = require('method-override'),
    logger = require('morgan'),
    errorHandler = require('errorhandler');

var app = express();
// all environments
app.set('port', process.env.PORT || PORT_LISTENER);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('rootpath', path.resolve(__dirname + '/..'));

app.use(logger('dev'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(methodOverride());
app.use(session({ resave: true,
                  saveUninitialized: true,
                  secret: 'lswe43fkjglksdfLKJl' }));
app.use(flash());
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, appConfig.directories.publicDir)));

app.use(function (req, res, next) {
    //console.log('req.body: ' + JSON.stringify(req.body));
    next();
});
app.use(favicon(__dirname + '/public/images/favicon.ico'));
var server = http.createServer(app);
var io = require('socket.io').listen(server);

//routes
require('./routes/index')(app, passport, io);

// error handling middleware should be loaded after the loading the routes
if ('development' === app.get('env')) {
    app.use(errorHandler());
}

server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
