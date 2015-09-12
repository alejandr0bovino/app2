
/*!
 * Module dependencies.
 */

var qs = require('querystring');
var mongoose = require('mongoose');
var moment = require('moment');
var jwt = require('jwt-simple');
var request = require('request');
var config = require('config');
var helpers = require('../../../helpers');

var User = mongoose.model('User');



exports.adminLogin = function (req, res) {
  User.findOne({ email: req.body.email }, '+password', function(err, user) {
    if (!user) {
      return res.status(401).send({ message: 'Wrong email and/or password' });
    } else if (user.role !== 'Admin') {
      return res.status(403).send({ message: '403' });
    }
    user.comparePassword(req.body.password, function(err, isMatch) {
      if (!isMatch) {
        return res.status(401).send({ message: 'Wrong email and/or password' });
      }
      res.send({ token: helpers.createToken(user) });
    });
  });
};

exports.login = function (req, res) {
  User.findOne({ email: req.body.email }, '+password', function(err, user) {
    if (!user) {
      return res.status(401).send({ message: 'Wrong email and/or password' });
    }

    user.comparePassword(req.body.password, function(err, isMatch) {
      if (!isMatch) {
        return res.status(401).send({ message: 'Wrong email and/or password' });
      }
      if (user.pendingConfirmation) {
        return res.status(401).send({ message: 'You need to confirm your registration' });
      }
      res.send({ token: helpers.createToken(user) });
    });
  });
};

exports.signup = function (req, res) {
  // setTimeout(function() {
  User.findOne({ email: req.body.email }, function(err, existingUser) {
    if (existingUser) {
      return res.status(409).send({ message: 'Email is already taken' });
    }

    User.findOne({ userName: req.body.userName }, function(err, existingUser) {
      if (existingUser) {
        return res.status(409).send({ message: 'Username is already taken' });
      }

      var profile = {
        name: req.body.name,
      }

      var user = new User({
        email: req.body.email,
        userName: req.body.userName,
        password: req.body.password,
        profile: profile,
        pendingConfirmation: true
      });

      user.save(function() {
        res.send({ token: helpers.createToken(user) });
      });

    });

  });
  // }, 500);
};


exports.connectGoogle = function(req, res) {
  var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
  var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: config.google.clientSecret,
    redirect_uri: req.body.redirectUri,
    grant_type: 'authorization_code'
  };

  // Step 1. Exchange authorization code for access token.
  request.post(accessTokenUrl, { json: true, form: params }, function(err, response, token) {
    var accessToken = token.access_token;
    var headers = { Authorization: 'Bearer ' + accessToken };

    // Step 2. Retrieve profile information about the current user.
    request.get({ url: peopleApiUrl, headers: headers, json: true }, function(err, response, profile) {

      // Step 3a. Link user accounts.
      if (req.headers.authorization) {
        User.findOne({ google: profile.sub }, function(err, existingUser) {
          if (existingUser) {
            return res.status(409).send({ message: 'There is already a Google account that belongs to you' });
          }

          var token = req.headers.authorization.split(' ')[1];
          var payload = jwt.decode(token, config.token_secret);

          //link
          // console.log("link")
          User.findById(payload.sub, function(err, user) {
            if (!user) {
              return res.status(400).send({ message: 'User not found' });
            }

            user.google = profile.sub;
            user.profile.name = user.profile.name || profile.name;
            user.profile.picture.original = user.profile.picture.original || profile.picture.replace('sz=50', 'sz=400');
            // user.profile.picture.medium = user.profile.picture.medium || profile.picture.replace('sz=50', 'sz=200');
            if (!user.profile.picture.medium || user.profile.picture.medium == "https://s3.amazonaws.com/app2-uploads/user/picture/default/default-medium.png") {
              user.profile.picture.medium = profile.picture.replace('sz=50', 'sz=200')
            }

            // user.profile.picture.small = user.profile.picture.small || profile.picture;
            if (!user.profile.picture.small || user.profile.picture.small == "https://s3.amazonaws.com/app2-uploads/user/picture/default/default-small.png") {
              user.profile.picture.small = profile.picture;
            }

            user.save(function() {
              var token = helpers.createToken(user);
              res.send({
                token: token,
                user: user
              });
            });
          });
        });
      } else {

        // Step 3b. Create a new user account or return an existing one.
        User.findOne({ google: profile.sub }, function(err, existingUser) {

          // login
          if (existingUser) {
            // return res.send({ token: token });
            // console.log("login")
            return res.send({ token: helpers.createToken(existingUser) });
          }

          // signup

          User.findOne({ email: profile.email}, function(err, existingUser) {
            if (existingUser) {
              return res.status(409).send({ message: 'There is a user already registered with this Google account email.' });
            }

            // console.log("connect")
            var user = new User();

            user.pendingUpdate = 'google';
            user.google = profile.sub;
            user.profile.name = profile.name;
            user.profile.picture.original = profile.picture.replace('sz=50', 'sz=400');
            user.profile.picture.medium = profile.picture.replace('sz=50', 'sz=200');
            user.profile.picture.small = profile.picture;
            user.email = profile.email;

            user.save(function(err) {
              var token = helpers.createToken(user);
              // res.send({ token: token });
              res.send({
                token: token,
                connect: true
              });
            });
          });
        });
      }
    });
  });
};

