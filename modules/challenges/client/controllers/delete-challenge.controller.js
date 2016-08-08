'use strict';

angular.module('challenge').controller('DeleteController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator','Admin', '$uibModal', 'Challenges', 'Circuit','challengeId',
    function($scope, $state, $http, $location, $window, Authentication, PasswordValidator, Admin, $uibModal, Challenges, Circuit, challengeId) {
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

        $scope.deleteChallenge = function() {
            console.log($scope);
            var params = {
                id: challengeId
            };
            console.log("deleting challenge with id " + challengeId);
            $http.post('/api/challenge/delete', params)
                .success(function (data) {
                    console.log("success");
                    toastr.success('Challenge Deleted','Success');
                });
            $scope.$close(true);
        };

        $scope.dismiss = function() {
            $scope.$close(true);
        };
        
    }
]);
