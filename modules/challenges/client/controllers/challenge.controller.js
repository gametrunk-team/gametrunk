'use strict';

angular.module('challenge').controller('ChallengeController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator','Admin', '$uibModal', 'Challenges', 'Circuit',
    function($scope, $state, $http, $location, $window, Authentication, PasswordValidator, Admin, $uibModal, Challenges, Circuit) {
        $scope.authentication = Authentication;
        $scope.popoverMsg = PasswordValidator.getPopoverMsg();
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

        $scope.initPage = function () {
            $scope.challenges = {};
            $scope.challengesToday = [];
            $scope.pastChallenges = [];
            $scope.upcomingChallenges = [];

            $http.get('/api/user').success(function (response) {
                // If successful show success message and clear form
                $scope.success = true;
                $scope.currRank = response.rank;
                $scope.challengerId = response.id;

                new Circuit().then(function (result) {
                    $scope.circuit = result.circuit($scope.currRank);

                    $scope.model = {
                        opponentId: -1
                    };

                    $scope.run = function () {
                    };

                    Challenges.query(function (data) {
                        $scope.users = data;
                        if ($scope.circuit === "World Circuit" && $scope.users.length < 1) {
                            $scope.message = "Looks like you are in position #1! Wait until someone else challenges you.";
                        } else if ($scope.circuit !== "World Circuit" && $scope.currRank % result.cSize === 1) {
                            $scope.message = "You are at the top of your circuit! Play the bottom player from the " + result.circuit($scope.currRank - result.cSize) + " to move up.";
                        } else if ($scope.users.length < 1) {
                            $scope.message = "Looks like you don't have anyone to challenge.";
                        }
                    });
                    $scope.getChallenges();
                });
            }).error(function (response) {
                $scope.error = response.message;
            });
        };

        $scope.initPage();

        $scope.editModal = function (challenge) {
            var modal = $uibModal.open({
                templateUrl: 'modules/challenges/client/views/edit-challenge.client.view.html', // todo
                controller: 'ResultController', // todo
                scope: $scope,
                backdrop: false,
                windowClass: 'app-modal-window',
                resolve: {
                    challenge: function () {
                        return challenge;
                    }
                }
            });

            modal.result.then(function(){
                $scope.initPage();
            });
        };

        $scope.confirmResultModal = function (challenge, winnerId) {
            // var modal = $uibModal.open({
            //     templateUrl: 'modules/challenges/client/views/result-confirmation-modal.client.view.html', // todo
            //     controller: 'ResultController', // todo
            //     scope: $scope,
            //     backdrop: false,
            //     windowClass: 'app-modal-window',
            //     resolve: {
            //         challenge: function () {
            //             return challenge;
            //         }
            //     }
            // });
            //
            // modal.result.then(function(){
                $scope.Submit(challenge, winnerId);
                $scope.initPage();
            // });
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
                templateUrl: 'modules/challenges/client/views/challenge-modal.client.view.html', // todo
                controller: 'ChallengeController', // todo
                scope: $scope,
                backdrop: false,
                windowClass: 'app-modal-window'
            });

            modal.result.then(function(){
                $scope.initPage();
            });
        };

        $scope.createChallenge = function() {
            if($scope.model.opponentId === -1){
                return;
            }
            $scope.challengeeId = $scope.model.opponentId;

            var challengObj = {
                scheduledTime: $scope.dt,
                challengerUserId: $scope.challengerId,
                challengeeUserId: $scope.model.opponentId,
                winnerUserId: null,
                accepted: null
            };

            $http.post('/api/challenge/create', challengObj)
                .success(function (response) {
                    $scope.challengeId = response.id;
                    challengObj.challengeId = response.id;

                    $http.post('/api/emails/challengeCreated', challengObj);
                })
                .error(function (response) {
                    $scope.error = response.message;
                });

            $scope.$close(true);
            toastr.success('Challenge created','Success');
        };


        $scope.getChallenges = function() {
            var params = {
                userId: $scope.challengerId,
                paranoid: true
            };

            $http.post('/api/challenge/mychallenges', params).success(function(response) {
                $scope.challenges = response;
                angular.forEach($scope.challenges,function(value,index){

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
        
        $scope.acceptChallenge = function(challengeId, challengerUserId, challengeeUserId, scheduledTime) {
          
            $http.post('api/challenge/accept', {challengeObj: {challengeId: challengeId, challengerUserId: challengerUserId, challengeeUserId: challengeeUserId, scheduledTime: scheduledTime}}).success(function() {

                toastr.success('Challenge Accepted!','Success');

                $scope.initPage();

            }).catch(function(err) {

                toastr.error('Error accepting challenge (' + err.message + ')', 'Error');

            });
            
        };

        $scope.declineChallenge = function(challengeId, challengerUserId, challengeeUserId, scheduledTime) {

            var modal = $uibModal.open({
                templateUrl: 'modules/challenges/client/views/conformation-modal.client.view.html', // todo
                controller: 'DeclineController', // todo
                scope: $scope,
                backdrop: false,
                windowClass: 'app-modal-window',
                resolve: {
                    challengeId: function () {
                        return challengeId;
                    }
                }
            });

            modal.result.then(function(result) {

                if (result) {

                    $http.post('api/challenge/decline', {
                        challengeObj: {
                            challengeId: challengeId,
                            challengerUserId: challengerUserId,
                            challengeeUserId: challengeeUserId,
                            scheduledTime: scheduledTime
                        }
                    }).success(function () {

                        toastr.success('Challenge Declined', 'Success');

                        $scope.initPage();

                    }).catch(function (err) {

                        toastr.error('Error declining challenge (' + err.message + ')', 'Error');

                    });
                }
                
            });
        };
        

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
        
        // edit challenge result
        $scope.Won = function(challenge, winnerId) {
            console.log(winnerId + " won this challenge. Ran the Won function.");
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
                challenger: challenge.challengerUser.id,
                challengee: challenge.challengeeUser.id
            };

            $http.post('/api/rankings/update', rankingObject).success(function() {
                $scope.initPage();
            }).error(function(response) {
                $scope.error = response.message;
            });
        };


        $scope.Lost = function(challenge, winnerId) {
            console.log(winnerId + " won this challenge; ran the Lost function");
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
                            // toastr.success('Challenge Updated!','Success');
                            // $scope.initPage();
                        }
                    ).error(function(response) {
                        $scope.error = response.message;
                    });
                }
            } else if(winnerId===challenge.challengeeUser.id) {
                if(challenge.challengeeUser.rank > challenge.challengerUser.rank) {
                    rankingObject = {
                        challenger: challenge.challengeeUser.id,
                        challengee: challenge.challengerUser.id
                    };

                    $http.post('/api/rankings/update', rankingObject).success(function() {
                        $scope.initPage();
                    }).error(function(response) {
                        $scope.error = response.message;
                    });
                } else {
                    //create news
                    newsObj = {
                        challenger: challenge.challengerUser.id,
                        challengee: challenge.challengeeUser.id
                    };
                    $scope.initPage();

                    $http.post('/api/news/createChallengeLost', newsObj).success(function() {
                            // toastr.success('Challenge Updated!','Success');
                            // $scope.initPage();
                        }
                    ).error(function(response) {
                        $scope.error = response.message;
                    });
                }
            }
        };
    }
]);
