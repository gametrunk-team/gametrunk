/**
 * Created by breed on 7/21/16.
 */

'use strict';

angular.module('rankings').controller('RankingController', ['$scope', '$filter', 'Rankings',
    function($scope, $filter, Rankings) {

        Rankings.query(function(data) {
            console.log("hello from the other side");
            console.log(data);
            $scope.users = data;
            $scope.buildPager();
        });

        $scope.buildPager = function() {
            $scope.pagedItems = [];
            $scope.itemsPerPage = 15;
            $scope.currentPage = 1;
            $scope.figureOutItemsToDisplay();
        };

        $scope.figureOutItemsToDisplay = function() {
            $scope.filteredItems = $filter('filter')($scope.users, {
                $: $scope.search
            });
            $scope.filterLength = $scope.filteredItems.length;
            var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
            var end = begin + $scope.itemsPerPage;
            $scope.pagedItems = $scope.filteredItems.slice(begin, end);
        };

        $scope.pageChanged = function() {
            $scope.figureOutItemsToDisplay();
        };
    }
]);
