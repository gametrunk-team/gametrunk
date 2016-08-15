'use strict';

module.exports = function(app) {
    // Email Routes
    var email = require('../controllers/email.server.controller'),
        emailPolicy = require('../policies/email.server.policy');
    
    app.route('/api/emails/challengeCreated').post(emailPolicy.isAllowed, email.sendChallengeCreatedNotification);
    app.route('/api/emails/challengeTimeChangeNotification').post(emailPolicy.isAllowed, email.sendChallengeTimeChangedNotification);
};
