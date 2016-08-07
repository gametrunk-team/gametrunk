'use strict';

module.exports = function(app) {
    // Challenge Routes
    var challenge = require('../controllers/challenge.server.controller');

    app.route('/api/challenge/create').post(challenge.createChallenge);
    app.route('/api/challenge/delete').post(challenge.deleteChallenge);
    app.route('/api/challenge/update').post(challenge.updateChallenge);
    app.route('/api/challenge/get').get(challenge.getChallenge);
    app.route('/api/challenge/getall').get(challenge.getAllChallenges);
    app.route('/api/challenge/mychallenges').post(challenge.getMyChallenges);

    // Finish by binding the user middleware
    app.param('userId', challenge.getMyChallenges);
    app.param('id', challenge.deleteChallenge);

};
