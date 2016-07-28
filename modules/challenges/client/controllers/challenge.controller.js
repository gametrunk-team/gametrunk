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
                    scheduledTime: '2012-04-23T18:25:43.511Z',
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
    }
]);
