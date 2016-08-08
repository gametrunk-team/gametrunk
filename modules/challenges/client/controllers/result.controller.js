/**
 * Created by breed on 7/26/16.
 */

'use strict';

angular.module('challenge').controller('ResultController', ['$scope', '$state', '$http','Authentication','challengerUser', 'challengeeUser','challengeId',
    function($scope, $state, $http, Authentication, challengerUser, challengeeUser, challengeId) {

        $scope.model = {
            Id: -1
        };

        $scope.challengerUser = challengerUser;
        $scope.challengeeUser = challengeeUser;
        $scope.challengeId = challengeId;

        $scope.opponent = $scope.users.filter(function( obj ) {
            return obj.id === $scope.challengeeId;
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
                challenger: $scope.challengerUser.id,
                challengee: $scope.challengeeUser.id
            };
            $http.post('/api/rankings/update', rankingObject).error(function(response) {
                $scope.error = response.message;
            });
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
        };

        $scope.getSelectedChallenge = function() {

            var challengObj = {
                id: $scope.challengeId
            };
            $http.post('/api/challenge/get', challengObj)
                .success(function (response) {
                    console.log(response);
                    $scope.dt = response.scheduledTime;
                    $scope.dt = new Date(response.scheduledTime);
                    $scope.initTimePicker($scope.dt);
                })
                .error(function (response) {
                    console.log(response);
                });
        };

        $scope.getSelectedChallenge();

        $scope.Submit = function() {
            console.log($scope);
            if($scope.model.Id===$scope.challengerUser.id) {
                $scope.Won();
            } else if($scope.model.Id===$scope.challengeeUser.id) {
                $scope.Lost();
            }
            $scope.dismiss();
        };

        $scope.dismiss = function() {
            console.log($scope);
            $scope.$close(true);
        };


        // TODO: would probably be good to break the modal logic below out into its own controller

        $scope.min = null;
        $scope.max = null;
        $scope.dt = null;

        $scope.initTimePicker = function(selectedDate) {
            var min = new Date(selectedDate.getTime());
            min.setHours(0);
            min.setMinutes(0);
            $scope.min = min;

            var max = new Date(selectedDate.getTime());
            max.setHours(24);
            max.setMinutes(0);
            $scope.max = max;
        };

        $scope.init = function() {
            $scope.dt = new Date();
            $scope.dt.setHours(12);
            $scope.dt.setMinutes(0);
            $scope.dt.setMilliseconds(0);
            $scope.initTimePicker($scope.dt);
        };

        $scope.clear = function() {
            $scope.dt = null;
        };

        $scope.open = function() {
            $scope.popup.opened = true;
        };


        $scope.popup = {
            opened: false
        };

        $scope.dateChange = function() {
            $scope.initTimePicker($scope.dt);
        };

    }
]);
