
/*!
 * Module dependencies.
 */


var mongoose = require('mongoose');
var User = mongoose.model('User');


exports.getUsers = function (req, res) {
  User.find()
    .limit(req.query._end)
    .exec(function(err, obj) {
      if (err) {
        return res.send(400, {
          message: err
        });
      } else {
        res.json(obj);
      }
    });
};

exports.getUserById = function (req, res) {
  User.findById(req.params.id, function (err, obj) {
    if (err) {
      return res.send(400, {
        message: err
      });
    } else {
      res.json(obj);
    }
  });
};



exports.postUser = function (req, res) {
  var user = new User({
    email: req.body.email,
    userName: req.body.userName,
    profile: req.body.profile
  });

  user.save(function(err) {
    if (err) {
      return res.send(400, {
        message: err
      });
    } else {
      res.status(200).end();
    }
  });
};




exports.putUser = function (req, res) {
  User.findById(req.params.id, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    } else {
      user.email = req.body.email || user.email;
      user.userName = req.body.userName || user.userName;
      // user.displayName = req.body.displayName || user.displayName;
      user.profile = req.body.profile || user.profile;

      user.save(function(err) {
        res.status(200).end();
      });
    }
  });
};
