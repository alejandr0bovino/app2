
/**
 * Module dependencies.
 */

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var helpers = require('../../../helpers');
var user = require('api/user');


/**
 * Expose
 */

module.exports = function (app) {
  app.get('/api/user/all', user.all);

  app.get('/api/user', helpers.ensureAuthenticated, user.get);
  app.put('/api/user', helpers.ensureAuthenticated, user.put);

  app.get('/api/user/public-user/:username', user.getPublicUser);
  app.get('/api/user/username-available/:username', user.usernameAvailable);
  app.get('/api/user/email-available/:email', user.emailAvailable);

  app.post('/api/user/confirm-registration', user.confirmRegistrationPost);
  app.put('/api/user/confirm-registration', user.confirmRegistrationPut);

  app.post('/api/user/reset-password', user.resetPasswordPost);
  app.put('/api/user/reset-password', user.resetPasswordPut);

  app.put('/api/user/update-password', helpers.ensureAuthenticated, user.updatePassword);
  app.put('/api/user/remove-picture', helpers.ensureAuthenticated, user.removePicture);

  app.post('/api/user/upload-file', helpers.ensureAuthenticated, multipartMiddleware, user.uploadFilePost);
};
