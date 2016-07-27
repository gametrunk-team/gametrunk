'use strict';

angular.module('challenge').controller('ChallengeController', ['$scope', '$state', '$http', '$location', '$window', 'Challenges', '$uibModal',
    function($scope, $state, $http, $location, $window, Challenges, $uibModal) {
        $scope.selectedTime = 'Now';

        $scope.userId = -1;

        $scope.opponent = {
            model: -1
        };
        
        $scope.model = {
            opponentId: -1
        };

        Challenges.query(function(data) {
            $scope.users = data;
        });

        $scope.challengerId = -1;
        $scope.challengeeId = -1;

        $scope.emailModal = function () {
            console.log("making the email modal");
            var modal = $uibModal.open({
                templateUrl: 'modules/challenges/client/views/result.client.view.html', // todo
                // template: '<p>wow check out this modal</p>'
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
                console.log("response", response);
                $scope.challengerId = response.id;
                console.log("challengerUserId p3", $scope.challengerId);
                $scope.challengeeId = $scope.opponent.model;
                $scope.userId = response.id;
                var challengObj = {
                    scheduledTime: '2012-04-23T18:25:43.511Z',
                    challenger: response.id,
                    challengee: $scope.model.opponentId,
                    winner: null
                };

                $http.post('/api/challenge/create', challengObj).error(function (response) {
                    $scope.error = response.message;
                });

                console.log("challengeeID", $scope.challengeeId);
                console.log("challengerId", $scope.challengerId);

                //$state.go('edit.result');
                
                $scope.emailModal();
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
