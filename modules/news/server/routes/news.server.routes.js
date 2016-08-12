'use strict';

module.exports = function(app) {
    // Challenge Routes
    var news = require('../controllers/news.server.controller'),
        newsPolicy = require('../policies/news.server.policy');

    app.route('/api/news/create').post(newsPolicy.isAllowed, news.createChallengeResultNews);
    app.route('/api/news/createChallengeLost').post(newsPolicy.isAllowed, news.createChallengeLostNews);
    app.route('/api/news/getNews').post(newsPolicy.isAllowed, news.getNews);

};
