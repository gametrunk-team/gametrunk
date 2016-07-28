/**
 * Created by breed on 7/22/16.
 */

'use strict';

/**
 * Module dependencies.
 */
var rankingsPolicy = require('../policies/rankings.server.policy'),
    rankings = require('../controllers/rankings.server.controller.js');

module.exports = function(app) {
    // User route registration first. Ref: #713
    //require('./user.server.routes.js')(app);

    app.route('/api/rankings/user').get(rankingsPolicy.isAllowed, rankings.list);

    app.route('/api/rankings/user/:userId').get(rankingsPolicy.isAllowed, rankings.read);

    app.route('/api/rankings/update').post(rankingsPolicy.isAllowed, rankings.updateRanking);

    app.param('userId', rankings.userByID);
};
