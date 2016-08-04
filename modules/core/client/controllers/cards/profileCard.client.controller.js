/**
 * Created by breed on 8/3/16.
 */
'use strict';

angular.module('core').controller('ProfileCardController', ['$scope', '$timeout', '$window', 'Authentication', 'Circuit', '$http',
    function($scope, $timeout, $window, Authentication, Circuit, $http) {
        $scope.user = Authentication.user;
        $scope.imageURL = $scope.user.profileImageURL;
        $scope.displayRank = "Unknown";
        $scope.circuit = "Unknown";

        $http.get('/api/user').success(function (response) {
            $scope.circuit = Circuit.circuit(response.rank);
            $scope.displayRank = Circuit.displayRank(response.rank);

        }).error(function (response) {
            $scope.error = response.message;
        });
    }
]);
