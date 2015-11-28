
/**
 * Module dependencies.
 */

var helpers = require('../../../helpers');
var auth = require('auth');


/**
 * Expose
 */

module.exports = function (app) {
  app.post('/auth/admin-login',  auth.adminLogin);
  app.post('/auth/signin',  auth.signin);
  app.post('/auth/signup', auth.signup);
  app.post('/auth/unlink', helpers.ensureAuthenticated, auth.unlinkProvider);

  app.post('/auth/google', auth.connectGoogle);
  app.post('/auth/facebook', auth.connectFacebook);
  app.post('/auth/twitter', auth.connectTwitter);
  app.post('/auth/github', auth.connectGithub);
};
