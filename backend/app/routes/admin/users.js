
/**
 * Module dependencies.
 */

var users = require('admin/users'); // controllers

/**
 * Expose
 */

module.exports = function (app) {
  app.get('/admin/users', users.getUsers);
  app.post('/admin/users', users.postUser);
  app.put('/admin/users/:id', users.putUser);
  app.get('/admin/users/:id', users.getUserById);
};
