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
                    console.log("getting the user!!!");
                });
            }).error(function (response) {
                $scope.error = response.message;
            });
        };

        $scope.initPage();

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
            console.log("making the cancel modal");
            console.log($scope.challengeId);
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
                winnerUserId: null
            };

            $http.post('/api/challenge/create', challengObj)
                .success(function (response) {
                    $scope.challengeId = response.id;
                })
                .error(function (response) {
                    $scope.error = response.message;
                });

            $http.post('/api/emails/challengeCreated', challengObj);

            $scope.$close(true);
            // Display a success toast, with a title
            toastr.success('Challenge created','Success');
        };


        $scope.getChallenges = function() {
            console.log("challenger Id: " + $scope.challengerId);
            var params = {
                userId: $scope.challengerId
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
                });
                $scope.filterChallenges();
            });

        };

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
