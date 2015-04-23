var MongoClient = require('mongodb').MongoClient;
var winston = require('winston');

var logger = new (winston.Logger)({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: '/tmp/requests.log', level: 'info' })
  ]
});

var db;
MongoClient.connect("mongodb://natesux:natesux@ds041228.mongolab.com:41228/nodehw", function(err, database) {
  db = database;
});

exports.list = function(req, res, options) {  
  logger.info(req.path, req.method); 
  
  db.collection('users').find().toArray(function(err, users) {
    if(err) res.send(500, {message: 'Internal Server Error'});
    else if (users.length === 0) {
      res.send(404, {message: 'No users found'});
    } else {
      res.send(200, {users: users});
    }
  });
};

exports.getUser = function(req, res) {
  var id = new require('mongodb').ObjectID(req.params.id);
  logger.info(req.path, req.method);
  
  db.collection('users').findOne({_id: id}, function(err, user) {
    if(err) {
      res.send(500, {message: 'Internal Server Error'});
      logger.log(err);
    } else if (!user) {
      res.send(404, {message: 'No user found'});
    } else {
      res.send(200, {user: user});
    }
  });
};

exports.delete = function(req, res) {
  var id = new require('mongodb').ObjectID(req.params.id);
  logger.info(req.path, req.method);
  
  db.collection('users').remove({_id: id}, {w:1}, function(err, doc) {
    console.log(doc);
    if(err) res.send(500, {message: 'Internal Server Error'});
    else if (doc.result.n === 0) {
      res.send(404, {message: 'No user was found'});
    } else {
      res.send(200, {message: 'User successfully removed'});
    }
  });
};

exports.create = function(req, res) {
  logger.info(req.path, req.method, req.body);
  //We want email and user name to be required
  if(!req.body || !req.body.userName || !req.body.email) {
    res.send(400, {message: 'Required Parameters are missing from request'});
  } if(typeof req.body.userName != 'string' || typeof req.body.email != 'string') {
    res.send(400, {message: 'Required Parameters are of invalid type'});
  } else if (req.body.email.indexOf('@') == -1 || req.body.email.indexOf('.com') == -1) {
    res.send(400, {message: 'Email is of invalid type'});
  } else {
    db.collection('users').insert(req.body, function(err) {
      if (err) res.send(500, {message: 'Internal Server Error'});
      else res.send(200, {user: req.body});
    });
  }
};

exports.update = function(req, res) {
  var id = new require('mongodb').ObjectID(req.params.id);
  logger.info(req.path, req.method, req.body);
  
  if(!req.body || !req.body.userName || !req.body.email) {
    res.send(400, {message: 'Required Parameters are missing from request'});
  } else if(typeof req.body.userName != 'string' || typeof req.body.email != 'string') {
    res.send(400, {message: 'Required Parameters are of invalid type'});
  } else if (req.body.email.indexOf('@') == -1 || req.body.email.indexOf('.com') == -1) {
    res.send(400, {message: 'Email is of invalid type'});
  } else {
    db.collection('users').update({_id: id}, req.body, {upsert: true}, function(err) {
      if(err) res.send(500, {message: 'Internal Server Error'});
      else res.send(201, {message: 'User successfully updated', new_user: req.body});
    });
  }
};