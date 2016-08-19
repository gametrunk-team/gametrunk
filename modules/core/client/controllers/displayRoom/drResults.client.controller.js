/**
 * Created by breed on 8/9/16.
 */

'use strict';

angular.module('core')

    .config(['IdleProvider', function(IdleProvider) {
        IdleProvider.idle(60);
        IdleProvider.timeout(false);
    }])

    .controller('DrResultsController', ['$scope', '$http', '$uibModal', 'DrResults', '$rootScope', 'Idle',
    function($scope, $http, $uibModal, DrResults, $rootScope, Idle) {
        
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

        $scope.Submit = function(challenge, winnerId) {
            // Update challenge
            var challengObj = {
                id: challenge.id,
                winnerUserId: winnerId
            };

            $http.post('/api/challenge/update', challengObj).success(function() {
                toastr.success('Challenge Updated!','Success');
            }).error(function (response) {
                $scope.error = response.message;
            });


            var rankingObject = {};
            var newsObj = {};

            // Updating rankings if winner is of lower rank
            if(winnerId===challenge.challengerUser.id) {
                if(challenge.challengerUser.rank > challenge.challengeeUser.rank) {
                    rankingObject = {
                        challenger: challenge.challengerUser.id,
                        challengee: challenge.challengeeUser.id
                    };

                    $http.post('/api/rankings/update', rankingObject).success(function() {
                        $scope.initPage();
                    }).error(function(response) {
                        $scope.error = response.message;
                    });
                } else {
                    //create news
                    newsObj = {
                        challenger: challenge.challengeeUser.id,
                        challengee: challenge.challengerUser.id
                    };

                    $scope.initPage();

                    $http.post('/api/news/createChallengeLost', newsObj).success(function() {
                        }
                    ).error(function(response) {
                        $scope.error = response.message;
                    });
                }
            } else if(winnerId===challenge.challengeeUser.id) {
                if (challenge.challengeeUser.rank > challenge.challengerUser.rank) {
                    rankingObject = {
                        challenger: challenge.challengeeUser.id,
                        challengee: challenge.challengerUser.id
                    };

                    $http.post('/api/rankings/update', rankingObject).success(function () {
                        $scope.initPage();
                    }).error(function (response) {
                        $scope.error = response.message;
                    });
                } else {
                    //create news
                    newsObj = {
                        challenger: challenge.challengerUser.id,
                        challengee: challenge.challengeeUser.id
                    };
                    $scope.initPage();

                    $http.post('/api/news/createChallengeLost', newsObj).success(function () {
                        }
                    ).error(function (response) {
                        $scope.error = response.message;
                    });
                }
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

            Idle.watch();

            $scope.$on('IdleStart', function() {
                
            });

            $scope.$on('IdleEnd', function() {
                $scope.initPage();
            });
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
