var mongoose = require('mongoose');
var EventType = mongoose.model("EventType");
var Event = mongoose.model("Event");

exports.getTypes = function (req, res) {
  EventType.find()
    .populate('events')
    .exec(function(err, obj) {
      if (err) {
        return res.send(400, {
          message: getErrorMessage(err)
        });
      } else {
        res.json(obj);
      }
    });
};

exports.getEventById = function (req, res) {
  Event.findById(req.params.id)
    .populate('eventType')
    .exec(function(err, obj) {
      if (err) {
        return res.send(400, {
          message: getErrorMessage(err)
        });
      } else {
        res.json(obj);
      }
    });
};