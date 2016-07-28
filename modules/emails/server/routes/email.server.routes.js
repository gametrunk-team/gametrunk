'use strict';

module.exports = function(app) {
    // Email Routes
    var email = require('../controllers/email.server.controller');
    
    app.route('/api/emails/challengeCreated').post(email.sendChallengeCreatedNotification);
};
