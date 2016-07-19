'use strict';

angular.module('challenge').controller('ChallengeController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator','Admin',
    function($scope, $state, $http, $location, $window, Authentication, PasswordValidator, Admin) {
        $scope.authentication = Authentication;
        $scope.popoverMsg = PasswordValidator.getPopoverMsg();
        //
        // Admin.query(function(data) {
        //     console.log(data);
        //     $scope.users = data;
        //     $scope.buildPager();
        // });

        // Get an eventual error defined in the URL query string:
        $scope.error = $location.search().err;

        // If user is signed in then redirect back home
        if ($scope.authentication.user) {
            $location.path('/');
        }

        $scope.createChallenge = function() {

            var challengObj = {
                challenger: 7
            };

            $http.post('/api/challenge/create', challengObj).success(function(response) {
                // // If successful we assign the response to the global user model
                // $scope.authentication.user = response;
                //
                // // And redirect to the previous or home page
                // $state.go($state.previous.state.name || 'home', $state.previous.params);
                console.log(response);
            }).error(function(response) {
                $scope.error = response.message;
            });
        };

        $scope.signin = function(isValid) {
            $scope.error = null;

            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'userForm');

                return false;
            }

            $http.post('/api/auth/signin', $scope.credentials).success(function(response) {
                // If successful we assign the response to the global user model
                $scope.authentication.user = response;

                // And redirect to the previous or home page
                $state.go($state.previous.state.name || 'home', $state.previous.params);
            }).error(function(response) {
                $scope.error = response.message;
            });
        };

        // OAuth provider request
        $scope.callOauthProvider = function(url) {
            if ($state.previous && $state.previous.href) {
                url += '?redirect_to=' + encodeURIComponent($state.previous.href);
            }

            // Effectively call OAuth authentication route:
            $window.location.href = url;
        };
    }
]);
