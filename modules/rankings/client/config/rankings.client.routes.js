'use strict';

// Setting up route
angular.module('user').config(['$stateProvider',
    function($stateProvider) {
        // User state routing
        $stateProvider
            .state('rankings', {
                url: '/rankings',
                abstract: true,
                templateUrl: 'modules/rankings/client/views/rankings/list-rankings.client.view.html',
                data: {
                    roles: ['user']
                },
                controller: 'RankingController'
            })
            .state('rankings.users', {
                url: '/users',
                template: '',
                controller: 'RankingController'
            })
            .state('rankings.user', {
                url: '/user/:userId',
                templateUrl: 'modules/rankings/client/views/rankings/view-user.client.view.html', // TODO
                controller: 'UserController',// TODO
                resolve: {
                    userResolve: ['$stateParams', 'Rankings', function($stateParams, Rankings) { // TODO
                        return Rankings.get({
                            userId: $stateParams.userId
                        });
                    }]
                }
            });
    }
]);
