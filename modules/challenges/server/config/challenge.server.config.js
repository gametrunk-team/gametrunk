'use strict';

/**
 * Module dependencies.
 */
var
    path = require('path'),
    config = require(path.resolve('./config/config')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    Challenge = db.challenge;

/**
 * Module init function.
 */
module.exports = function(app, db) {
    
};
