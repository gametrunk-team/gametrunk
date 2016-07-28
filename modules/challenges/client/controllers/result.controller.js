/**
 * Created by breed on 7/26/16.
 */

'use strict';

angular.module('challenge').controller('ResultController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator','Admin', '$uibModalInstance',
    function($scope, $state, $http, $location, $window, Authentication, PasswordValidator, $uibModalInstance) {

        $scope.Won = function() {
            // Update challenge
            var challengObj = {
                id: $scope.challengeId,
                winnerUserId: $scope.challengerId
            };
            $http.post('/api/challenge/update', challengObj).error(function (response) {
                $scope.error = response.message;
            });


            // Updating rankings
            var rankingObject = {
                challenger: $scope.challengerId,
                challengee: $scope.challengeeId
            };
            $http.post('/api/rankings/update', rankingObject).error(function(response) {
                $scope.error = response.message;
            });

            $state.go('home');
        };


        $scope.Lost = function() {
            // Update challenge
            var challengObj = {
                id: $scope.challengeId,
                winnerUserId: $scope.challengeeId
            };
            $http.post('/api/challenge/update', challengObj).error(function (response) {
                $scope.error = response.message;
            });
            
            // No changes to rankings necessary

            $state.go('home');
        };

    }
]);
