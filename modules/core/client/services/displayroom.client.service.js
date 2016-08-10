/**
 * Created by breed on 8/10/16.
 */

angular.module('core').factory('DrRankings', ['$resource',
    function($resource) {
        return $resource('api/rankings/drRankings', {
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

angular.module('core').factory('DrResults', ['$resource',
    function($resource) {
        return $resource('api/rankings/drResults', {
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

angular.module('core').factory('DrUser', ['$resource',
    function($resource) {
        return $resource('api/rankings/drUser', {
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
