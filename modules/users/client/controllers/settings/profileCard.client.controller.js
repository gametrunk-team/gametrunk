/**
 * Created by breed on 8/3/16.
 */
'use strict';

angular.module('user').controller('ProfileCardController', ['$scope', '$timeout', '$window', 'Authentication',
    function($scope, $timeout, $window, Authentication) {
        $scope.user = Authentication.user;
        $scope.imageURL = $scope.user.profileImageURL;
    }
]);
