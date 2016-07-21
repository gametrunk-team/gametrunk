'use strict';

module.exports = function(app) {
    // Challenge Routes
    var challenge = require('../controllers/challenge.server.controller');

    app.route('/api/challenge/create').post(challenge.createChallenge);
    app.route('/api/challenge/delete').get(challenge.deleteChallenge);
    app.route('/api/challenge/update').post(challenge.updateChallenge);
    app.route('/api/challenge/get').get(challenge.getChallenge);
    app.route('/api/challenge/getall').get(challenge.getAllChallenges);
    
};
