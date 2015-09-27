
/**
 * Module dependencies.
 */

var event = require('api/event'); // controllers

/**
 * Expose
 */

module.exports = function (app) {
  app.get('/api/event-types', event.getTypes);
  app.get('/api/event-types/:slug', event.getType);
};
