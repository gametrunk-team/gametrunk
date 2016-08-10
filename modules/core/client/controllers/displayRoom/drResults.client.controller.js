/**
 * Created by breed on 8/9/16.
 */

'use strict';

angular.module('core').controller('DrResultsController', ['$scope', '$http', '$uibModal', 'DrResults',
    function($scope, $http, $uibModal, DrResults) {
        $scope.selectedTime = 'Now';
        $scope.message = "";

        // Variables saved for UserController
        $scope.challengeId = -1;
        $scope.challengerId = -1;
        $scope.challengeeId = -1;

        $scope.challenges = {};
        $scope.challengesToday = [];
        $scope.pastChallenges = [];
        $scope.upcomingChallenges = [];

        $scope.editModal = function (challengeeUser, challengerUser, challengeId) {
            console.log("making the edit modal");
            var modal = $uibModal.open({
                templateUrl: 'modules/challenges/client/views/edit-challenge.client.view.html', // todo
                controller: 'ResultController', // todo
                scope: $scope,
                backdrop: false,
                windowClass: 'app-modal-window',
                resolve: {
                    challengerUser: function () {
                        return challengerUser;
                    },
                    challengeeUser: function () {
                        return challengeeUser;
                    },
                    challengeId: function () {
                        return challengeId;
                    }
                }
            });

            modal.result.then(function(){
                $scope.initPage();
            });
        };

        $scope.cancelModal = function (challengeId) {
            console.log("making the cancel modal");
            console.log($scope.challengeId);
            var modal = $uibModal.open({
                templateUrl: 'modules/challenges/client/views/cancel-modal.client.view.html', // todo
                controller: 'DeleteController', // todo
                scope: $scope,
                backdrop: false,
                windowClass: 'app-modal-window',
                resolve: {
                    challengeId: function () {
                        return challengeId;
                    }
                }
            });

            modal.result.then(function(){
                $scope.initPage();
            });
        };

        $scope.createChallengeModal = function () {
            var modal = $uibModal.open({
                templateUrl: 'modules/core/client/views/displayRoom/drCreate.client.view.html', // todo
                controller: 'DrCreateController', // todo
                scope: $scope,
                size: 'lg',
                windowClass: 'app-modal-window'
            });

            modal.result.then(function(){
                console.log("modal result");
                $scope.initPage();
            });
        };

        $scope.getChallenges = function() {
            console.log("challenger Id: " + $scope.challengerId);
            var params = {
                userId: $scope.challengerId
            };

            DrResults.query(function(response) {
                console.log("querying dr results");
                $scope.challenges = response;
                angular.forEach($scope.challenges, function(value, index) {

                    $http.post('/api/user/getUserById', { userId: value.challengerUserId })
                        .success(function (data) {
                            value.challengerUser = data;
                        });

                    $http.post('/api/user/getUserById', { userId: value.challengeeUserId })
                        .success(function (data) {
                            value.challengeeUser = data;
                        });
                });
                console.log("$scope.challenges", $scope.challenges);
                $scope.filterChallenges();
            });
        };

        $scope.initPage = function () {
            $scope.challenges = {};
            $scope.challengesToday = [];
            $scope.pastChallenges = [];
            $scope.upcomingChallenges = [];
            $scope.getChallenges();
        };

        $scope.initPage();

        $scope.deleteChallenge = function(challengeId) {
            console.log($scope);
            var params = {
                id: challengeId
            };
            console.log("deleting challenge with id " + $scope.challengeId);
            $http.post('/api/challenge/delete', params)
                .success(function (data) {
                    console.log("success");
                });
            $scope.$dismiss();
        };

        $scope.dismiss = function() {
            $scope.$dismiss();
        };

        //filters all a user's challenges into the ones happening today
        $scope.filterChallenges = function() {
            var minTimeToday = new Date();
            minTimeToday.setHours(0);
            minTimeToday.setMinutes(0);

            var maxTimeToday = new Date();
            maxTimeToday.setHours(23);
            maxTimeToday.setMinutes(59);

            console.log($scope.challenges);

            angular.forEach($scope.challenges,function(value,index){
                var scheduledDate = new Date(value.scheduledTime);
                if(scheduledDate>minTimeToday && scheduledDate<maxTimeToday) {
                    console.log("adding challenge to today: " + value);
                    $scope.challengesToday.push(value);
                } else if(scheduledDate<minTimeToday) {
                    console.log("adding challenge to past challenges: " + value);
                    $scope.pastChallenges.push(value);
                } else if(scheduledDate>maxTimeToday) {
                    console.log("adding challenge to upcoming: " + value);
                    $scope.upcomingChallenges.push(value);
                }
            });
            console.log("the final count" + $scope.challenges);
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
