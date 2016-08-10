/**
 * Created by breed on 8/10/16.
 */

angular.module('core').controller('DrCreateController', ['$scope', '$filter', 'DrRankings', '$http',
    function($scope, $filter, DrRankings, $http) {
        $scope.users = [];
        $scope.class = "";
        $scope.selected = [];
        $scope.players = [];

        $scope.isSelected = function(id) {
            return $scope.selected.indexOf(id) !== -1;
        };

        $scope.creatable = false;

        $scope.addPlayer = function(user) {
            // Check to see if player is already there
            var index = $scope.selected.indexOf(user.id);
            if (index !== -1) {
                $scope.selected.splice(index, 1);
                $scope.players.splice(index, 1);
            } else {
                $scope.selected.push(user.id);
                $scope.players.push(user);
            }
            $scope.creatable = $scope.selected.length === 2;
        };

        DrRankings.query(function(data) {
            $scope.users = data;
            $scope.buildPager();
        });

        $scope.figureOutItemsToDisplay = function() {
            $scope.filteredItems = $filter('filter')($scope.users, {
                $: $scope.search
            });
            $scope.filterLength = $scope.filteredItems.length;
            var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
            var end = begin + $scope.itemsPerPage;
            $scope.pagedItems = $scope.filteredItems.slice(begin, end);
        };

        $scope.buildPager = function() {
            $scope.pagedItems = [];
            $scope.itemsPerPage = 10;
            $scope.currentPage = 1;
            $scope.figureOutItemsToDisplay();
        };

        $scope.pageChanged = function() {
            $scope.figureOutItemsToDisplay();
        };
        

        $scope.createChallenge = function() {
            var challengerId = 0;
            var challengeeId = 0;

            if ($scope.players[0].rank > $scope.players[1].rank) {
                challengerId = $scope.players[0].id;
                challengeeId = $scope.players[1].id;
            } else {
                challengerId = $scope.players[1].id;
                challengeeId = $scope.players[0].id;
            }

            var challengObj = {
                scheduledTime: new Date(),
                challengerUserId: challengerId,
                challengeeUserId: challengeeId,
                winnerUserId: null
            };

            $http.post('/api/challenge/create', challengObj)
                .success(function (response) {
                    $scope.challengeId = response.id;
                })
                .error(function (response) {
                    $scope.error = response.message;
                });

            $http.post('/api/emails/challengeCreated', challengObj);

            $scope.$close(true);
            
            // Display a success toast, with a title
            toastr.success('Challenge created','Success');
        };
    }
]);