exports.connectFacebook = function(req, res) {
  var accessTokenUrl = 'https://graph.facebook.com/oauth/access_token';
  var graphApiUrl = 'https://graph.facebook.com/v2.2/me';
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: config.facebook.clientSecret,
    redirect_uri: req.body.redirectUri
  };

  // Step 1. Exchange authorization code for access token.
  request.get({ url: accessTokenUrl, qs: params, json: true }, function(err, response, accessToken) {
    if (response.statusCode !== 200) {
      return res.status(500).send({ message: accessToken.error.message });
    }
    accessToken = qs.parse(accessToken);

    // Step 2. Retrieve profile information about the current user.
    request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profile) {
      if (response.statusCode !== 200) {
        return res.status(500).send({ message: profile.error.message });
      }


      if (req.headers.authorization) {
        User.findOne({ facebook: profile.id }, function(err, existingUser) {
          if (existingUser) {
            return res.status(409).send({ message: 'There is already a Facebook account that belongs to you' });
          }
          var token = req.headers.authorization.split(' ')[1];
          var payload = jwt.decode(token, config.token_secret);

          //link

          User.findById(payload.sub, function(err, user) {
            if (!user) {
              return res.status(400).send({ message: 'User not found' });
            }
            user.facebook = profile.id;
            user.profile.name = user.profile.name || profile.name;

            user.profile.picture.original = user.profile.picture.original || 'https://graph.facebook.com/v2.2/' + profile.id + '/picture?width=200&height=200';

            // NO EXISTE TAMAÑO 400 X 400 ///////
            if (!user.profile.picture.medium || user.profile.picture.medium == "https://s3.amazonaws.com/app2-uploads/user/picture/default/default-medium.png") {
              user.profile.picture.medium = 'https://graph.facebook.com/v2.2/' + profile.id + '/picture?width=200&height=200';
            }

            if (!user.profile.picture.small || user.profile.picture.small == "https://s3.amazonaws.com/app2-uploads/user/picture/default/default-small.png") {
              user.profile.picture.small = 'https://graph.facebook.com/v2.2/' + profile.id + '/picture?width=50&height=50';
            }

            user.save(function() {
              var token = helpers.createToken(user);
              res.send({
                token: token,
                user: user
              });
            });
          });
        });
      } else {
        // Step 3b. Create a new user account or return an existing one.
        User.findOne({ facebook: profile.id }, function(err, existingUser) {

          // login
          if (existingUser) {
            var token = helpers.createToken(existingUser);
            return res.send({ token: token });
          }

          // signup

          User.findOne({ email: profile.email}, function(err, existingUser) {
            if (existingUser) {
              return res.status(409).send({ message: 'There is a user already registered with this Facebook account email.' });
            }
            var user = new User();

            user.pendingUpdate = 'facebook';
            user.facebook = profile.id;
            user.profile.name = profile.name;

            // NO EXISTE TAMAÑO 400 X 400 ///////

            user.profile.picture.original = 'https://graph.facebook.com/v2.2/' + profile.id + '/picture?width=200&height=200';
            // user.profile.picture.medium = user.profile.picture.medium;
            user.profile.picture.medium =  user.profile.picture.original;
            user.profile.picture.small = 'https://graph.facebook.com/v2.2/' + profile.id + '/picture?width=50&height=50';
            user.email = profile.email;

            user.save(function() {
              var token = helpers.createToken(user);
              // res.send({ token: token });
              res.send({
                token: token,
                connect: true
              });
            });
          });

        });
      }
    });
  });
};


