var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    relationship = require("mongoose-relationship");

var EventTypeSchema = new Schema({
    name: String,
    events: [{ type:Schema.ObjectId, ref:"Event" }]
});

mongoose.model("EventType", EventTypeSchema);
