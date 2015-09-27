var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    relationship = require("mongoose-relationship"),
    shortid = require('shortid');

var EventSchema = new Schema({
    _id: {
      type: String,
      unique: true,
      'default': shortid.generate
    },
    title     : String,
    slug      : String,
    author    : String,
    abstract  : {type: String, default: ''},
    cover     : {type: String, default: ''},
    eventType: { type:Schema.ObjectId, ref:"EventType", childPath:"events" }
});

EventSchema.plugin(relationship, { relationshipPathName:'eventType' });


function slugify(text) {

  return text.toString().toLowerCase()
      .replace(/\s+/g, '-')        // Replace spaces with -
      .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
      .replace(/\-\-+/g, '-')      // Replace multiple - with single -
      .replace(/^-+/, '')          // Trim - from start of text
      .replace(/-+$/, '');         // Trim - from end of text
}

EventSchema.pre('save', function (next) {
    this.slug = slugify(this.title);
    next();
  });


mongoose.model("Event", EventSchema);

// var Event = mongoose.model("Event", EventSchema);

// var e = new Event();

// e.title = "e ññññññ";
// e.author = "author 3";
// e.abstract = "Lorem ipsum - tai fiktyvus tekstas naudojamas spaudos ir grafinio dizaino pasaulyje jau nuo XVI a. pradžios. Lorem Ipsum tapo standartiniu fiktyviu tekstu, kai nežinomas spaustuvininkas atsitiktine tvarka išdėliojo raides atspaudų prese ir tokiu būdu sukūrė raidžių egzempliorių. Šis tekstas išliko beveik nepasikeitęs ne tik penkis amžius, bet ir įžengė i kopiuterinio grafinio dizaino laikus. Jis išpopuliarėjo XX a. šeštajame dešimtmetyje, kai buvo išleisti Letraset lapai su Lorem Ipsum ištraukomis, o vėliau -leidybinė sistema AldusPageMaker, kurioje buvo ir Lorem Ipsum versija.";
// e.cover = "rTLpe3Qq.png";
// e.save(function(err) {
//   console.log("e");
// });