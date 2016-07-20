    'use strict';

module.exports = function(app) {
    // Challenge Routes
    var challenge = require('../controllers/challenge.server.controller');

    app.route('/api/challenge/create').post(challenge.createChallenge);
    app.route('/api/challenge/delete').post(challenge.deleteChallenge);
    
};

