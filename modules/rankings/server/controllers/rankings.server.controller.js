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
    console.log("updateRanking");
    if (!req.body.challenger || !req.body.challengee) {
        return;
    }

    User.findById(req.body.challenger).then(function(challenger) {
        User.findById(req.body.challengee).then(function (challengee) {
            if (challenger.rank < challengee.rank) {
                console.log("Err: Challenger rank is higher than challengee:", challenger.rank, challengee.rank);
                return;
            }

            var update = function (user, oldRank) {
                User.update(
                    user, {where: {rank: oldRank}})
                    .then(function (result) {
                        res.status(200).send();
                    }).error(function (err) {
                        res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    });
            };

            // challengee.rank = challenger.rank and everyone in between
            for (var i = challengee.rank; i < challenger.rank; i++) { // starts at challengee and goes down in rank
                //console.log("updating:" + i);
                update({rank: i + 1}, i);
            }

            // challenger.rank = challengee.rank;
            User.update(
                {rank: challengee.rank}, {where: {id: challenger.id}})
                .then(function (result) {
                    res.status(200).send();
                }).error(function (err) {
                    res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                });
        });
    });
    

};
