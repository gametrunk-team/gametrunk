'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$http',
  function($scope, Authentication, $http) {
    // This provides Authentication context.
    $scope.authentication = Authentication;

  }
]);
