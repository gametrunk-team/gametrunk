'use strict';

module.exports = function(app) {
    // Challenge Routes
    var news = require('../controllers/news.server.controller');

    app.route('/api/news/create').post(news.createChallengeResultNews);
    app.route('/api/news/getNews').post(news.getNews);

};
