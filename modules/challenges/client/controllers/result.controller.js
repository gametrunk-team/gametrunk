/**
 * Created by breed on 7/26/16.
 */

'use strict';

angular.module('challenge').controller('ResultController', ['$scope', '$state', '$http','Authentication','challenge',
    function($scope, $state, $http, Authentication, challenge) {

        var challengerUser = challenge.challengerUser;
        var challengeeUser = challenge.challengeeUser;
        var challengeId = challenge.id;

        $scope.model = {
            Id: -1
        };

        $scope.challengeId = challengeId;

        $scope.Submit = function() {
            // Update challenge
            var challengObj = {
                id: $scope.challengeId,
                scheduledTime: $scope.dt
            };
            $http.post('/api/challenge/update', challengObj).error(function (response) {
                $scope.error = response.message;
            });
            
            var param = {};
            if(Authentication.user.id===challengeeUser.id) {
                param = {
                    challengObj: challengObj,
                    changedTimeUserId: challengeeUser.id,
                    otherUserId: challengerUser.id
                };
            } else {
                param = {
                    challengObj: challengObj,
                    changedTimeUserId: challengerUser.id,
                    otherUserId: challengeeUser.id
                };
            }

            $http.post('/api/emails/challengeTimeChangeNotification', param).success(function() {
                toastr.success('Time updated & notification email sent!', 'Success');
                $scope.initPage();
            }).error(function (response) {
                $scope.error = response.message;
            });
            $scope.$close(true);
        };

        $scope.dismiss = function() {
            $scope.$dismiss();
        };
        
        $scope.confirm = function () {
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
            $scope.dt = new Date(challenge.scheduledTime);
            $scope.initTimePicker($scope.dt);
        };

        $scope.init();

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
