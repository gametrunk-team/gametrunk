/**
 * Created by breed on 7/21/16.
 */

'use strict';

var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    User = db.user;

exports.read = function(req, res) {
    res.json(req.model);
};


exports.list = function(req, res) {
    User.findAll({
        order: [
            ['rank', 'ASC']
        ]
    }).then(function(users) {
        if (!users) {
            return res.status(400).send({
                message: 'Unable to get list of users'
            });
        } else {
            res.json(users);
        }
    }).catch(function(err) {
        res.jsonp(err);
    });
};

exports.getChallengees = function(req, res) {
    // TODO adjust to allow circuits
    var upperBound = req.user.rank;
    var lowerBound = req.user.rank - 4;

    User.findAll({
        where: [
            {rank: {gt: lowerBound}},
            {rank: {lt: upperBound}}
        ]
    }).then(function (users) {
        res.json(users);
    }).catch(function (err) {
        res.jsonp(err);
    });
};

exports.userByID = function(req, res, next, id) {
    if (!id) {
        return res.status(400).send({
            message: 'User is invalid'
        });
    }

    User.findById(id).then(function(user) {
        if (!user) {
            return next(new Error('Failed to load user ' + id));
        } else {

            var data = {};

            data.id = user.id;
            data.firstName = user.firstName;
            data.lastName = user.lastName;
            data.displayName = user.displayName;
            data.email = user.email;
            data.username = user.username;
            data.roles = user.roles;
            data.provider = user.provider;
            data.updatedAt = user.updatedAt;
            data.createdAt = user.createdAt;

            req.model = data;
            next();
        }
    }).catch(function(err) {
        return next(err);
    });

};


/*
 Update User ranking
 */
exports.updateRanking = function(req, res) {
    if (!req.body.challenger || !req.body.challengee) {
        return;
    }

    User.findById(req.body.challenger).then(function(challenger) {
        User.findById(req.body.challengee).then(function (challengee) {

            if (challenger.rank < challengee.rank) {
                return;
            }

            var update = function (newRankObj, oldRank) {
                User.update(
                    newRankObj, {where: {rank: oldRank}})
                    .then(function (result) {
                    }).error(function (err) {
                        res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    });
            };

            // challengee.rank = challenger.rank and everyone in between
            for (var i = challenger.rank - 1; i > challengee.rank - 1; i--) { // starts at challenger and goes up in rank
                update({rank: i + 1}, i);
            }

            // challenger.rank = challengee.rank;
            User.update(
                {rank: challengee.rank}, {where: {id: challenger.id}})
                .then(function (result) {
                    req.user.rank = challengee.rank;
                    res.status(200).send();
                }).error(function (err) {
                    res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                });
        });
    });
    

};
