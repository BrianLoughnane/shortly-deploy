var mongoose = require('mongoose');
var monDb = require('../monApp/monConnect.js');
var User = mongoose.model('User');
var Link = mongoose.model('Link');
var Promise = require('bluebird');

var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');




// var db = require('../app/config');
// var User = require('../app/models/user');
// var Link = require('../app/models/link');
// var Users = require('../app/collections/users');
// var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  console.log('request handler - renderIndex - fired');
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  // Links.reset().fetch().then(function(links) {
  //   console.log('links.models', links.models);
  //   res.send(200, links.models);
  // })
  Link.find(function ( err, links, count ){
    if (err) {
      throw err;
      console.log(err);
    }
    res.send(links);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  util.getUrlTitle(uri, function(err, title) {
    if (err) {
      console.log('Error reading URL heading: ', err);
      return res.send(404);
    }
    new Link ({
      url: uri,
      title: title,
      base_url : req.headers.origin,
      timestamps : Date.now(),
      visits: 0
    }).save( function( err, newLink ){
      if(err) throw err;
      // var gen = Promise.promisify(newLink.generateCode);

      // gen()
        // .then(function () {
        //   res.send(200, newLink);
        // });
      newLink.generateCode();
      res.send(200, newLink);
    });
  });
};



  // new Link({ url: uri }).fetch().then(function(found) {
  //   if (found) {
  //     res.send(200, found.attributes);
  //   } else {
    //   util.getUrlTitle(uri, function(err, title) {
    //     if (err) {
    //       console.log('Error reading URL heading: ', err);
    //       return res.send(404);
    //     }

    //     var link = new Link({
    //       url: uri,
    //       title: title,
    //       base_url: req.headers.origin
    //     });

    //     link.save().then(function(newLink) {
    //       Links.add(newLink);
    //       res.send(200, newLink);
    //     });
    //   });
    // }
  // });

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  console.log("passed-in password:", password);

  User.findOne({'username': username }, 'username password', function (err, user) {
    console.log("db password:", user.password);
    if (err) {
      console.log(err);
    }
    if (!user) {
      res.redirect('/login');
    } else {
      user.comparePassword(password, function(match) {
        if (match) {
          console.log('matched password:', password);
          util.createSession(req, res, user);
        } else {
          res.redirect('/login');
        }
      });
    }
  });

  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //       res.redirect('/login');
  //     } else {
  //       user.comparePassword(password, function(match) {
  //         if (match) {
  //           util.createSession(req, res, user);
  //         } else {
  //           res.redirect('/login');
  //         }
  //       })
  //     }
  // });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({'username': username }, 'username password', function (err, user) {
    if (err) {
      console.log(err);
    }

    if (!user) {
      new User({
        username: username,
        password: password,
        timestamps: Date.now()
      }).save(function (err, newUser) {
        if(err) console.log('create new User callback error',err);
        newUser.hashPassword()
          .then(function () {
            res.redirect('/');
          });
      });
    } else {
      console.log('Account already exists');
      res.redirect('/signup');
    }
  });





  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //       var newUser = new User({
  //         username: username,
  //         password: password
  //       });
  //       newUser.save()
  //         .then(function(newUser) {
  //           util.createSession(req, res, newUser);
  //           Users.add(newUser);
  //         });
  //     } else {
  //       console.log('Account already exists');
  //       res.redirect('/signup');
  //     }
  //   })
};

exports.navToLink = function(req, res) {
  console.log('req params 0', req.params[0]);
  Link.findOne({ code: req.params[0] }, 'url visits', function(err, link) {
    console.log('link: ', link);
    if (err) console.log(err);
    if (!link) {
      res.redirect('/');
    } else {
      link.visits++;
      link.save(function(err) {
        if (err) console.log(err);
        res.redirect(link.url);
      });
    }
  });
};




