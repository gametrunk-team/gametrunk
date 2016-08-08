'use strict';

/**
 * Module dependencies.
 */
var
    path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    News = db.news,
    User = db.user;

/*
 Create Challenge Result News
 */
exports.createChallengeResultNews = function(req, res, next) {

    var challengerName;
    var challengeeName;

    User.findById(req.body.challenger).then(function(challengerUserObj) {
       challengerName = challengerUserObj.firstName + " " + challengerUserObj.lastName.charAt(0) + ".";

        User.findById(req.body.challengee).then(function(challengeeUserObj) {
            challengeeName = challengeeUserObj.firstName + " " + challengeeUserObj.lastName.charAt(0) + ".";

            var newNews = {
                text: challengerName + " beat " + challengeeName + " in a ping-pong match!",
                photoUrl: challengerUserObj.profileImageURL,
                iconClass: "fa-trophy"
            };

            var news = News.build(newNews);
            news.save().then(function() {
                return next();
            }).catch(function(err) {
                console.log(err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            });

        });
    });
};

/*
 Create Challenge Lost News
 */
exports.createChallengeLostNews = function(req, res) {

    var challengerName;
    var challengeeName;

    User.findById(req.body.challenger).then(function(challengerUserObj) {
        challengerName = challengerUserObj.firstName + " " + challengerUserObj.lastName.charAt(0) + ".";

        User.findById(req.body.challengee).then(function(challengeeUserObj) {
            challengeeName = challengeeUserObj.firstName + " " + challengeeUserObj.lastName.charAt(0) + ".";

            var newNews = {
                text: challengerName + " lost to " + challengeeName + " in a ping-pong match!",
                photoUrl: challengerUserObj.profileImageURL,
                iconClass: "fa-thumbs-down"
            };

            var news = News.build(newNews);
            news.save().then(function() {
                return res.status(200).send;
            }).catch(function(err) {
                console.log(err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            });

        });
    });
};

/*
 Get News
 */
exports.getNews = function(req, res) {
    News.findAll({
        order: [
            ['createdAt', 'DESC']
        ],
        limit: 10
    }).then(function(news) {
        if (!news) {
            return res.status(400).send({
                message: 'Unable to get news list'
            });
        } else {
            res.json(news);
        }
    }).catch(function(err) {
        res.jsonp(err);
    });
};
