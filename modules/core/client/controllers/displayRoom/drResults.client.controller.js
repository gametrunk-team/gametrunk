/**
 * Created by breed on 8/9/16.
 */

'use strict';

angular.module('core').controller('DrResultsController', ['$scope', '$http', '$uibModal', 'DrResults', '$rootScope',
    function($scope, $http, $uibModal, DrResults, $rootScope) {
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

        // edit challenge result
        $scope.Won = function(challenge, winnerId) {
            // Update challenge
            var challengObj = {
                id: challenge.id,
                winnerUserId: winnerId
            };

            $http.post('/api/challenge/update', challengObj).success(function() {
                toastr.success('Challenge Updated!','Success');
                $scope.initPage();
            }).error(function (response) {
                $scope.error = response.message;
            });


            // Updating rankings
            var rankingObject = {
                challenger: winnerId,
                challengee: challenge.challengeeUser.id
            };

            $http.post('/api/rankings/update', rankingObject).success(function() {
                toastr.success('Challenge Updated!','Success');
                $scope.initPage();
            }).error(function(response) {
                $scope.error = response.message;
            });
        };


        $scope.Lost = function(challenge, winnerId) {
            // Update challenge
            var challengObj = {
                id: challenge.id,
                winnerUserId: winnerId
            };
            $http.post('/api/challenge/update', challengObj).success(function() {
                toastr.success('Challenge Updated!', 'Success');
                $scope.initPage();
            }).error(function (response) {
                $scope.error = response.message;
            });


            //create news
            var newsObj = {
                challenger: challenge.challengerUser.id,
                challengee: challenge.challengeeUser.id
            };

            $http.post('/api/news/createChallengeLost', newsObj).success(function() {
                    // toastr.success('Challenge Updated!','Success');
                    // $scope.initPage();
                }
            ).error(function(response) {
                $scope.error = response.message;
            });
        };

        $scope.Submit = function(challenge, winnerId) {
            if(winnerId===challenge.challengerUser.id) {
                $scope.Won(challenge, winnerId);
            } else if(winnerId===challenge.challengeeUser.id) {
                $scope.Lost(challenge, winnerId);
            }
        };

        $scope.dismiss = function() {
            $scope.$dismiss();
        };

        $scope.cancelModal = function (challengeId) {
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
                $scope.initPage();
            });
        };

        $scope.getChallenges = function() {
            var params = {
                userId: $scope.challengerId
            };

            DrResults.query(function(response) {
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
                    value.selected = null;
                });
                $scope.filterChallenges();
            });

        };

        if ($rootScope.displayRoom) {
            $scope.initPage = function () {
                $scope.challenges = {};
                $scope.challengesToday = [];
                $scope.pastChallenges = [];
                $scope.upcomingChallenges = [];
                $scope.getChallenges();
            };

            $scope.initPage();
        }

        $scope.deleteChallenge = function(challengeId) {
            var params = {
                id: challengeId
            };
            $http.post('/api/challenge/delete', params)
                .success(function (data) {
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

            angular.forEach($scope.challenges,function(value,index){
                var scheduledDate = new Date(value.scheduledTime);
                if(scheduledDate>minTimeToday && scheduledDate<maxTimeToday) {
                    $scope.challengesToday.push(value);
                } else if(scheduledDate<minTimeToday) {
                    $scope.pastChallenges.push(value);
                } else if(scheduledDate>maxTimeToday) {
                    $scope.upcomingChallenges.push(value);
                }
            });
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
