
/*!
 * Module dependencies
 */

var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');


var Schema = mongoose.Schema;

/**
 * User schema
 */

var UserSchema = new Schema({
  email: { type: String, unique: true, lowercase: true, trim: true },
  userName: { type: String, unique: true, sparse: true, trim: true},
  userNameLower: { type: String, unique: true, sparse: true, trim: true},
  password: { type: String, select: false },

  role: { type: String, enum: ['Anonymous', 'User', 'Editor', 'Admin'], default: 'User' },

  facebook: String,
  google: String,
  twitter: String,

  profile: {
    name: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    website: { type: String, default: '', trim: true },
    picture: {
      original: { type: String, default: 'https://s3.amazonaws.com/app2-uploads/user/picture/default/default.png', trim: true },
      // large: { type: String, default: 'https://s3.amazonaws.com/app2-uploads/user/picture/default/default-large.png', trim: true },
      medium: { type: String, default: 'https://s3.amazonaws.com/app2-uploads/user/picture/default/default-medium.png', trim: true },
      small: { type: String, default: 'https://s3.amazonaws.com/app2-uploads/user/picture/default/default-small.png', trim: true }
    },
    cover: {
      original: { type: String, default: 'https://s3.amazonaws.com/app2-uploads/user/cover/default/default.jpg', trim: true },
      small: { type: String, default: 'https://s3.amazonaws.com/app2-uploads/user/cover/default/default-small.jpg', trim: true }
    },
  },

  pendingUpdate: { type: String, enum: ['google', 'facebook', 'twitter'] },
  pendingConfirmation: Boolean,
});



UserSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash) {
      user.password = hash;
      next();
    });
  });
});

UserSchema.pre('save', function (next) {
  var user = this;
  user.userNameLower = user.userName && user.userName.toLowerCase();
  next();
});

UserSchema.methods.comparePassword = function(password, done) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    done(err, isMatch);
  });
};


mongoose.model('User', UserSchema);
