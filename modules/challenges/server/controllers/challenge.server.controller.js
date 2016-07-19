'use strict';

/**
 * Module dependencies.
 */
var
    path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    Challenge = db.challenge;

/*
Create Challenge
 */
exports.createChallenge = function(req, res) {

    var challenge = Challenge.build(req.body);
    console.log("we are here");
    challenge.save().then(function() {
        res.status(200).send();
    }).catch(function(err) {
        console.log(err);
        res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
};
