'use strict';

angular.module('challenge').controller('ChallengeController', ['$scope', '$state', '$http', '$location', '$window','Challenges',
    function($scope, $state, $http, $location, $window, Challenges) {
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

        $scope.createChallenge = function() {

            if($scope.model.opponentId===-1){
                return;
            }

            $http.get('/api/user').success(function (response) {
                console.log(response);
                // If successful show success message and clear form
                $scope.success = true;
                console.log(response.id);
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
            }).error(function (response) {
                $scope.error = response.message;
            });
        };

        $scope.Won = function() {
            var challengObj = {
                id: 48,
                winner: 50
            };
            $http.post('/api/challenge/update', challengObj).error(function (response) {
                $scope.error = response.message;
            });
        };

        $scope.Lost = function() {
            var challengObj = {
                id: 49,
                winner: 60
            };
            $http.post('/api/challenge/update', challengObj).error(function (response) {
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
