'use strict';

angular.module('challenge').controller('ChallengeController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator','Admin',
    function($scope, $state, $http, $location, $window, Authentication, PasswordValidator) {
        $scope.authentication = Authentication;
        $scope.popoverMsg = PasswordValidator.getPopoverMsg();
        $scope.selectedTime = 'Now';

        $scope.userId = -1;

        $scope.opponent = {
            model: -1
        };

        $scope.run = function() {
            console.log($scope.opponent.model);
        };

        // Get an eventual error defined in the URL query string:
        $scope.error = $location.search().err;

        // If user is signed in then redirect back home
        if ($scope.authentication.user) {
            $location.path('/');
        }

        $scope.getOpponents = function() {
            $http.get('/api/user/getopponents').success(function(response) {
                console.log(response);
                $scope.users = response;
                $scope.opponent.model = $scope.users[0].id;
            });
        };
        $scope.getOpponents();

        $scope.createChallenge = function() {

            if($scope.opponent.model===-1){
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
                    challengee: $scope.opponent.model,
                    winner: null
                };

                console.log(challengObj);

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
        $scope.getChallenges();
    }
]);
