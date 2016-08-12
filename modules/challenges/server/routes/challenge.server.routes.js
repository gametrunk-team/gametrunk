'use strict';

module.exports = function(app) {
    // Challenge Routes
    var challenge = require('../controllers/challenge.server.controller'),
        challengePolicy = require('../policies/challenge.server.policy');

    app.route('/api/challenge/create').post(challengePolicy.isAllowed, challenge.createChallenge);
    app.route('/api/challenge/delete').post(challengePolicy.isAllowed, challenge.deleteChallenge);
    app.route('/api/challenge/update').post(challengePolicy.isAllowed, challenge.updateChallenge);
    app.route('/api/challenge/get').post(challengePolicy.isAllowed, challenge.getChallenge);
    app.route('/api/challenge/getall').get(challengePolicy.isAllowed, challenge.getAllChallenges);
    app.route('/api/challenge/mychallenges').post(challengePolicy.isAllowed, challenge.getMyChallenges);

    // Finish by binding the user middleware
    app.param('userId', challenge.getMyChallenges);
    app.param('id', challenge.deleteChallenge);
    app.param('id', challenge.getChallenge);

};

