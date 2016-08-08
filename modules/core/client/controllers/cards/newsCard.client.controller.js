'use strict';

angular.module('news').controller('NewsCardController', ['$scope', '$filter', '$http',
    function($scope, $filter, $http) {

        $scope.newsList = [];

        $http.post("/api/news/getNews").success(function(response) {

            $scope.newsList = response;

        }).error(function(err) {
            console.log(err);
        });

    }
]);
