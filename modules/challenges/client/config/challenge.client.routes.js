'use strict';

// Setting up route
angular.module('challenge').config(['$stateProvider',
    function($stateProvider) {
        // User state routing
        $stateProvider
            .state('challenge', {
                // abstract: true,
                url: 'create',
                templateUrl: 'modules/challenges/client/views/challenge-modal.client.view.html',
            })
            .state('challenge-result', {
                url: 'result',
                templateUrl: 'modules/challenges/client/views/result.client.view.html',
                data: {
                    ignoreState: true
                }
            });
    }
]);
