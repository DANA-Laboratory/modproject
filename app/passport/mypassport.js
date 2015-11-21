'use strict';

var userAccounts = [];
var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');
var fs = require('fs');
var file = __dirname + '/../database/Requests.sqlite';
var exists = fs.existsSync(file);
var sqlite3 = null;
var db = null;
var ownerRowID = -1;

function findById(id, fn) {
  var idx = 0;
  while (idx<userAccounts.length && userAccounts[idx].id!==id) {
    idx++;
  }
  if (userAccounts[idx]) {
    fn(null, userAccounts[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

function findByUsername(username, fn) {
  for (var i = 0, len = userAccounts.length; i < len; i++) {
    var user = userAccounts[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}

// Passport session setup.
//    To support persistent login sessions, Passport needs to be able to
//    serialize users into and deserialize users out of the session.  Typically,
//    this will be as simple as storing the user ID when serializing, and finding
//    the user by ID when deserializing.
//
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  findById(id, function (err, user) {
    done(err, user);
  });
});

// Use the LocalStrategy within Passport.
//    Strategies in passport require a `verify` function, which accept
//    credentials (in this case, a username and password), and invoke a callback
//    with a user object.  In the real world, this would query a database;
//    however, in this example we are using a baked-in set of users.
passport.use(new LocalStrategy(
      function (username, password, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {
          // Find the user by username.  If there is no user with the given
          // username, or the password is not correct, set the user to `false` to
          // indicate failure and set a flash message.  Otherwise, return the
          // authenticated `user`.
            findByUsername(username, function (err, user) {
              if (err) { return done(err); }
              if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
              if (user.password !== password) { return done(null, false, { message: 'Invalid password' }); }
              return done(null, user);
            });
          });
        }
        ));

// Simple route middleware to ensure user is authenticated.
// Use this route middleware on any resource that needs to be protected.  If
// the request is authenticated (typically via a persistent login session),
// the request will proceed.  Otherwise, the user will be redirected to the
// login page.

exports.ensureAuthenticated =  function (req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  req.flash('error', 'Login first');
  res.redirect('/');
};

exports.users =  function () {
  var userNameIDs = [];
  for (var user in userAccounts) {
      userNameIDs.push([userAccounts[user].id, userAccounts[user].name + ' ' + userAccounts[user].family]);
  }
  return userNameIDs;
};

exports.userAccounts = function () { 
  return userAccounts;
};

exports.ownerRowID = function () {
  return ownerRowID;
}

exports.readAccounts = function () {
  if (!exists) {
      console.log('database not exists!');
  } else {
      sqlite3 = require('sqlite3').verbose();
      db = new sqlite3.Database(file);
      var setUsers = function (error, data) {
          userAccounts = [];
          for (var item in data) {
              var tmpAccount = JSON.parse(data[item].itemName);
              tmpAccount.id = data[item].id;
              if (data[item].itemType === 2) {
                tmpAccount.isItUser = true
                tmpAccount.isMaliUser = false
              } else {
                if (data[item].itemType === 3) {
                    tmpAccount.isItUser = false
                    tmpAccount.isMaliUser = true
                } else {
                  if (data[item].itemType === 5) {
                      tmpAccount.isItUser = true
                      tmpAccount.isMaliUser = true                  
                  }
                }
              }
              userAccounts.push(tmpAccount);
              if (tmpAccount.isOwner)
                  ownerRowID=tmpAccount.id;
          }
      };
      db.all('SELECT * FROM config WHERE itemType IN (2,3,5)', setUsers);
  }
};

this.readAccounts();
