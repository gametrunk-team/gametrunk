/**
 * Created by breed on 8/12/16.
 */

'use strict';

var
    path = require('path'),
    config = require(path.resolve('./config/config')),
    acl = require('acl');

/**
 * Module dependencies.
 */

// Using the redis backend
/*
 var redisInstance = require('redis').createClient(config.redis.port, config.redis.host, {
 no_ready_check: true
 });

 //Use redis database 1
 redisInstance.select(1);

 if (config.redis.password) {
 redisInstance.auth(config.redis.password);
 }

 acl = new acl(new acl.redisBackend(redisInstance, 'acl'));
 */

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke User Permissions to view and update rankings
 */
exports.invokeRolesPolicies = function() {
    acl.allow(
        [{
            roles: ['user'],
            allows: [{
                resources: '/api/news/create',
                permissions: '*'
            }, {
                resources: '/api/news/createChallengeLost',
                permissions: '*'
            }, {
                resources: '/api/news/getNews',
                permissions: '*'
            }]
        }]
    );
};

/**
 * Check If User Policy Allows
 */
exports.isAllowed = function(req, res, next) {
    var roles = (req.user) ? req.user.roles : ['guest'];

    // Check for user roles
    acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function(err, isAllowed) {
        if (err) {
            // An authorization error occurred.
            return res.status(500).send('Unexpected authorization error');
        } else {
            if (isAllowed) {
                // Access granted! Invoke next middleware
                return next();
            } else {
                return res.status(403).json({
                    message: 'User is not authorized'
                });
            }
        }
    });
};
