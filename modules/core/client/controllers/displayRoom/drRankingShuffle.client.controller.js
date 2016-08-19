/**
 * Created by breed on 8/18/16.
 */

'use strict';

angular.module('core').controller('DrShuffleController', ['$scope', '$filter', 'DrRankings', '$uibModal', '$rootScope', '$window',
    function($scope, $filter, DrRankings, $uibModal, $rootScope, $window) {

        $scope.shuffleItems = [];
        $scope.itemsPerPage = 100;
        $scope.currentPage = 1;
        $scope.users = [];

        $scope.figureOutItemsToDisplayShuffle = function() {
            $scope.filteredItems = $filter('filter')($scope.users, {
                $: $scope.search
            });
            $scope.filterLength = $scope.filteredItems.length;
            var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
            var end = begin + $scope.itemsPerPage;
            $scope.shuffleItems = $scope.filteredItems.slice(begin, end);
        };

        if ($rootScope.displayRoom) {
            DrRankings.query(function(data) {
                $scope.users = data;
                $scope.users.sort(function(a,b) {return (a.lastName > b.lastName) ? 1 : ((b.lastName > a.lastName) ? -1 : 0);} );
                $scope.figureOutItemsToDisplayShuffle();
            });
        }

        $scope.pageChanged = function() {
            $scope.figureOutItemsToDisplayShuffle();
        };

        $scope.selectUser = function(user) {
            $scope.selectedUser = user;

            var modal = $uibModal.open({
                templateUrl: 'modules/core/client/views/displayRoom/drConfirmModal.client.view.html',
                controller: 'DrConfirmModalController',
                scope: $scope,
                windowClass: 'app-modal-window'
            });

            modal.result.then(function(){
                console.log("modal closed");
                window.location.reload(true);
            });
        };
    }
]);
