var mongoose = require('mongoose');
var EventType = mongoose.model("EventType");
var Event = mongoose.model("Event");

exports.getTypes = function (req, res) {
  // setTimeout(function(){
  EventType.find()
    .populate('events')
    .exec(function(err, obj) {
      if (err) {
        res.status(400).send(err);
      } else {
        res.json(obj);
      }
    });
  // }, 3000);
};
exports.getType = function (req, res) {
  EventType.findOne({ slug: req.params.slug })
    .populate('events')
    .exec(function(err, obj) {
      if (err) {
        res.status(400).send(err);
      } else {
        if (obj) {
          res.json(obj);
        } else {
          return res.status(400).send({ message: 'Type not found' });
        }
      }
    });
};


/////



exports.getEventInType = function (req, res) {
  EventType
    .find({ slug: req.params.typeslug })
    .populate({
      path: 'events',
      match: { _id: req.params.eventid, slug: req.params.eventslug }
    })
    .exec(function (err, obj) {
        if (err) {
          console.log(err);
          res.status(400).send(err);
        } else {
          if (obj.length > 0) {
            if (obj[0].events.length > 0) {
              return res.json(obj[0]);
            } else {
              return res.status(400).send({ message: 'event not found' });
            }
          } else {
            return res.status(400).send({ message: 'type not found' });
          }
        }
      })

};