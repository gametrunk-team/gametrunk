/**
 * Created by breed on 7/26/16.
 */

'use strict';

angular.module('challenge').controller('ResultController', ['$scope', '$state', '$http',
    function($scope, $state, $http) {

        $scope.model = {
            Id: -1
        };

        $scope.opponent = $scope.users.filter(function( obj ) {
            return obj.id === $scope.challengeeId;
        })[0];

        $scope.me = $scope.users.filter(function( obj ) {
            return obj.id === $scope.challengerId;
        })[0];
        
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
        
        $scope.Submit = function() {
            if($scope.model.Id===$scope.me.id) {
                $scope.Won();
            } else if($scope.model.Id===$scope.opponent.id) {
                $scope.Lost();
            }
        };

    }
]);
