/**
 * Created by breed on 7/25/16.
 */

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('rankings').factory('User', ['$resource',
    function($resource) {
        return $resource('api/user', {}, {
            get: {
                method: 'GET'
            },
            update: {
                method: 'PUT'
            }
        });
    }
]);

angular.module('rankings').factory('Rankings', ['$resource',
    function($resource) {
        return $resource('api/rankings/user/:userId', {
            userId: '@_id'
        }, {
            query: {
                method: 'GET',
                params: {},
                isArray: true
            },
            update: {
                method: 'PUT'
            }
        });
    }
]);
