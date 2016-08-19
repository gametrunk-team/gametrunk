/**
 * Created by breed on 8/18/16.
 */

'use strict';

angular.module('core').controller('DrConfirmModalController', ['$scope', '$http', '$uibModal', '$window',
    function ($scope, $http, $uibModal, $window) {

        $scope.drop = function () {
            console.log("dropping", $scope.$parent.selectedUser.displayName);

            $http.post('/api/rankings/drDropUser', $scope.$parent.selectedUser).success(function (result) {
                $scope.$close(true);
                $window.init();
            });
        };

        $scope.cancel = function () {
            $scope.$close(true);
        };
    }
]);
