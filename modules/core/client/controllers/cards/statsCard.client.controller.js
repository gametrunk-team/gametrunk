'use strict';

angular.module('core').controller('StatsCardController', ['$scope', '$timeout', '$window', 'Authentication', 'Circuit', '$http','Rankings','Challenges',
    function($scope, $timeout, $window, Authentication, Circuit, $http, Rankings, Challenges) {

        Rankings.query(function(data) {
            $scope.users = data;
            $http.get('/api/user').success(function (response) {
                $scope.currentUserId = response.id;

                $http.get('/api/challenge/getall').success(function (data) {
                    $scope.stats = [];
                    $scope.labels = [];
                    $scope.colors = [];
                    $scope.challenges = data;

                    angular.forEach($scope.users, function (user, index) {
                        //get # of games player for this user and set this variable
                        var games = 0;
                        var wins = 0.0;
                        var losses = 0.0;
                        angular.forEach($scope.challenges, function (challenge, index) {
                            if (challenge.challengerUserId === user.id || challenge.challengeeUserId === user.id) {
                                games++;
                                if (challenge.winnerUserId === user.id) {
                                    wins++;
                                } else if (challenge.winnerUserId === challenge.challengeeUserId) {
                                    losses++;
                                }
                            }
                        });
                        user.gamesPlayed = games;
                        if (losses === 0) {
                            user.winLossRatio = 0;
                        } else {
                            user.winLossRatio = wins / losses;
                        }
                    });

                    angular.forEach($scope.users, function (value, index) {
                        var obj = [{
                            x: value.gamesPlayed,
                            y: value.rank,
                            r: value.winLossRatio * 10.0,
                            label: 'this is a test'
                        }];
                        $scope.stats.push(obj);
                        if ($scope.currentUserId===value.id)
                        {
                            $scope.labels.push('me');
                            $scope.colors.push('#ff0000');
                        } else {
                            $scope.labels.push(value.displayName);
                            $scope.colors.push('');
                        }
                    });
                });
            });
        });

        $scope.options = {
            tooltips: {
                enabled: false
            },
            yAxisLabel: "My Y Axis Label",
            xAxisLabel: "My Y Axis Label",
            responsive: true,
            title: {
                display: true,
            },
            scales: {
                xAxes: [{}],
                yAxes: [{
                    ticks: {
                        reverse: true
                    }
                }]
            },
            legend: {
                display: true,
                position: 'bottom'
            }
        };
    }
]);
