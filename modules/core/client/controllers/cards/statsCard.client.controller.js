'use strict';

angular.module('core').controller('StatsCardController', ['$scope', '$timeout', '$window', 'Authentication', 'Circuit', '$http','Rankings','Challenges',
    function($scope, $timeout, $window, Authentication, Circuit, $http, Rankings, Challenges) {

        $scope.data = [];

        Rankings.query(function(data) {
            $scope.users = data;
            $http.get('/api/user').success(function (response) {
                $scope.currentUserId = response.id;

                $http.get('/api/challenge/getall').success(function (data) {
                    $scope.labels = [];
                    $scope.colors = [];
                    $scope.challenges = data;

                    angular.forEach($scope.users, function (user, index) {
                        //get # of games player for this user and set this variable
                        var games = 0;
                        var wins = 0.0;
                        var losses = 0.0;
                        angular.forEach($scope.challenges, function (challenge, index) {
                            if (challenge.challengerUserId === user.id || challenge.challengeeUserId === user.id && challenge.winnerUserId !== null && challenge.winnerUserId !== -1) {
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

                        $scope.data.push({
                            key: value.displayName + ', Rank ' + value.rank,
                            values: []
                        });

                        var obj = {
                            x: value.gamesPlayed,
                            y: value.rank,
                            size: value.winLossRatio!==0 ? value.winLossRatio  : 1,
                            shape: 'circle'
                        };
                        $scope.data[index].values.push(obj);
                    });
                });
            });
        });

        $scope.options = {
            chart: {
                type: 'scatterChart',
                height: 450,
                color: d3.scale.category10().range(),
                scatter: {
                    onlyCircles: true
                },
                showDistX: true,
                showDistY: true,
                tooltip: {
                    contentGenerator: function (key, x, y, e, graph) {
                        return '<p>' + key.series[0].key + '</p>' + '<p>Games Played: ' + key.series[0].values[0].x + '</p><p>Win/Loss Ratio: ' + Math.round(key.series[0].values[0].size  * 100) / 100+ '</p>';
                    }
                },
                duration: 350,
                xAxis: {
                    axisLabel: 'Number of Games Played'
                },
                yAxis: {
                    axisLabel: 'Rank',
                    axisLabelDistance: -5
                },
                zoom: {
                    //NOTE: All attributes below are optional
                    enabled: false,
                    scaleExtent: [1, 10],
                    useFixedDomain: false,
                    useNiceScale: false,
                    horizontalOff: false,
                    verticalOff: false,
                    unzoomEventType: 'dblclick.zoom'
                },
                showLegend: false,
                // yDomain: [d3.max($scope.data, function (d) { return d.v; }), d3.min($scope.data, function (d) { return d.v; })]
                yDomain: [30,1],
    }
        };
    }
]);
