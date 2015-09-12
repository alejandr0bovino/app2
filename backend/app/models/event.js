var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    relationship = require("mongoose-relationship");

var EventSchema = new Schema({
    title     : String,
    author    : String,
    abstract  : {type: String, default: ''},
    cover     : {type: String, default: ''},
    eventType: { type:Schema.ObjectId, ref:"EventType", childPath:"events" }
});

EventSchema.plugin(relationship, { relationshipPathName:'eventType' });

mongoose.model("Event", EventSchema);