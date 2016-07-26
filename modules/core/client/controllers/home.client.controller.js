'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$http',
  function($scope, Authentication, $http) {
    // This provides Authentication context.
    $scope.authentication = Authentication;

    $scope.sendChallengeNotification = function () {

      var challengObj = {
        id: 48,
        challenger: 7,
        challengee: 3
      };

      $http.post('/api/emails/challengeCreated', challengObj).error(function (response) {
        $scope.error = response.message;
      });

    };

  }
]);
