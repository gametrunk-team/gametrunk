'use strict';

angular.module('challenge').controller('ChallengeController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator','Admin', '$uibModal', 'Challenges',
    function($scope, $state, $http, $location, $window, Authentication, PasswordValidator, Admin, $uibModal, Challenges) {
        $scope.authentication = Authentication;
        $scope.popoverMsg = PasswordValidator.getPopoverMsg();
        $scope.selectedTime = 'Now';

        $scope.userId = -1;

        $scope.model = {
            opponentId: -1
        };

        $scope.run = function() {
            console.log($scope.opponent.model);
        };

        Challenges.query(function(data) {
            $scope.users = data;
        });

        // Variables saved for UserController
        $scope.challengeId = -1;
        $scope.challengerId = -1;
        $scope.challengeeId = -1;

        $scope.emailModal = function () {
            console.log("making the email modal");
            var modal = $uibModal.open({
                templateUrl: 'modules/challenges/client/views/result.client.view.html', // todo
                controller: 'ResultController', // todo
                scope: $scope,
                backdrop: false,
                windowClass: 'minimal-modal'
            });
        };

        $scope.createChallenge = function() {
            if($scope.model.opponentId === -1){
                return;
            }

            $http.get('/api/user').success(function (response) {
                // If successful show success message and clear form
                $scope.success = true;
                $scope.challengerId = response.id;
                $scope.challengeeId = $scope.model.opponentId;
                
                var challengObj = {
                    scheduledTime: $scope.dt,
                    challengerUserId: response.id,
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

            }).error(function (response) {
                $scope.error = response.message;
            });


        };
        

        $scope.getChallenges = function() {
            $http.get('/api/challenge/getall').success(function(response) {
                console.log(response);
            });
        };

        $scope.min = null;
        $scope.max = null;

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
        }
    }
]);
