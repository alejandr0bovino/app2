/*!
 * Module dependencies.
 */

var moment = require('moment');
var jwt = require('jwt-simple');
var mongoose = require('mongoose');
var AWS = require('aws-sdk');
var Upload = require('s3-uploader');
var config = require('config');
var mailer = require('../../mailer/models');
var User = mongoose.model('User');
var helpers = require('../../../helpers');


exports.get = function (req, res) {
  User.findById(req.user, function(err, user) {
    res.send(user);
  });
};

exports.put = function (req, res) {
  // setTimeout(function() {
  if (req.body.pendingUpdate === 'empty') {
    User.findOne({ email: req.body.email }, function(err, existingUser) {

      // solo twitter (no provee email en connect)
      if (existingUser) {
        return res.status(409).send({ message: 'Email is already taken' });
      }

      // todos
      User.findOne({ userName: req.body.userName }, function(err, existingUser){
        if (existingUser) {
          return res.status(409).send({ message: 'Username is already taken' });
        }
      });
    });
  }

  User.findById(req.user, '+password', function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }
    user.userName = req.body.userName || user.userName;
    user.email = req.body.email || user.email;
    user.password = req.body.password || user.password;
    user.profile.name = req.body.name || user.profile.name;
    user.profile.location = req.body.location || user.profile.location;

    if (req.body.pendingUpdate === 'empty') {
      user.pendingUpdate = undefined;
    }

    user.save(function(err) {
      res.status(200).send({user: user});
    });
  });
  // }, 500);
};


exports.usernameAvailable = function (req, res) {
  User.findOne({ userNameLower: req.params.username.toLowerCase() }, function(err, existingUser) {
    var exists = existingUser ? true : false;
    res.send({exists: exists});
  });
};

exports.emailAvailable = function (req, res) {
  User.findOne({ email: req.params.email.toLowerCase() }, function(err, existingUser) {
    var exists = existingUser ? true : false;
    res.send({exists: exists});
  });
};





exports.confirmRegistrationPost = function (req, res) {
  User.findOne({ email: req.body.email }, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }

    var payload = {
      sub: user._id,
    };

    var token = jwt.encode(payload, config.token_secret);

    var locals = {
      email: user.email,
      subject: 'Activate your account',
      name: user.profile.name,
      confirmUrl: req.body.url + token
    };

    mailer.sendOne('confirm_registration', locals, function (err, responseStatus, html, text) {
      res.status(200).end();
    });
  });
};

exports.confirmRegistrationPut = function (req, res) {
  var token = req.body.token;
  var payload = jwt.decode(token, config.token_secret);

  User.findById(payload.sub, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }

    if (user.pendingConfirmation !== undefined) {
      user.pendingConfirmation = undefined;

      user.save(function() {
        res.send({ token: helpers.createToken(user) });
      });
    } else {
      res.send({alreadyConfirmed: true});
    }
  });
};



exports.updatePassword = function (req, res) {
  User.findById(req.user, '+password', function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }

    user.comparePassword(req.body.oldPassword, function(err, isMatch) {
      if (!isMatch) {
        return res.status(400).send({
          message: 'Your old password does not match'
        });
        // return res.status(400).end();
      } else {
        user.password = req.body.newPassword;
        user.save(function(err) {
          res.status(200).end();
        });
      }
    });
  });
};

exports.resetPasswordPost = function (req, res) {
  User.findOne({ email: req.body.email }, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }

    if (user.pendingUpdate) {
      return res.status(400).send({ message: 'You do not have an assigned password yet, '+
        'please log in with your <b>' + user.pendingUpdate + '</b> account and complete your registration.' });
    }

    var payload = {
      sub: user._id,
      iat: moment().unix(),
      exp: moment().add(20, 'minutes').unix()
    };

    var token = jwt.encode(payload, config.token_secret);

    var locals = {
      email: req.body.email,
      subject: 'Reset password',
      name: user.profile.name,
      userName: user.userName,
      resetPasswordUrl: req.body.url + token
    };

    mailer.sendOne('password_reset', locals, function (err, responseStatus, html, text) {
      res.status(200).end();
    });
  });
};

