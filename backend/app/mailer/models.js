'use strict';

var config = require('config');
var nodemailer = require('nodemailer');
var path = require('path');
var templatesDir = path.resolve(__dirname, '..', 'views/mailer');
var emailTemplates = require('email-templates');
var EmailAddressRequiredError = new Error('email address required');


var defaultTransport = nodemailer.createTransport("SMTP", {
  service: 'Gmail',
  auth: {
     XOAuth2: {
      user: config.mailer.auth.user,
      clientId: config.google.clientId,
      clientSecret: config.google.clientSecret,
      refreshToken: config.google.oauthplayground.refreshToken
    }
  }
});

exports.sendOne = function (templateName, locals, fn) {
  if (!locals.email) {
    console.log(err);
    return fn(EmailAddressRequiredError);
  }
  if (!locals.subject) {
    console.log(err);
    return fn(EmailAddressRequiredError);
  }
  emailTemplates(templatesDir, function (err, template) {
    if (err) {
      console.log(err);
      return fn(err);
    }

    template(templateName, locals, function (err, html, text) {
      if (err) {
        console.log(err);
        return fn(err);
      }

      var transport = defaultTransport;
      transport.sendMail({
        from: config.mailer.defaultFromAddress,
        to: locals.email,
        subject: locals.subject,
        html: html,
        text: text
      }, function (err, responseStatus) {
        if (err) {
          console.log(err);
          return fn(err);
        }
        return fn(null, responseStatus.message, html, text);
      });
    });
  });
}
