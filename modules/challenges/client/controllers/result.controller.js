/**
 * Created by breed on 7/26/16.
 */

'use strict';

angular.module('challenge').controller('ResultController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator','Admin', '$uibModalInstance',
    function($scope, $state, $http, $location, $window, Authentication, PasswordValidator, $uibModalInstance) {

        console.log("result scope", $scope);

        $scope.Won = function() {
            console.log("won $scope", $scope.challengeeId, $scope.challengerId);

            var challengObj = {
                id: 48,
                winner: $scope.challengerId
            };
            $http.post('/api/challenge/update', challengObj).error(function (response) {
                $scope.error = response.message;
            });


            // Updating rankings
            var rankingObject = {
                challenger: $scope.challengerId,
                challengee: $scope.challengeeId
            };
            $http.post('/api/rankings/update', rankingObject).error(function(response) {
                $scope.error = response.message;
            });


            $uibModalInstance.close();
        };



        $scope.Lost = function() {
            var challengObj = {
                id: 49,
                winner: $scope.challengeeId
            };
            $http.post('/api/challenge/update', challengObj).error(function (response) {
                $scope.error = response.message;
            });
        };

    }
]);
