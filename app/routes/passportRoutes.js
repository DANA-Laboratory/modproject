/**
 * Created by Reza Afzalan.
 */
'use strict';

module.exports = function (app, passport, appConfig) {
    
    var mypassport = require('../passport/mypassport');
    
    app.get('/account', mypassport.ensureAuthenticated, function (req, res) {
        console.log(req.user);
        res.send(req.user);
    });

    app.post('/login',
        passport.authenticate('local', { failureRedirect: '/', failureFlash: true }),
        function (req, res) {
            res.redirect('/');
        });

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/itRequest/:page', mypassport.ensureAuthenticated, function (req, res) {
        res.render('itRequest/' + req.params.page, { userNameIDs: mypassport.itUserNameIDs(), user: req.user, 'pathToAssets' : '/bower_components', message: req.flash('error') });
    });

    app.get('/contract/:page', mypassport.ensureAuthenticated, function (req, res) {
        res.render('contract/' + req.params.page, { userNameIDs: mypassport.itUserNameIDs(), user: req.user, 'pathToAssets' : '/bower_components', message: req.flash('error') });
    });
    
    app.get('/', function (req, res) {
        res.render('index', { user: req.user, tasks: JSON.stringify(appConfig.tasks), requestItems: JSON.stringify(appConfig.requestItems), 'pathToAssets' : '/bower_components', message: req.flash('error') });
    });
    
};
