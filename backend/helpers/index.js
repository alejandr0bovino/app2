var moment = require('moment');
var jwt = require('jwt-simple');
var config = require('config');



/*
 |--------------------------------------------------------------------------
 | Login Required Middleware
 |--------------------------------------------------------------------------
 */
function ensureAuthenticated(req, res, next) {
  if (!req.headers.authorization) {
    // return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
    return res.status(401).send({ message: 'long time ago in a galaxy far, far away...' });
    // return res.status(401).send({ message: '<img src="http://img3.wikia.nocookie.net/__cb20130726102211/starwars/images/thumb/a/a9/A_long_time_ago.png/1000px-A_long_time_ago.png" height="562">' });
  }
  var token = req.headers.authorization.split(' ')[1];
  var payload = jwt.decode(token, config.token_secret);
  if (payload.exp <= moment().unix()) {
    return res.status(401).send({ message: 'Token has expired' });
  }
  req.user = payload.sub;
  next();
}


/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */
function createToken(user) {
  var payload = {
    sub: user._id,
    iat: moment().unix(),
    exp: moment().add(14, 'days').unix()
  };
  return jwt.encode(payload, config.token_secret);
}



module.exports = {
  ensureAuthenticated: ensureAuthenticated,
  createToken :createToken
};

//exports.ensureAuthenticated = ensureAuthenticated;