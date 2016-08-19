/**
 * Created by breed on 8/10/16.
 */

'use strict';

angular.module('core')

    .config(['IdleProvider', function(IdleProvider) {
        IdleProvider.idle(60);
        IdleProvider.timeout(false);
    }])

    .controller('DrRankingController', ['$scope', '$filter', 'DrRankings', 'Circuit', '$rootScope', 'Idle',
    function($scope, $filter, DrRankings, Circuit, $rootScope, Idle) {

        $scope.world = [];
        $scope.major = [];
        $scope.minor = [];
        $scope.mosh = [];

        if ($rootScope.displayRoom) {

            Idle.watch();

            DrRankings.query(function (data) {
                $scope.users = data;
                $scope.buildPager();
            });

            var populateRankings = function() {
                DrRankings.query(function (data) {
                    $scope.users = data;
                    $scope.buildPager();
                });
            };

            $scope.getRankingsRepeat = setInterval(populateRankings, 5000);

            $scope.$on('IdleStart', function() {
                clearInterval($scope.getRankingsRepeat);
            });

            $scope.$on('IdleEnd', function() {
                populateRankings();
                $scope.getRankingsRepeat = setInterval(populateRankings, 5000);
            });

        }

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
