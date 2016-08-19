'use strict';

var kue = require('kue');
var path = require('path');
var _ = require('lodash');
var nodemailer = require('nodemailer');
var smtpPool = require('nodemailer-smtp-pool');
var templatesDir   = path.resolve(__dirname, '../templates');
var emailTemplates = require('email-templates').EmailTemplate;
var db = require(path.resolve('./config/lib/sequelize')).models;
var User = db.user;
var async = require('async');
var moment = require('moment');

var mailerConfig = _.omit({
    service: process.env.EMAIL_SERVICE,
    auth: _.omit({
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD
    }, _.isUndefined),
    host: process.env.HOST,
    port: process.env.PORT,
    secure: true,
    tls: {
        rejectUnauthorized:false
    }
}, _.isEmpty);

var transporter = nodemailer.createTransport(mailerConfig);
var poolTransporter = nodemailer.createTransport(smtpPool(mailerConfig));

var sendEmail = function(data, done) {
    

    if (process.env.TEST_EMAIL === 'true') {
        console.log("\n\n========= ", data.to, " =============", "\n\n============= BEGIN TEST EMAIL CONTENT =============\n\n", data.html,
            '\n\n============= TEXT =============\n\n', data.text, "\n\n============= END TEST EMAIL CONTENT =============\n\n");
        done();
    } else {

        poolTransporter.sendMail(data, function (err) {
            if (err) {
                console.log(err);
            }
            done(err);
        });
    }
};

var createEmailJob = function(from, to, subject, template, locals, bulk, cb) {
  var data = {
      from: from,
      to: to,
      subject: subject,
      template: template,
      locals: locals,
      bulk: bulk
  };

    data.locals.domain = process.env.DOMAIN;

    console.log("\n\n===== MAILING LIST =====\n\n");
    console.log(to);

    var renderTemplate = new emailTemplates(path.join(templatesDir, data.template));
    async.each(to, function(email, callback) {
        renderTemplate.render(locals, function(err, results) {
            if(err) {
                console.log("ERR RENDERING TEMPLATE: ", err);
                return cb(err);
            }

            if(results !== null) {
                data.html = results;
                data.to = email;

                sendEmail(data, cb);
                callback();
            }

        }, function (err) {
            cb(err);
        });
   });
};

exports.sendChallengeCreatedNotification = function(req, res) {

    var challenger;
    var challengee;
    
    User.findById(req.body.challengerUserId).then(function(challengerUserObj) {
        challenger = challengerUserObj;

        User.findById(req.body.challengeeUserId).then(function(challengeeUserObj) {
            challengee = challengeeUserObj;

            var locals = {
                challengerName : challenger.firstName,
                challengedName : challengee.firstName,
                challengeId: req.body.challengeId,
                acceptingUserId: challengee.id,
                timeString: moment.utc(req.body.scheduledTime).local().format('dddd, MMMM Do [at] h:mmA'),
                subject: "Default Subject"
            };

            var emails = [challengee.email];

            createEmailJob(process.env.EMAIL_FROM, emails, locals.challengerName + " challenged " + " you on gametrunk!", 'challenge-created', locals, true, function(err) {
                if(err) {
                    res.status(400).end(err);
                } else {
                    res.status(200).end();
                }
            });
        });
    });
};

exports.sendChallengeResponseNotification = function(req, res) {

    var challenger;
    var challengee;
    var responseText;
    var summaryText;
    
    if(req.body.accept === 1) {
        responseText = "accepted";
        summaryText = "You can change the details of this challenge on the My Challenges card on your gametrunk dashboard.";
    } else {
        responseText = "declined";
        summaryText = "You will not play this challenge, but you will be moved up to your opponent's rank by forfeit!";
    }

    User.findById(req.body.challengeObj.challengerUserId).then(function(challengerUserObj) {
        challenger = challengerUserObj;

        User.findById(req.body.challengeObj.challengeeUserId).then(function(challengeeUserObj) {
            challengee = challengeeUserObj;

            var locals = {
                challengeeName : challengee.firstName,
                challengeId: req.body.challengeObj.challengeId,
                timeString: moment.utc(req.body.challengeObj.scheduledTime).local().format('dddd, MMMM Do [at] h:mmA'),
                responseText: responseText,
                summaryText: summaryText,
                subject: "Default Subject"
            };

            var emails = [challenger.email];

            createEmailJob(process.env.EMAIL_FROM, emails, locals.challengeeName + " " + responseText + " your challenge on Gametrunk!", 'challenge-response', locals, false, function(err) {
                if(err) {
                    res.status(400).end(err);
                } else {
                    res.status(200).end();
                }
            });
        });
    });
};


exports.sendChallengeTimeChangedNotification = function(req, res) {

    var changedTimeUser;
    var otherUser;

    User.findById(req.body.changedTimeUserId).then(function(changedTimeUserObj) {
        changedTimeUser = changedTimeUserObj;

        User.findById(req.body.otherUserId).then(function(otherUserObj) {
            otherUser = otherUserObj;

            var locals = {
                changedTimeName : changedTimeUser.firstName,
                challengeId: req.body.challengObj.id,
                timeString: moment.utc(req.body.challengObj.scheduledTime).local().format('dddd, MMMM Do [at] h:mmA'),
                subject: "Default Subject"
            };

            var emails = [otherUser.email];

            createEmailJob(process.env.EMAIL_FROM, emails, locals.changedTimeName + " changed the time of your challenge on Gametrunk!", 'challenge-time-changed', locals, false, function(err) {
                if(err) {
                    res.status(400).end(err);
                } else {
                    res.status(200).end();
                }
            });
        });
    });
};
