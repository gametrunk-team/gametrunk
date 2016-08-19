/**
 * Created by breed on 7/21/16.
 */

'use strict';

var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    User = db.user,
    Challenge = db.challenge,
    _ = require('lodash'),
    Sequelize = require('sequelize'),
    sequelizeFile = require(path.resolve('./config/lib/sequelize.js')),
    sequelize = sequelizeFile.sequelize;

const http = require('http');

var PropertiesReader = require('properties-reader');
var properties = new PropertiesReader('./config/properties.ini');
var cSize = properties.get('circuitSize') ? properties.get('circuitSize') : 10;
var drIp = properties.get('adminIp') ? properties.get('adminIp') : null;

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
            // Filter out admins
            users = _.filter(users, function(user) {
                return user.roles.indexOf("admin") === -1;
            });
            
            // Define display rank
            users = _.map(users, function(user) {
                if (user.dataValues.rank === null) {
                    user.dataValues.displayRank = "Un";
                } else if (user.dataValues.rank < cSize + 1) {
                    user.dataValues.displayRank = user.dataValues.rank;
                } else if (user.dataValues.rank < 2*cSize + 1) {
                    user.dataValues.displayRank = user.dataValues.rank - cSize;
                } else if (user.dataValues.rank < 3*cSize + 1) {
                    user.dataValues.displayRank = user.dataValues.rank - 2*cSize;
                } else {
                    user.dataValues.displayRank = "Un";
                }
                return user;
            });
            res.json(users);
        }
    }).catch(function(err) {
        res.jsonp(err);
    });
};

exports.getChallengees = function(req, res) {
    User.findById(req.user.id).then(function(user) {

        var upperBound = Infinity;
        var lowerBound = 0;

        if (user.rank === null || user.rank > 3*cSize) {
            upperBound = 3*cSize + 1;
            lowerBound = 3*cSize - 1;
        } else {
            upperBound = user.rank;

            if (user.rank % cSize === 2 || user.rank % cSize === 1) {
                lowerBound = user.rank - 2;
            } else if (user.rank % cSize === 3) {
                lowerBound = user.rank - 3;
            } else {
                lowerBound = user.rank - 4;
            }
        }

        User.findAll({
            where: [
                {rank: {gt: lowerBound}},
                {rank: {lt: upperBound}}
            ]
        }).then(function (users) {
            users = _.filter(users, function(user) {
                return user.roles.indexOf("admin") === -1;
            });
            
            users = _.map(users, function(user) {
                if (user.dataValues.rank === null) {
                    user.dataValues.displayRank = "Un";
                } else if (user.dataValues.rank < cSize + 1) {
                    user.dataValues.displayRank = user.dataValues.rank;
                } else if (user.dataValues.rank < 2*cSize + 1) {
                    user.dataValues.displayRank = user.dataValues.rank - cSize;
                } else if (user.dataValues.rank < 3*cSize + 1) {
                    user.dataValues.displayRank = user.dataValues.rank - 2*cSize;
                } else {
                    user.dataValues.displayRank = "Un";
                }
                return user;
            });

            res.json(users);
        }).catch(function (err) {
            res.jsonp(err);
        });
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

    console.log(req.body.challenger, req.body.challengee);

    User.findById(req.body.challenger).then(function(challenger) {
        User.findById(req.body.challengee).then(function (challengee) {
            // Switch challenger and challengee if appropriate
            if (challenger.rank < challengee.rank) {
                var temp = challenger;
                challenger = challengee;
                challengee = temp;
            }

            // Determine whether this is a ranked game
            // if not, return
            if (challenger.rank === null || challenger.rank > 3*cSize) {
                if (challengee.rank !== 3*cSize) {
                    return;
                }
            } else if (challenger.rank % cSize === 2 || challenger.rank % cSize === 1) {
                if (challengee.rank + 1 !== challenger.rank) {
                    return;
                }
            } else if (challenger.rank % cSize === 3) {
                if (challengee.rank + 2 < challenger.rank) {
                    return;
                }
            } else if (challenger.rank - 3 > challengee.rank) {
                return;
            }

            var update = function (newRankObj, oldRank) {
                User.update(
                    newRankObj, {where: {rank: oldRank}})
                    .then(function (result) {
                    }).error(function (err) {
                    res.status(400).end({
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
                    res.status(200).end();
                }).error(function (err) {
                res.status(400).end({
                    message: errorHandler.getErrorMessage(err)
                });
            });
        });
    });
};

// Sends rankings to the display room
exports.drRankings = function(req, res) {
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
                        users = _.filter(users, function(user) {
                           return user.roles.indexOf("admin") === -1;
                        });
                        // Define display rank
                        users = _.map(users, function(user) {
                            if (user.dataValues.rank === null) {
                                user.dataValues.displayRank = "Un";
                            } else if (user.dataValues.rank < cSize + 1) {
                                user.dataValues.displayRank = user.dataValues.rank;
                            } else if (user.dataValues.rank < 2*cSize + 1) {
                                user.dataValues.displayRank = user.dataValues.rank - cSize;
                            } else if (user.dataValues.rank < 3*cSize + 1) {
                                user.dataValues.displayRank = user.dataValues.rank - 2*cSize;
                            } else {
                                user.dataValues.displayRank = "Un";
                            }
                            return user;
                        });
                        res.json(users);
                    }
                }).catch(function(err) {
                    console.log(err);
                    res.jsonp(err);
                });
};

exports.drUsers = function(req, res) {
    User.findAll({
        order: [
            ['lastName', 'ASC']
        ]
    }).then(function (users) {
        if (!users) {
            return res.status(400).send({
                message: 'Unable to get list of users'
            });
        } else {
            users = _.filter(users, function(user) {
                return user.roles.indexOf("admin") === -1;
            });
            res.json(users);
        }
    }).catch(function (err) {
        res.jsonp(err);
    });
};

exports.drChallenges = function(req, res) {
                Challenge.findAll({
                    where: {
                        'winnerUserId': null
                    }
                }).then(function(challenges) {
                    if (!challenges) {
                        return res.status(400).send({
                            message: 'Unable to get list of users'
                        });
                    } else {
                        res.json(challenges);
                    }
                }).catch(function(err) {
                    res.jsonp(err);
                });
};

exports.drDropUser = function(req, res) {
    console.log("DROPPING USER " + req.body.id);

    var highRank = req.body.rank;

    sequelize.transaction(function (t) { // Note that we use a callback rather than a promise.then()
        return User.count({
            where: {
                rank: {
                    $not: null
                }
            }
        }, {transaction: t}).then(function (count) {
            var lastRank = count;

            var update = function (newRankObj, oldRank) {
                User.update(
                    newRankObj, {where: {rank: oldRank}}, {transaction: t})
                    .then(function (result) {
                    }).error(function (err) {
                        t.rollback();
                        res.status(400).end({
                            message: errorHandler.getErrorMessage(err)
                        });
                    });
            };

            for (var i = highRank + 1; i < lastRank + 1; i++) {
                update({rank: i - 1}, i);
            }

            User.update(
                {rank: lastRank}, {where: {id: req.body.id}}, {transaction: t})
                .then(function (result) {
                    res.status(200).end();
                }).error(function (err) {
                    t.rollback();
                    res.status(400).end({
                    message: errorHandler.getErrorMessage(err)
                });
            });
        }).error(function (err) {
            t.rollback();
            res.status(400).end({
                message: errorHandler.getErrorMessage(err)
            });
        });
    }).then(function (t) {
    }).catch(function (err) {
        // Rolled back
        console.error(err);
    });
};
