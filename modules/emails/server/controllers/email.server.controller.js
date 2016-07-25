'use strict';

var kue = require('kue');
var path = require('path');
var _ = require('lodash');
var nodemailer = require('nodemailer');
var smtpPool = require('nodemailer-smtp-pool');
var templatesDir   = path.resolve(__dirname, '../templates');
var emailTemplates = require('email-templates').EmailTemplate;
//var mg = require('nodemailer-mailgun-transport');
var async = require('async');

var emailQueue = kue.createQueue({
    prefix: 'q',
    redis: {
        port: 9099,
        host: process.env.REDIS_HOST,
        auth: process.env.REDIS_PASSWORD,
        db: process.env.REDIS_DATABASE
    }
});

var mailerConfig = _.omit({
    service: process.env.EMAIL_SERVICE,
    auth: _.omit({
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD
    }, _.isUndefined),
    host: process.env.HOST,
    port: process.env.PORT,
    tls: {
        rejectUnauthorized:false
    }
}, _.isEmpty);

/*var auth = {
    auth: {
        api_key: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN
    }
};*/

//var nodemailerMailgun = nodemailer.createTransport(mg(auth));
var transporter = nodemailer.createTransport(mailerConfig);
var poolTransporter = nodemailer.createTransport(smtpPool(mailerConfig));

var sendEmail = function(data, done) {
    if (process.env.TEST_EMAIL === 'true') {
        console.log("\n\n========= ", data.to, " =============", "\n\n============= BEGIN TEST EMAIL CONTENT =============\n\n", data.html,
            '\n\n============= TEXT =============\n\n', data.text, "\n\n============= END TEST EMAIL CONTENT =============\n\n");
        done();
    } else {
        /*nodemailerMailgun.sendMail(data, function(err, info) {
           if(err){
               console.log("ERROR SENDING EMAIL: ", err);
               done(err);
           } else {
               console.log("EMAIL SENT: ", info);
               done(info);
           }
        });*/
        if(data.bulk) {
            poolTransporter.sendMail(data, function(err) {
               if(err) {
                   console.log(err);
               }
                done(err);
            });
        } else {
            transporter.sendMail(data, function(err) {
                if(err) {
                    console.log(err);
                }
                done(err);
            });
       }
    }
};

var createEmailJob = function(from, to, subject, template, locals, bulk, callback) {
  var data = {
      from: from,
      to: to,
      subject: subject,
      template: template,
      locals: locals,
      bulk: bulk
  };

    console.log("\n\n===== MAILING LIST =====\n\n");
    _.each(data.to, function(user) {
        console.log(user);
    });

    var renderTemplate = new emailTemplates(path.join(templatesDir, data.template));
    async.eachSeries(to, function(email, callback) {
        renderTemplate.render(locals, function(err, results) {
            if(err) {
                console.log("ERR RENDERING TEMPLATE: ", err);
                return callback(err);
            }
            data.text = results.text;
            data.html = results.html;
            data.to = email;

            var job = emailQueue.create('send email', data).priority('medium').removeOnComplete(true);

            job.save(function(err) {
                callback(err);
            });

            //callback();
        }, function (err) {
            callback(err);
        });
   });
};

emailQueue.process('send email', 20, function (job, done) {
    sendEmail(job.data, done);
});

exports.sendChallengeCreatedNotification = function(req, res) {
    kue.Job.rangeByState( 'inactive', 0, 50, 'asc', function( err, jobs ) {
        jobs.forEach( function( job ) {
            job.remove( function(){
                console.log( 'removed ', job.id );
            });
        });
    });
    var locals = {
        challengerName : req.body.to[0].name,
        challengedName : req.body.to[1].name,
        subject: "Test Subject"
    };

    var emails = [];
    _.each(req.body.to, function(user) {
        emails.push(user.email);
    });
    
    createEmailJob(mailerConfig.auth.user, emails, locals.challengerName + " challenged " + locals.challengedName + " on gametrunk!", 'challenge-created', locals, false, function(err) {
        if(err) {
            res.status(400).send(err);
        } else {
            res.status(200).send();
        }
    });
};