exports.resetPasswordPut = function (req, res) {
  var token = req.body.token;
  var payload = jwt.decode(token, config.token_secret);

  User.findById(payload.sub, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }

    if (payload.exp <= moment().unix()) {
      return res.status(400).send({ message: 'Token has expired' });
    }

    user.password = req.body.newPassword;
    user.save(function(err) {
      if (err) {
        return res.send(400, { message: err });
      } else {
        res.status(200).end();
      }
    });
  });
};



exports.getPublicUser = function (req, res) {
  User.findOne({ userNameLower: req.params.username.toLowerCase() }, function(err, user) {
    if (!user) {
      return res.send({ data: null });
    }
    res.send({data: user});
  });
};




exports.uploadFilePost = function (req, res) {
  User.findById(req.user, '+password', function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }
    var type = req.body.type,
        versions;

    if (type == 'picture') {
      versions = [{
        original: true
      }, /*{
        suffix: '-large',
        quality: 100,
        maxHeight: 400,
        maxWidth: 400,
      }*/ {
        suffix: '-medium',
        quality: 100,
        maxHeight: 204,
        maxWidth: 204
      }, {
        suffix: '-small',
        quality: 100,
        maxHeight: 52,
        maxWidth: 52
      }];
    } else {
      // versions = [{
      //   original: true
      // }, {
      //   suffix: '-small',
      //   quality: 100,
      //   maxHeight: 150,
      //   maxWidth: 400
      // }];
      versions = [{
          suffix: '-large',
          quality: 100,
          maxHeight: 531,
          maxWidth: 1500
        },{
          suffix: '-small',
          quality: 100,
          maxHeight: 150,
          maxWidth: 400
      },];
    }

    AWS.config.loadFromPath(process.cwd() + '/config/aws.json');

    var client = new Upload('app2-uploads', {
      aws: {
        path: 'user/' + type + '/',
        acl: 'public-read',
        accessKeyId: AWS.config.credentials.accessKeyId,
        secretAccessKey: AWS.config.credentials.secretAccessKey
      },

      cleanup: {
        versions: true,
        original: false
      },

      original: {
        awsImageAcl: 'private'
      },

      versions: versions
    });

    try {
      client.upload(
        req.files.file.path, {awsPath: 'user/' + type + '/'},
        function(err, images, meta) {
          if (err) {
          } else {
            var url = 'https://s3.amazonaws.com/app2-uploads/';

            if (type == 'picture') {
              user.profile.picture.original = url + images[0].path;
              user.profile.picture.medium = url + images[1].path;
              user.profile.picture.small = url + images[2].path;
            } else {
              user.profile.cover.large = url + images[0].path;
              user.profile.cover.small = url + images[1].path;
            }

            user.save(function(err) {
              res.status(200).send({user: user});
            });
          }
        }
      );
    } catch (e) {
      console.log('error from upload', e);
    }
  });
};




exports.removePicture = function (req, res) {
  User.findById(req.user, '+password', function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }

    var type = req.body.type;

    if (type == 'picture') {
      user.profile.picture.original = 'https://s3.amazonaws.com/app2-uploads/user/picture/default/default.png';
      user.profile.picture.medium    = 'https://s3.amazonaws.com/app2-uploads/user/picture/default/default-medium.png';
      user.profile.picture.small    = 'https://s3.amazonaws.com/app2-uploads/user/picture/default/default-small.png';
    } else {
      user.profile.cover.large = 'https://s3.amazonaws.com/app2-uploads/user/cover/default/default-large.jpg';
      user.profile.cover.small    = 'https://s3.amazonaws.com/app2-uploads/user/cover/default/default-small.jpg';
    }

    user.save(function(err) {
      res.status(200).send({user: user});
    });
  });
};




exports.all = function (req, res) {
  User.where('pendingUpdate').equals(null)
    .exec(function(err, obj) {
      if (err) {
        // return res.send(400, {
        //   message: err
        // });
        res.status(400).send(err);
      } else {
        res.json(obj);
      }
    });
};
