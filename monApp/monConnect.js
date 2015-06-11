var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');


var Schema = mongoose.Schema;
var UserId = Schema.ObjectId;
var LinkId = Schema.ObjectId;

var User = new Schema({
    id : UserId,
    username : String,
    password : String,
    timestamps : Date
});

User.methods.comparePassword = function(attemptedPassword, callback) {


  // bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
  //   callback(isMatch);
  // });
};

User.methods.hashPassword = function(){
  var cipher = Promise.promisify(bcrypt.hash);
  var pw = this.findOne({'username': this.username}, 'password', function(error, user) {
    if (error) console.log(error);
    return user.password;
  });

  return cipher(pw, null, null).bind(this)
    .then(function(hash) {
      this.password = hash;
      this.save(function(error) {
        if (error) console.log(error);
      });
    });
};

var Link = new Schema({
    id : LinkId,
    url : String,
    base_url : String,
    code : String,
    title : String,
    visits : Number,
    timestamps : Date
});

mongoose.model( 'User', User );
mongoose.model( 'Link', Link );

// mongoose.connect('mongodb://localhost:27017', function (err) {
// mongoose.connect('mongodb://127.0.0.1/db:port', function (err) {
mongoose.connect('mongodb://127.0.0.1/db', function (err) {
  if (err) {
    console.log(err);
  }
});

