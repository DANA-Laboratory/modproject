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
    if (user.username == username) {
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
              if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
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

exports.itUserNameIDs =  function () {
  var itUserNameIDs = [];
  for (var user in userAccounts) {
      if (userAccounts[user].isItUser) {
          itUserNameIDs.push([userAccounts[user].id, userAccounts[user].name + ' ' + userAccounts[user].family]);
      }    
  }
  return itUserNameIDs;
};

exports.userAccounts = function () { 
  return userAccounts;
};

exports.maliAccounts = function () {
    var maliAccounts = [];
    for (var user in userAccounts) {
        if (userAccounts[user].isMaliUser) {
            maliAccounts.push(userAccounts[user]);
        }
    }
    return maliAccounts;
};

exports.itAccounts = function () {
    var itAccounts = [];
    for (var user in userAccounts) {
        if (userAccounts[user].isItUser) {
            itAccounts.push(userAccounts[user]);
        }
    }
    return itAccounts;
};

exports.teachAccounts = function () {
  var teachAccounts = [];
  for (var user in userAccounts) {
      if (userAccounts[user].isGuest || userAccounts[user].isTeacher) {
          teachAccounts.push(userAccounts[user]);
      }
  }
  return teachAccounts;
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
              var tmpAccount = data[item];
              if (tmpAccount.isItAdmin) {
                  ownerRowID=tmpAccount.id;
                  tmpAccount.isOwner = true;
              }
              else
                  tmpAccount.isOwner = false
              userAccounts.push(tmpAccount);
              //db.run('INSERT INTO users(id,username,password,name,family,melicode,pcode,isSysAdmin,isItAdmin,isMaliAdmin,isItUser,isMaliUser,isKarshenas,isGuest,isTeacher,defaultpass,email) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)' ,[tmpAccount.id,tmpAccount.username,tmpAccount.password,tmpAccount.name,tmpAccount.family,'',tmpAccount.pid,tmpAccount.isOwner,false,false,tmpAccount.isItUser,tmpAccount.isMaliUser,false,false,false,tmpAccount.defaultpass,tmpAccount.email],callback);             
          }
      };
      db.all('SELECT * FROM users', setUsers);
  }
};

exports.findIdByMeliCode = function(melicode) {
  var idx = 0;
  while (idx<userAccounts.length && userAccounts[idx].melicode!==melicode) {
    idx++;
  }
  if (userAccounts[idx]) {
    return userAccounts[idx].id;
  } else {
    return null;
  }
}

this.readAccounts();
