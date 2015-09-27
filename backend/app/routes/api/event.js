
/**
 * Module dependencies.
 */

var event = require('api/event'); // controllers

/**
 * Expose
 */

module.exports = function (app) {
  // app.get('/api/event/types', event.getTypes);

  // app.get('/api/event/:id', event.getEvent);
  app.get('/api/event/:typeslug/:eventid/:eventslug', event.getEventInType);

  // app.get('/api/event/type/:slug', event.getType);
};