exports.connectTwitter = function(req, res) {
  var requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
  var accessTokenUrl = 'https://api.twitter.com/oauth/access_token';
  var profileUrl = 'https://api.twitter.com/1.1/users/show.json?screen_name=';

  // Part 1 of 2: Initial request from Satellizer.
  if (!req.body.oauth_token || !req.body.oauth_verifier) {
    var requestTokenOauth = {
      consumer_key: config.twitter.key,
      consumer_secret: config.twitter.clientSecret,
      callback: req.body.redirectUri
    };

    // Step 1. Obtain request token for the authorization popup.
    request.post({ url: requestTokenUrl, oauth: requestTokenOauth }, function(err, response, body) {
      var oauthToken = qs.parse(body);

      // Step 2. Send OAuth token back to open the authorization screen.
      res.send(oauthToken);
    });
  } else {
    // Part 2 of 2: Second request after Authorize app is clicked.
    var accessTokenOauth = {
      consumer_key: config.twitter.key,
      consumer_secret: config.twitter.clientSecret,
      token: req.body.oauth_token,
      verifier: req.body.oauth_verifier
    };

    // Step 3. Exchange oauth token and oauth verifier for access token.
    request.post({ url: accessTokenUrl, oauth: accessTokenOauth }, function(err, response, accessToken) {

      accessToken = qs.parse(accessToken);

      var profileOauth = {
        consumer_key: config.twitter.key,
        consumer_secret: config.twitter.clientSecret,
        oauth_token: accessToken.oauth_token
      };

      // Step 4. Retrieve profile information about the current user.
      request.get({
        url: profileUrl + accessToken.screen_name,
        oauth: profileOauth,
        json: true
      }, function(err, response, profile) {

        // Step 5a. Link user accounts.
        if (req.headers.authorization) {
          User.findOne({ twitter: profile.id }, function(err, existingUser) {
            if (existingUser) {
              return res.status(409).send({ message: 'There is already a Twitter account that belongs to you' });
            }

            var token = req.headers.authorization.split(' ')[1];
            var payload = jwt.decode(token, config.token_secret);

            User.findById(payload.sub, function(err, user) {
              if (!user) {
                return res.status(400).send({ message: 'User not found' });
              }

              user.twitter = profile.id;
              user.profile.name = user.profile.name || profile.name;

              // user.picture = user.picture || profile.profile_image_url.replace('_normal', '');

              user.profile.picture.original = user.profile.picture.original ||  profile.profile_image_url.replace('normal', '400x400');

              if (!user.profile.picture.medium || user.profile.picture.medium == "https://s3.amazonaws.com/app2-uploads/user/picture/default/default-medium.png") {
                user.profile.picture.medium = profile.profile_image_url.replace('normal', '200x200');
              }

              if (!user.profile.picture.small || user.profile.picture.small == "https://s3.amazonaws.com/app2-uploads/user/picture/default/default-small.png") {
                user.profile.picture.small = profile.profile_image_url;
              }

              user.profile.location = profile.location;

              user.save(function() {
                var token = helpers.createToken(user);
                res.send({
                  token: token,
                  user: user
                });

              });
            });
          });
        } else {
          // Step 5b. Create a new user account or return an existing one.
          User.findOne({ twitter: profile.id }, function(err, existingUser) {
            if (existingUser) {
              return res.send({ token: helpers.createToken(existingUser) });
            }

            var user = new User();
            user.email = '_tmp_' + user._id;
            user.pendingUpdate = 'twitter';
            user.twitter = profile.id;
            user.profile.name = profile.name;
            user.profile.picture.original = profile.profile_image_url.replace('normal', '400x400');
            user.profile.picture.small = profile.profile_image_url;
            user.profile.picture.medium = profile.profile_image_url.replace('normal', '200x200');
            user.profile.location = profile.location;
            user.save(function() {
              res.send({
                token: helpers.createToken(user),
                connect: true
              });
            });
          });
        }
      });
    });
  }
};


exports.unlinkProvider = function(req, res) {
  var provider = req.body.provider;
  var providers = ['facebook', 'foursquare', 'google', 'github', 'instagram',
    'linkedin', 'live', 'twitter', 'twitch', 'yahoo'];

  if (providers.indexOf(provider) === -1) {
    return res.status(400).send({ message: 'Unknown OAuth Provider' });
  }

  User.findById(req.user, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User Not Found' });
    }
    user[provider] = undefined;
    user.pendingUpdate = undefined;
    user.save(function() {
      res.status(200).end();
    });
  });
};