'use strict';

/**
 * Module dependencies.
 */
var
    path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    emails = require(path.resolve('./modules/emails/server/controllers/email.server.controller')),
    rankings = require(path.resolve('./modules/rankings/server/controllers/rankings.server.controller')),
    sequelizeFile = require(path.resolve('./config/lib/sequelize.js')),
    sequelize = sequelizeFile.sequelize,
    Sequelize = require('sequelize'),
    Challenge = db.challenge;

/*
Create Challenge
 */
exports.createChallenge = function(req, res) {
    var challenge = Challenge.build(req.body);
    challenge.save().then(function() {
        res.json(challenge);
    }).catch(function(err) {
        console.log(err);
        res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
};

/*
 Delete Challenge
 */
exports.deleteChallenge = function(req, res) {
    console.log("DELETING " + req.body.id);
    Challenge.destroy({where: {id: req.body.id}});
    res.status(200).send();
};

/*
 Get A Challenge
 */
exports.getChallenge = function(req, res) {
    console.log(req.body.id);
    if(req.body.id) {
        Challenge.findById(req.body.id).then(function (challenge) {
            return res.json(challenge);
        }).catch(function(err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        });
    } else if(req.body.scheduledTime) {
        Challenge.findOne({where: {scheduledTime: req.body.scheduledTime}}).then(function (challenge) {
            return res.json(challenge);
        }).catch(function(err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        });
    } else if(req.body.challengerUserId) {
        Challenge.findOne({where: {challengerUserId: req.body.challengerUserId}}).then(function (challenge) {
            return res.json(challenge);
        }).catch(function(err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        });
    } else if(req.body.challengee) {
        Challenge.findOne({where: {chalengee: req.body.challengee}}).then(function (challenge) {
            return res.json(challenge);
        }).catch(function(err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        });
    } else if(req.body.winnerUserId) {
        Challenge.findOne({where: {winner: req.body.winnerUserId}}).then(function (challenge) {
            return res.json(challenge);
        }).catch(function(err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        });
    }
};

/*
 Accept a challenge
 */
exports.acceptChallenge = function(req, res) {
    sequelize.transaction(function (t) {
        return sequelize.query("UPDATE challenges SET accepted = true WHERE id = " + req.body.challengeObj.challengeId + " AND accepted IS NULL", {transaction: t});
    }).then(function () {

        req.body.accept = 1;
        emails.sendChallengeResponseNotification(req, res);

        return res.status(200).send();
    }).catch(function(err) {
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
};

/*
 Decline a challenge
 */
exports.declineChallenge = function(req, res) {
    sequelize.transaction(function (t) {
        return sequelize.query("UPDATE challenges SET accepted = false WHERE id = " + req.body.challengeObj.challengeId + " AND accepted IS NULL", {transaction: t}).then(function() {
          return sequelize.query('UPDATE challenges SET "winnerUserId" = ' + req.body.challengeObj.challengerUserId + ' WHERE id = ' + req.body.challengeObj.challengeId , {transaction: t});
        });
    }).then(function () {

        req.body.challengee = req.body.challengeObj.challengeeUserId;
        req.body.challenger = req.body.challengeObj.challengerUserId;

        rankings.updateRanking(req, res);

        Challenge.destroy({where: {id: req.body.challengeObj.challengeId}});

        req.body.accept = 0;
        emails.sendChallengeResponseNotification(req, res);

        return res.status(200).send();
    }).catch(function(err) {
        console.log(err);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
};


/*
 Get All Challenges
 */
exports.getAllChallenges = function(req, res) {
    Challenge.findAll({
        order: [
            ['createdAt', 'DESC']
        ]
    }).then(function(challenges) {
        if (!challenges) {
            return res.status(400).send({
                message: 'Unable to get list of challenges'
            });
        } else {
            res.json(challenges);
        }
    }).catch(function(err) {
        res.jsonp(err);
    });
};

/*
 Get All Challenges
 */
exports.getMyChallenges = function(req, res) {
    Challenge.findAll({
        order: [
            ['createdAt', 'DESC']
        ],
        where: Sequelize.or(
            { challengerUserId : req.body.userId },
            { challengeeUserId: req.body.userId }
        ),
        paranoid: req.body.paranoid
    }).then(function(challenges) {
        if (!challenges) {
            return res.status(400).send({
                message: 'Unable to get list of challenges'
            });
        } else {
            res.json(challenges);
        }
    }).catch(function(err) {
        res.jsonp(err);
    });
};

/*
 Update Challenge
 */
exports.updateChallenge = function(req, res) {

    var updatedChallenge = {};

    //var challenge = Challenge.find({where: {id: req.body.id}});
    
    if(req.body.scheduledTime)
        updatedChallenge.scheduledTime = req.body.scheduledTime;

    if(req.body.challengerUserId)
        updatedChallenge.challengerUserId = req.body.challengerUserId;

    if(req.body.challengeeUserId)
        updatedChallenge.challengeeUserId = req.body.challengeeUserId;

    if(req.body.winnerUserId)
        updatedChallenge.winnerUserId = req.body.winnerUserId;

    // Challenge.update(updatedChallenge).then(function() {
    //     console.log("UPDATING: ", updatedChallenge);
    //     res.status(200).send();
    // }).catch(function(err) {
    //     res.status(400).send({
    //         message: errorHandler.getErrorMessage(err)
    //     });
    // });

    Challenge.update(
       updatedChallenge,
        {
            where: { id : req.body.id }
        })
        .then(function (result) {
            res.status(200).send();
        }, function(err){
            res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        });
};
