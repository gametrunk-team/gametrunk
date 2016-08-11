'use strict';

angular.module('core').controller('HeaderController', ['$rootScope', '$scope', '$location', '$state', 'Authentication', 'Menus', '$window', '$http',
  function($rootScope, $scope, $location, $state, Authentication, Menus, $window, $http) {
    $http.get('/api/props').success(function (props) {
      $.get("http://ipinfo.io", function(response) {
        if (props.adminIp === response.ip) {
          $scope.displayRoom = true;
        }
      }, "jsonp");
    });
    
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function() {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function() {
      $scope.isCollapsed = false;
      ga('send', 'pageview', $location.path());
    });

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
