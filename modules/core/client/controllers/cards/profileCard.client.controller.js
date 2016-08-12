/**
 * Created by breed on 8/3/16.
 */
'use strict';

angular.module('core').controller('ProfileCardController', ['$scope', '$timeout', '$window', 'Authentication', 'Circuit', '$http', 'lodash',
    function($scope, $timeout, $window, Authentication, Circuit, $http, lodash) {
        $scope.gamesWon = 0;
        $scope.gamesLost = 0;
        $scope.user = Authentication.user;
        $scope.imageURL = $scope.user.profileImageURL;
        $scope.displayRank = "";
        $scope.circuit = "";

        $http.get('/api/user').success(function (response) {
            new Circuit().then(function(result) {
                $scope.circuit = result.circuit(response.rank);
                $scope.displayRank = result.displayRank(response.rank);
            });

            var params = {
                userId: $scope.user.id,
                paranoid: false
            };

            $http.post('/api/challenge/mychallenges', params).success(function (challenges) {

                lodash.forEach(challenges, function(challenge) {

                    if($scope.user.id === challenge.winnerUserId) {
                        $scope.gamesWon++;
                    } else if(challenge.winnerUserId !== null && challenge.winnerUserId !== -1) {
                        $scope.gamesLost++;
                    }
                });

        }).error(function (response) {
            $scope.error = response.message;
        });
            
        }).catch(function(err) {
            console.log(err);
        });
        
    }
]);
