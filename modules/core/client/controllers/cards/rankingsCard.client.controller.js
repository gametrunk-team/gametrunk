/**
 * Created by breed on 8/5/16.
 */

'use strict';

angular.module('rankings').controller('RankingCardController', ['$scope', '$filter', 'Rankings',
    function($scope, $filter, Rankings) {
        $scope.world = [];
        $scope.major = [];
        $scope.minor = [];
        $scope.mosh = [];

        Rankings.query(function(data) {
            $scope.users = data;
            $scope.buildPager();
        });

        $scope.buildPager = function() {
            $scope.pagedItems = [];
            $scope.itemsPerPage = 100;
            $scope.currentPage = 1;
            $scope.figureOutItemsToDisplay();
        };

        $scope.figureOutItemsToDisplay = function() {
            var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
            var end = begin + $scope.itemsPerPage;

            // Separate out by circuit
            $scope.world = $scope.filter($scope.users.slice(0, 10));
            $scope.major = $scope.filter($scope.users.slice(10, 20));
            $scope.minor = $scope.filter($scope.users.slice(20, 30));
            $scope.mosh = $scope.filter($scope.users.slice(30, end));
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
