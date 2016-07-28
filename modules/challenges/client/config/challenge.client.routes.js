// 'use strict';
//
// // Setting up route
// angular.module('challenge').config(['$stateProvider',
//     function($stateProvider) {
//         // User state routing
//         $stateProvider
//             .state('challenge', {
//                 // abstract: true,
//                 url: '/challenge/create',
//                 templateUrl: 'modules/challenges/client/views/challenge-modal.client.view.html'
//             })
//             .state('challenge-result', {
//                 url: 'challenge/result',
//                 templateUrl: 'modules/challenges/client/views/result.client.view.html'
//             });
//     }
// ]);

'use strict';

// Setting up route
angular.module('challenge').config(['$stateProvider',
    function($stateProvider) {
        // User state routing
        // $stateProvider
        //     .state('edit', {
        //         abstract: true,
        //         url: '/edit',
        //         templateUrl: 'modules/challenges/client/views/challenge.client.view.html'
        //     })
        //     .state('edit.create', {
        //         url: '/create',
        //         templateUrl: 'modules/challenges/client/views/challenge-modal.client.view.html'
        //     });
        $stateProvider
            .state('challenge', {
                url: '/challenge',
                abstract: true,
                templateUrl: 'modules/challenges/client/views/challenge.client.view.html',
                data: {
                    roles: ['user']
                },
                controller: 'ChallengeController'
            })
            .state('challenge.create', {
                url: '/challenge',
                templateUrl: 'modules/challenges/client/views/challenge-modal.client.view.html',
                controller: 'ChallengeController'
            });
    }
]);
