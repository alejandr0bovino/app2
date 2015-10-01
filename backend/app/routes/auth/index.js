
/**
 * Module dependencies.
 */

var helpers = require('../../../helpers');
var auth = require('auth');


/**
 * Expose
 */

module.exports = function (app) {
  /*
   |--------------------------------------------------------------------------
   | Log in with Email
   |--------------------------------------------------------------------------
   */
  app.post('/auth/admin-login',  auth.adminLogin);
  app.post('/auth/login',  auth.login);

  /*
   |--------------------------------------------------------------------------
   | Create Email and Password Account
   |--------------------------------------------------------------------------
   */
  app.post('/auth/signup', auth.signup);

  /*
   |--------------------------------------------------------------------------
   | Login with Google
   |--------------------------------------------------------------------------
   */
  app.post('/auth/google', auth.connectGoogle);

  /*
   |--------------------------------------------------------------------------
   | Login with Facebook
   |--------------------------------------------------------------------------
   */
  app.post('/auth/facebook', auth.connectFacebook);


  /*
   |--------------------------------------------------------------------------
   | Login with Twitter
   |--------------------------------------------------------------------------
   */
  app.post('/auth/twitter', auth.connectTwitter);



  app.post('/auth/github', auth.connectGithub);


  /*
   |--------------------------------------------------------------------------
   | Unlink Provider
   |--------------------------------------------------------------------------
   */

    // app.get('/auth/unlink/:provider', helpers.ensureAuthenticated, auth.unlinkProvider);
    app.post('/auth/unlink', helpers.ensureAuthenticated, auth.unlinkProvider);
};
