/**
 * Created by breed on 7/21/16.
 */

'use strict';

angular.module('rankings').controller('RankingController', ['$scope', '$filter', 'Rankings', 'Circuit',
    function($scope, $filter, Rankings, Circuit) {
        $scope.world = [];
        $scope.major = [];
        $scope.minor = [];
        $scope.mosh = [];

        Rankings.query(function(data) {
            $scope.users = data;
            $scope.buildPager();
        });

        $scope.figureOutItemsToDisplay = function() {
            var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
            var end = begin + $scope.itemsPerPage;

            // Separate out by circuit
            $scope.world = $scope.filter($scope.users.slice(0, $scope.cSize));
            $scope.major = $scope.filter($scope.users.slice($scope.cSize, 2*$scope.cSize));
            $scope.minor = $scope.filter($scope.users.slice(2*$scope.cSize, 3*$scope.cSize));
            $scope.mosh = $scope.filter($scope.users.slice(3*$scope.cSize, end));

        };

        $scope.buildPager = function() {
            $scope.pagedItems = [];
            $scope.itemsPerPage = 100;
            $scope.currentPage = 1;
            new Circuit().then(function(result) {
                $scope.cSize = result.cSize;
                $scope.figureOutItemsToDisplay();
            });
        };

        $scope.filter = function(users) {
            $scope.filteredItems = $filter('filter')(users, {
                $: $scope.search
            });
            $scope.filterLength = $scope.filteredItems.length;
            var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
            var end = begin + $scope.itemsPerPage;
            return $scope.filteredItems.slice(begin, end);
        };

        $scope.pageChanged = function() {
            $scope.figureOutItemsToDisplay();
        };
    }
]);
