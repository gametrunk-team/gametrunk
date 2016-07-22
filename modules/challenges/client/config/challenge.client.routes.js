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
        $stateProvider
            .state('edit', {
                abstract: true,
                url: '/edit',
                templateUrl: 'modules/challenges/client/views/challenge.client.view.html'
            })
            .state('edit.create', {
                url: '/create',
                templateUrl: 'modules/challenges/client/views/challenge-modal.client.view.html'
            })
            .state('edit.result', {
                url: '/result',
                templateUrl: 'modules/challenges/client/views/result.client.view.html'
            });
    }
]);
