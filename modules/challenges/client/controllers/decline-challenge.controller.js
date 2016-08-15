'use strict';

angular.module('challenge').controller('DeclineController', ['$scope', '$uibModal', '$uibModalInstance',
    function($scope, $uibModal, $uibModalInstance) {

        $scope.decline = function() {
            $uibModalInstance.close(true);
        };

        $scope.dismiss = function() {
            $uibModalInstance.close(false);
        };

    }
]);
