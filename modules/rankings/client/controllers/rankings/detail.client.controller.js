/**
 * Created by breed on 7/22/16.
 */

'use strict';

angular.module('rankings').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve',
    function($scope, $state, Authentication, userResolve) {

        $scope.authentication = Authentication;
        $scope.user = userResolve;
        
        $scope.update = function(isValid) {
            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'userForm');
                return false;
            }

            var user = $scope.user;

            user.$update({
                'userId': user.id
            }, function() {
                $state.go('admin.user', {
                    userId: user.id
                });
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };
    }
]);
