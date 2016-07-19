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

    challenge.save().then(function() {
        res.status(200).send();
    }).catch(function(err) {
        res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
};
