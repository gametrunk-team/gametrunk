'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('challenge').factory('User', ['$resource',
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

angular.module('challenge').factory('Challenges', ['$resource',
    function($resource) {
        return $resource('api/rankings/challengees', {
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
