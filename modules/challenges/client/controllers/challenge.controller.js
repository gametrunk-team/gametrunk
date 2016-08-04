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
        

        $http.get('/api/user').success(function (response) {
            // If successful show success message and clear form
            $scope.success = true;
            $scope.currRank = response.rank;
            $scope.challengerId = response.id;
            $scope.circuit = Circuit.circuit($scope.currRank);

            $scope.model = {
                opponentId: -1
            };

            $scope.run = function() {
                console.log($scope.opponent.model);
            };

            Challenges.query(function(data) {
                $scope.users = data;
                if ($scope.circuit === "World Circuit" && $scope.users.length < 1) {
                    $scope.message = "Looks like you are in position #1! Wait until someone else challenges you.";
                } else if ($scope.circuit !== "World Circuit" && $scope.currRank % 10 === 1) {
                    $scope.message = "You are at the top of your circuit! Play the bottom player from the " + $scope.determineCircuit($scope.currRank - 10) + " to move up.";
                } else if ($scope.users.length < 1) {
                    $scope.message = "Looks like you don't have anyone to challenge.";
                }
            });

        }).error(function (response) {
            $scope.error = response.message;
        });


        $scope.emailModal = function () {
            console.log("making the email modal");
            var modal = $uibModal.open({
                templateUrl: 'modules/challenges/client/views/result.client.view.html', // todo
                controller: 'ResultController', // todo
                scope: $scope,
                backdrop: false,
                windowClass: 'app-modal-window'
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
                    $scope.emailModal();
                })
                .error(function (response) {
                    $scope.error = response.message;
                });

            console.log("sending challenge email");
            $http.post('/api/emails/challengeCreated', challengObj);

        };


        $scope.getChallenges = function() {
            $http.get('/api/challenge/getall').success(function(response) {
                //console.log(response);
            });
        };

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
