const bcrypt = require('bcrypt');


var db = require('../db');
const bodyParser = require('body-parser');
const shortid = require('shortid');

module.exports.login = function(request, response) {
  response.render('user/index', {
    users : db.get('users').value()
  });
};

module.exports.search = function (request, response) {
  var q = request.query.q
  var matchedTitle = db
    .get('users')
    .value()
    .filter(function(value) {
      return q ? value.name.toLowerCase().indexOf(q.toLowerCase()) !== -1 : true;
    });
    response.render('user/index', {
      users: matchedTitle
  });
};

module.exports.create = function(request, response) {
  response.render('user/create');
};

module.exports.update = function(request, response) {
  response.render('user/update');
};

module.exports.delete = function(request, response) {
  var userId = request.params.userId;
  
  var book = db
  .get('users')
  .remove({ userId : userId })
  .write();
  
  response.redirect('/users/login');
};

// METHOD POST

module.exports.postUpdate = function(request, response) {

  db.get('users')
    .find({ userId : request.params.userId })
    .assign({ name: request.body.name })
    .write()
  
  response.redirect('/users/login');
};

module.exports.postCreate = function(request, response, next) {
  const saltRounds = bcrypt.genSalt(10);

  
  console.log(response.success);
  
  bcrypt.hash(request.body.password, saltRounds).then(function(hash) {
    
    db.get('users')
    .push({ userId : shortid.generate(), email: request.body.email, password: hash, isAdmin: false })
    .value()
    .id;
    
  next();
    
  response.render('user/index');
});

};


