'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
  // Init module configuration options
  var applicationModuleName = 'seanjs';
  var applicationModuleVendorDependencies = ['ngResource', 'ngAnimate', 'ngMessages', 'ui.router', 'ui.bootstrap', 'ui.utils', 'angularFileUpload'];

  // Add a new vertical module
  var registerModule = function(moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();
'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider', '$httpProvider',
  function($locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');

    $httpProvider.interceptors.push('authInterceptor');
  }
]);

angular.module(ApplicationConfiguration.applicationModuleName).run(["$rootScope", "$state", "Authentication", function($rootScope, $state, Authentication) {

  // Check authentication before changing state
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    if (toState.data && toState.data.roles && toState.data.roles.length > 0) {
      var allowed = false;

      if (Authentication.user.roles) {
        toState.data.roles.forEach(function(role) {
          if (Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1) {
            allowed = true;
            return true;
          }
        });
      }

      if (!allowed) {
        event.preventDefault();
        if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
          $state.go('forbidden');
        } else {
          $state.go('authentication.signin');
        }
      }
    }
  });

  // Record previous state
  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    if (!fromState.data || !fromState.data.ignoreState) {
      $state.previous = {
        state: fromState,
        params: fromParams,
        href: $state.href(fromState, fromParams)
      };
    }
  });
}]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
  //Fixing facebook bug with redirect
  if (window.location.hash && window.location.hash === '#_=_') {
    if (window.history && history.pushState) {
      window.history.pushState('', document.title, window.location.pathname);
    } else {
      // Prevent scrolling by storing the page's current scroll offset
      var scroll = {
        top: document.body.scrollTop,
        left: document.body.scrollLeft
      };
      window.location.hash = '';
      // Restore the scroll offset, should be flicker free
      document.body.scrollTop = scroll.top;
      document.body.scrollLeft = scroll.left;
    }
  }

  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
/**
 * Created by jmertens on 7/19/16.
 */
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('challenge', ['core']);
ApplicationConfiguration.registerModule('challenge', ['core.admin']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
ApplicationConfiguration.registerModule('core.admin', ['core']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('rankings', ['core']);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('user', ['core']);
ApplicationConfiguration.registerModule('user.admin', ['core.admin']);
ApplicationConfiguration.registerModule('user.admin.routes', ['core.admin.routes']);

// 'use strict';
//
// // Setting up route
// angular.module('challenge').config(['$stateProvider',
//     function($stateProvider) {
//         // User state routing
//         $stateProvider
//             .state('challenge', {
//                 // abstract: true,
//                 url: '/challenge/create',
//                 templateUrl: 'modules/challenges/client/views/challenge-modal.client.view.html'
//             })
//             .state('challenge-result', {
//                 url: 'challenge/result',
//                 templateUrl: 'modules/challenges/client/views/result.client.view.html'
//             });
//     }
// ]);

'use strict';

// Setting up route
angular.module('challenge').config(['$stateProvider',
    function($stateProvider) {
        // User state routing
        $stateProvider
            .state('edit', {
                abstract: true,
                url: '/edit',
                templateUrl: 'modules/challenges/client/views/challenge.client.view.html'
            })
            .state('edit.create', {
                url: '/create',
                templateUrl: 'modules/challenges/client/views/challenge-modal.client.view.html'
            });
            // .state('edit.result', {
            //     url: '/result',
            //     templateUrl: 'modules/challenges/client/views/result.client.view.html'
            // });
    }
]);

'use strict';

angular.module('challenge', ['ui.bootstrap']).controller('ChallengeController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator','Admin', '$uibModal', 'ui.bootstrap',
    function($scope, $state, $http, $location, $window, Authentication, PasswordValidator, $uibModal) {
        $scope.authentication = Authentication;
        $scope.popoverMsg = PasswordValidator.getPopoverMsg();
        $scope.selectedTime = 'Now';

        $scope.userId = -1;

        $scope.opponent = {
            model: -1
        };

        $scope.run = function() {
            console.log($scope.opponent.model);
        };

        // Get an eventual error defined in the URL query string:
        $scope.error = $location.search().err;

        // If user is signed in then redirect back home
        if ($scope.authentication.user) {
            $location.path('/');
        }

        $scope.challengerId = -1;
        $scope.challengeeId = -1;

        // TODO: restrict to be only those 3 ranks higher than current user
        $scope.getOpponents = function() {
            $http.get('/api/user/getopponents').success(function(response) {
                console.log(response);
                $scope.users = response;
                $scope.opponent.model = $scope.users[0].id;
            });
        };
        $scope.getOpponents();

        // $scope.emailModal = function () {
        //     var modal = $uibModal.open({
        //         templateUrl: '../views/result.client.view.html', // todo
        //         controller: 'result.controller.js', // todo
        //         scope: $scope,
        //         backdrop: false,
        //         windowClass: 'minimal-modal'
        //     });
        // };

        $scope.createChallenge = function() {
            if($scope.opponent.model === -1){
                return;
            }

            $http.get('/api/user').success(function (response) {
                // If successful show success message and clear form
                $scope.success = true;
                console.log("response", response);
                $scope.challengerId = response.id;
                console.log("challenger p3", $scope.challengerId);
                $scope.challengeeId = $scope.opponent.model;
                $scope.userId = response.id;
                var challengObj = {
                    scheduledTime: '2012-04-23T18:25:43.511Z',
                    challenger: response.id,
                    challengee: $scope.opponent.model,
                    winner: null
                };

                console.log("challenge obj", challengObj);

                $http.post('/api/challenge/create', challengObj).error(function (response) {
                    console.log("response", response);
                    $scope.error = response.message;
                });

                console.log("challengeeID", $scope.challengeeId);
                console.log("challengerId", $scope.challengerId);

                //$state.go('edit.result');
                
                // $scope.emailModal();
                
            }).error(function (response) {
                $scope.error = response.message;
            });


        };
        
        

      

        $scope.getChallenges = function() {
            $http.get('/api/challenge/getall').success(function(response) {
                console.log(response);
            });
        };
        $scope.getChallenges();
    }
]);

/**
 * Created by breed on 7/26/16.
 */

'use strict';

angular.module('challenge').controller('ResultController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator','Admin', '$uibModalInstance', 'ui.bootstrap',
    function($scope, $state, $http, $location, $window, Authentication, PasswordValidator, $uibModalInstance) {

        console.log("result scope", $scope);

        $scope.Won = function() {
            console.log("won $scope", $scope.challengeeId, $scope.challengerId);

            var challengObj = {
                id: 48,
                winner: $scope.challengerId
            };
            $http.post('/api/challenge/update', challengObj).error(function (response) {
                $scope.error = response.message;
            });


            // Updating rankings
            var rankingObject = {
                challenger: $scope.challengerId,
                challengee: $scope.challengeeId
            };
            $http.post('/api/rankings/update', rankingObject).error(function(response) {
                $scope.error = response.message;
            });


            $uibModalInstance.close();
        };



        $scope.Lost = function() {
            var challengObj = {
                id: 49,
                winner: $scope.challengeeId
            };
            $http.post('/api/challenge/update', challengObj).error(function (response) {
                $scope.error = response.message;
            });
        };

    }
]);

'use strict';

// // Users service used for communicating with the users REST endpoint
// angular.module('user').factory('User', ['$resource',
//     function($resource) {
//         return $resource('api/user', {}, {
//             get: {
//                 method: 'GET'
//             },
//             update: {
//                 method: 'PUT'
//             }
//         });
//     }
// ]);

// angular.module('challenge.admin').factory('Admin', ['$resource',
//     function($resource) {
//         return $resource('api/admin/user/:userId', {
//             userId: '@_id'
//         }, {
//             query: {
//                 method: 'GET',
//                 params: {},
//                 isArray: true
//             },
//             update: {
//                 method: 'PUT'
//             }
//         });
//     }
// ]);

'use strict';

angular.module('core.admin').run(['Menus',
  function(Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Admin',
      state: 'admin',
      type: 'dropdown',
      roles: ['admin']
    });
  }
]);
'use strict';

// Setting up route
angular.module('core.admin.routes').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/admin',
        template: '<ui-view/>',
        data: {
          roles: ['admin']
        }
      });
  }
]);
'use strict';

//Configuering the core module
angular.module('core').run(['Menus',
  function(Menus) {

    //Add the contact-us to the menu
    Menus.addMenuItem('topbar', {
      title: 'Contact us',
      state: 'contact-us',
      roles: ['*'] //All users
    });

  }
]);
'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });

    // Home state routing
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'modules/core/client/views/home.client.view.html'
      })
      .state('contact-us', {
        url: '/contact-us',
        templateUrl: 'modules/core/client/views/contact.client.view.html'
      })
      .state('not-found', {
        url: '/not-found',
        templateUrl: 'modules/core/client/views/404.client.view.html',
        data: {
          ignoreState: true
        }
      })
      .state('bad-request', {
        url: '/bad-request',
        templateUrl: 'modules/core/client/views/400.client.view.html',
        data: {
          ignoreState: true
        }
      })
      .state('forbidden', {
        url: '/forbidden',
        templateUrl: 'modules/core/client/views/403.client.view.html',
        data: {
          ignoreState: true
        }
      });
  }
]);

'use strict';

angular.module('core').controller('ContactController', ['$scope', 'ContactForm',
  function($scope, ContactForm) {

    $scope.contact = function(isValid) {
      $scope.error = null;
      $scope.success = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'contactForm');
        return false;
      }

      if (grecaptcha.getResponse() === "") {
        $scope.error = "Please resolve the captcha first!";
      } else {
        var contactForm = new ContactForm({
          name: this.name,
          email: this.email,
          subject: this.subject,
          message: this.message,
          //Get the captcha value and send it to the server for verifing
          grecaptcha: grecaptcha.getResponse()
        });

        $scope.submitButton = "Working...";
        $scope.submitButtonDisabled = true;

        contactForm.$save(function(response) {
          //Reset the reCaptcha
          grecaptcha.reset();
          $scope.success = response.message;
        }, function(errorResponse) {
          console.log('errorResponse', errorResponse);
          //Reset the reCaptcha
          grecaptcha.reset();
          $scope.error = errorResponse.data.message;
        });

        $scope.submitButton = "Send";
        $scope.submitButtonDisabled = false;
      }
    };

  }

]);
'use strict';

angular.module('core').controller('HeaderController', ['$rootScope', '$scope', '$location', '$state', 'Authentication', 'Menus',
  function($rootScope, $scope, $location, $state, Authentication, Menus) {
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

  }
]);
'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication',
  function($scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
  }
]);
'use strict';

/**
 * Edits by Ryan Hutchison
 * Credit: https://github.com/paulyoder/angular-bootstrap-show-errors */

angular.module('core')
  .directive('showErrors', ['$timeout', '$interpolate', function($timeout, $interpolate) {
    var linkFn = function(scope, el, attrs, formCtrl) {
      var inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses,
        initCheck = false,
        showValidationMessages = false,
        blurred = false;

      options = scope.$eval(attrs.showErrors) || {};
      showSuccess = options.showSuccess || false;
      inputEl = el[0].querySelector('.form-control[name]') || el[0].querySelector('[name]');
      inputNgEl = angular.element(inputEl);
      inputName = $interpolate(inputNgEl.attr('name') || '')(scope);

      if (!inputName) {
        throw 'show-errors element has no child input elements with a \'name\' attribute class';
      }

      var reset = function() {
        return $timeout(function() {
          el.removeClass('has-error');
          el.removeClass('has-success');
          showValidationMessages = false;
        }, 0, false);
      };

      scope.$watch(function() {
        return formCtrl[inputName] && formCtrl[inputName].$invalid;
      }, function(invalid) {
        return toggleClasses(invalid);
      });

      scope.$on('show-errors-check-validity', function(event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          initCheck = true;
          showValidationMessages = true;

          return toggleClasses(formCtrl[inputName].$invalid);
        }
      });

      scope.$on('show-errors-reset', function(event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          return reset();
        }
      });

      toggleClasses = function(invalid) {
        el.toggleClass('has-error', showValidationMessages && invalid);
        if (showSuccess) {
          return el.toggleClass('has-success', showValidationMessages && !invalid);
        }
      };
    };

    return {
      restrict: 'A',
      require: '^form',
      compile: function(elem, attrs) {
        if (attrs.showErrors.indexOf('skipFormGroupCheck') === -1) {
          if (!(elem.hasClass('form-group') || elem.hasClass('input-group'))) {
            throw 'show-errors element does not have the \'form-group\' or \'input-group\' class';
          }
        }
        return linkFn;
      }
    };
  }]);
'use strict';

//Contact form service
angular.module('core').factory('ContactForm', ['$resource',
  function($resource) {
    return $resource('api/contact', {}, {
      update: {
        method: 'POST'
      }
    });
  }
]);

'use strict';

angular.module('core').factory('authInterceptor', ['$q', '$injector',
  function($q, $injector) {
    return {
      responseError: function(rejection) {
        if (!rejection.config.ignoreAuthModule) {
          switch (rejection.status) {
            case 401:
              $injector.get('$state').transitionTo('authentication.signin');
              break;
            case 403:
              $injector.get('$state').transitionTo('forbidden');
              break;
            case 404:
              $injector.get('$state').transitionTo('not-found');
              break;
          }
        }
        // otherwise, default behaviour
        return $q.reject(rejection);
      }
    };
  }
]);
'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [
  function() {
    // Define a set of default roles
    this.defaultRoles = ['user', 'admin'];

    // Define the menus object
    this.menus = {};

    // A private function for rendering decision
    var shouldRender = function(user) {
      if (!!~this.roles.indexOf('*')) {
        return true;
      } else {
        if (!user) {
          return false;
        }
        for (var userRoleIndex in user.roles) {
          for (var roleIndex in this.roles) {
            if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
              return true;
            }
          }
        }
      }

      return false;
    };

    // Validate menu existance
    this.validateMenuExistance = function(menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exist');
        }
      } else {
        throw new Error('MenuId was not provided');
      }

      return false;
    };

    // Get the menu object by menu id
    this.getMenu = function(menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      return this.menus[menuId];
    };

    // Add new menu object by menu id
    this.addMenu = function(menuId, options) {
      options = options || {};

      // Create the new menu
      this.menus[menuId] = {
        roles: options.roles || this.defaultRoles,
        items: options.items || [],
        shouldRender: shouldRender
      };

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenu = function(menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      delete this.menus[menuId];
    };

    // Add menu item object
    this.addMenuItem = function(menuId, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Push new menu item
      this.menus[menuId].items.push({
        title: options.title || '',
        state: options.state || '',
        type: options.type || 'item',
        class: options.class,
        roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.defaultRoles : options.roles),
        position: options.position || 0,
        items: [],
        shouldRender: shouldRender
      });

      // Add submenu items
      if (options.items) {
        for (var i in options.items) {
          this.addSubMenuItem(menuId, options.state, options.items[i]);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Add submenu item object
    this.addSubMenuItem = function(menuId, parentItemState, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === parentItemState) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: options.title || '',
            state: options.state || '',
            roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : options.roles),
            position: options.position || 0,
            shouldRender: shouldRender
          });
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenuItem = function(menuId, menuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === menuItemState) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeSubMenuItem = function(menuId, submenuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].state === submenuItemState) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    //Adding the topbar menu
    this.addMenu('topbar', {
      roles: ['*']
    });
  }
]);
'use strict';

// Create the Socket.io wrapper service
angular.module('core').service('Socket', ['Authentication', '$state', '$timeout',
  function(Authentication, $state, $timeout) {
    // Connect to Socket.io server
    this.connect = function() {
      // Connect only when authenticated
      if (Authentication.user) {
        this.socket = io();
      }
    };
    this.connect();

    // Wrap the Socket.io 'on' method
    this.on = function(eventName, callback) {
      if (this.socket) {
        this.socket.on(eventName, function(data) {
          $timeout(function() {
            callback(data);
          });
        });
      }
    };

    // Wrap the Socket.io 'emit' method
    this.emit = function(eventName, data) {
      if (this.socket) {
        this.socket.emit(eventName, data);
      }
    };

    // Wrap the Socket.io 'removeListener' method
    this.removeListener = function(eventName) {
      if (this.socket) {
        this.socket.removeListener(eventName);
      }
    };
  }
]);
/**
 * Created by breed on 7/25/16.
 */

'use strict';

// Config HTTP Error Handling
angular.module('rankings').config(['$httpProvider',
    function($httpProvider) {
        // Set the httpProvider "not authorized" interceptor
        $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
            function($q, $location, Authentication) {
                return {
                    responseError: function(rejection) {
                        switch (rejection.status) {
                            case 401:
                                // Deauthenticate the global user
                                Authentication.user = null;

                                // Redirect to signin page
                                $location.path('signin');
                                break;
                            case 403:
                                // Add unauthorized behaviour
                                break;
                        }

                        return $q.reject(rejection);
                    }
                };
            }
        ]);
    }
]);

'use strict';

// Setting up route
angular.module('user').config(['$stateProvider',
    function($stateProvider) {
        // User state routing
        $stateProvider
            .state('rankings', {
                url: '/rankings',
                abstract: true,
                templateUrl: 'modules/rankings/client/views/rankings/list-rankings.client.view.html',
                data: {
                    roles: ['user']
                },
                controller: 'RankingController'
            })
            .state('rankings.users', {
                url: '/users',
                template: '',
                controller: 'RankingController'
            })
            .state('rankings.user', {
                url: '/user/:userId',
                templateUrl: 'modules/rankings/client/views/rankings/view-user.client.view.html', // TODO
                controller: 'UserController',// TODO
                resolve: {
                    userResolve: ['$stateParams', 'Rankings', function($stateParams, Rankings) { // TODO
                        return Rankings.get({
                            userId: $stateParams.userId
                        });
                    }]
                }
            });
    }
]);

/**
 * Created by breed on 7/22/16.
 */

'use strict';

angular.module('rankings').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve',
    function($scope, $state, Authentication, userResolve) {

        $scope.authentication = Authentication;
        $scope.user = userResolve;
        
        $scope.update = function(isValid) {
            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'userForm');
                return false;
            }

            var user = $scope.user;

            user.$update({
                'userId': user.id
            }, function() {
                $state.go('admin.user', {
                    userId: user.id
                });
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };
    }
]);

/**
 * Created by breed on 7/21/16.
 */

'use strict';

angular.module('rankings').controller('RankingController', ['$scope', '$filter', 'Rankings',
    function($scope, $filter, Rankings) {

        Rankings.query(function(data) {
            console.log("hello from the other side");
            console.log(data);
            $scope.users = data;
            $scope.buildPager();
        });

        $scope.buildPager = function() {
            $scope.pagedItems = [];
            $scope.itemsPerPage = 15;
            $scope.currentPage = 1;
            $scope.figureOutItemsToDisplay();
        };

        $scope.figureOutItemsToDisplay = function() {
            $scope.filteredItems = $filter('filter')($scope.users, {
                $: $scope.search
            });
            $scope.filterLength = $scope.filteredItems.length;
            var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
            var end = begin + $scope.itemsPerPage;
            $scope.pagedItems = $scope.filteredItems.slice(begin, end);
        };

        $scope.pageChanged = function() {
            $scope.figureOutItemsToDisplay();
        };
    }
]);

/**
 * Created by breed on 7/25/16.
 */

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('rankings').factory('User', ['$resource',
    function($resource) {
        return $resource('api/user', {}, {
            get: {
                method: 'GET'
            },
            update: {
                method: 'PUT'
            }
        });
    }
]);

angular.module('rankings').factory('Rankings', ['$resource',
    function($resource) {
        return $resource('api/rankings/user/:userId', {
            userId: '@_id'
        }, {
            query: {
                method: 'GET',
                params: {},
                isArray: true
            },
            update: {
                method: 'PUT'
            }
        });
    }
]);

'use strict';

// Configuring the Articles module
angular.module('user.admin').run(['Menus',
  function(Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Users',
      state: 'admin.users'
    });
  }
]);
'use strict';

// Setting up route
angular.module('user.admin.routes').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController'
      })
      .state('admin.user', {
        url: '/user/:userId',
        templateUrl: 'modules/users/client/views/admin/view-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      })
      .state('admin.user-edit', {
        url: '/user/:userId/edit',
        templateUrl: 'modules/users/client/views/admin/edit-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      });
  }
]);
'use strict';

// Config HTTP Error Handling
angular.module('user').config(['$httpProvider',
  function($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
      function($q, $location, Authentication) {
        return {
          responseError: function(rejection) {
            switch (rejection.status) {
              case 401:
                // Deauthenticate the global user
                Authentication.user = null;

                // Redirect to signin page
                $location.path('signin');
                break;
              case 403:
                // Add unauthorized behaviour
                break;
            }

            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);
'use strict';

// Setting up route
angular.module('user').config(['$stateProvider',
  function($stateProvider) {
    // User state routing
    $stateProvider
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html'
      })
      .state('settings.password', {
        url: '/password',
        templateUrl: 'modules/users/client/views/settings/change-password.client.view.html'
      })
      .state('settings.accounts', {
        url: '/accounts',
        templateUrl: 'modules/users/client/views/settings/manage-social-accounts.client.view.html'
      })
      .state('settings.picture', {
        url: '/picture',
        templateUrl: 'modules/users/client/views/settings/change-profile-picture.client.view.html'
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html'
      })
      .state('authentication.signup', {
        url: '/signup',
        templateUrl: 'modules/users/client/views/authentication/signup.client.view.html'
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'modules/users/client/views/authentication/signin.client.view.html'
      })
      .state('password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>'
      })
      .state('password.forgot', {
        url: '/forgot',
        templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html'
      })
      .state('password.reset', {
        abstract: true,
        url: '/reset',
        template: '<ui-view/>'
      })
      .state('password.reset.invalid', {
        url: '/invalid',
        templateUrl: 'modules/users/client/views/password/reset-password-invalid.client.view.html'
      })
      .state('password.reset.success', {
        url: '/success',
        templateUrl: 'modules/users/client/views/password/reset-password-success.client.view.html'
      })
      .state('password.reset.form', {
        url: '/:token',
        templateUrl: 'modules/users/client/views/password/reset-password.client.view.html'
      });
  }
]);

'use strict';

angular.module('user.admin').controller('UserListController', ['$scope', '$filter', 'Admin',
  function($scope, $filter, Admin) {

    Admin.query(function(data) {
      console.log(data);
      $scope.users = data;
      $scope.buildPager();
    });

    $scope.buildPager = function() {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function() {
      $scope.filteredItems = $filter('filter')($scope.users, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.pageChanged = function() {
      $scope.figureOutItemsToDisplay();
    };
  }
]);

'use strict';

angular.module('user.admin').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve',
  function($scope, $state, Authentication, userResolve) {

    $scope.authentication = Authentication;
    $scope.user = userResolve;

    $scope.remove = function() {

      if (confirm('Are you sure you want to delete this user?')) {

        var user = $scope.user;
        user.$remove({
          'userId': user.id
        }, function() {
          $state.go('admin.users');
        }, function(errorResponse) {
          $scope.error = errorResponse.data.message;
        });


      }
    };

    $scope.update = function(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        return false;
      }

      var user = $scope.user;

      user.$update({
        'userId': user.id
      }, function() {
        $state.go('admin.user', {
          userId: user.id
        });
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
  }
]);
'use strict';

angular.module('user').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator',
  function($scope, $state, $http, $location, $window, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    $scope.signup = function(isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signup', $scope.credentials).success(function(response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
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
'use strict';

angular.module('user').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'PasswordValidator',
  function($scope, $stateParams, $http, $location, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    //If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    // Submit forgotten password account id
    $scope.askForPasswordReset = function(isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'forgotPasswordForm');

        return false;
      }

      $http.post('/api/auth/forgot', $scope.credentials).success(function(response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;

      }).error(function(response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };

    // Change user password
    $scope.resetUserPassword = function(isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'resetPasswordForm');

        return false;
      }

      $http.post('/api/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;

        // Attach user profile
        Authentication.user = response;

        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function(response) {
        $scope.error = response.message;
      });
    };
  }
]);
'use strict';

angular.module('user').controller('ChangePasswordController', ['$scope', '$http', 'Authentication', 'PasswordValidator',
  function($scope, $http, Authentication, PasswordValidator) {
    $scope.user = Authentication.user;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Change user password
    $scope.changeUserPassword = function(isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'passwordForm');

        return false;
      }

      $http.post('/api/user/password', $scope.passwordDetails).success(function(response) {
        // If successful show success message and clear form
        $scope.$broadcast('show-errors-reset', 'passwordForm');
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function(response) {
        $scope.error = response.message;
      });
    };
  }
]);
'use strict';

angular.module('user').controller('ChangeProfilePictureController', ['$scope', '$timeout', '$window', 'Authentication', 'FileUploader', '$http', 'User',
  function($scope, $timeout, $window, Authentication, FileUploader, $http, User) {
    $scope.user = Authentication.user;
    $scope.imageURL = $scope.user.profileImageURL;

    // Create file uploader instance
    $scope.uploader = new FileUploader({
      url: 'api/user/picture',
      autoUpload: false
    });

    // Set file uploader image filter
    $scope.uploader.filters.push({
      name: 'imageFilter',
      fn: function(item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a new picture file
    $scope.uploader.onAfterAddingFile = function(fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);
        fileReader.onload = function(fileReaderEvent) {
          $timeout(function() {
            $scope.imageURL = fileReaderEvent.target.result;
          }, 0);
        };
      }
    };

    // Called after the user has successfully uploaded a new picture
    $scope.uploader.onSuccessItem = function(fileItem, response, status, headers) {
      var user = new User($scope.user);

      user.$update(function(response) {
        $scope.imageURL = user.profileImageURL;

        $scope.$broadcast('show-errors-reset', 'updatePicture');

        // Show success message
        $scope.success = true;

        // Populate user object
        Authentication.user = response;
      }, function(response) {
        $scope.error = response.data.message;
      });

      // Clear upload buttons
      $scope.cancelUpload();
    };

    // Called after the user has failed to uploaded a new picture
    $scope.uploader.onErrorItem = function(fileItem, response, status, headers) {
      // Clear upload buttons
      $scope.cancelUpload();

      // Show error message
      $scope.error = response.message;
    };

    // Change user profile picture
    $scope.uploadProfilePicture = function() {
      // Clear messages
      $scope.success = $scope.error = null;

      // Start upload
      $scope.uploader.uploadAll();
    };

    // Cancel the upload process
    $scope.cancelUpload = function() {
      $scope.uploader.clearQueue();
      $scope.imageURL = $scope.user.profileImageURL;
    };
  }
]);

'use strict';

angular.module('user').controller('EditProfileController', ['$scope', '$http', '$location', 'User', 'Authentication',
  function($scope, $http, $location, User, Authentication) {
    $scope.user = Authentication.user;

    $scope.getProfile = function() {
      User.get(function(data) {
        $scope.user = data;
      });
    };

    // Update a user profile
    $scope.updateUserProfile = function(isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = new User($scope.user);

      user.$update(function(response) {
        $scope.$broadcast('show-errors-reset', 'userForm');

        $scope.success = true;
        Authentication.user = response;
      }, function(response) {
        $scope.error = response.data.message;
      });
    };
  }
]);
'use strict';

angular.module('user').controller('SocialAccountsController', ['$scope', '$http', 'Authentication',
  function($scope, $http, Authentication) {
    $scope.user = Authentication.user;

    // Check if there are additional accounts
    $scope.hasConnectedAdditionalSocialAccounts = function(provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }

      return false;
    };

    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function(provider) {
      return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
    };

    // Remove a user social account
    $scope.removeUserSocialAccount = function(provider) {
      $scope.success = $scope.error = null;

      $http.delete('/api/user/accounts', {
        params: {
          provider: provider
        }
      }).success(function(response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function(response) {
        $scope.error = response.message;
      });
    };
  }
]);
'use strict';

angular.module('user').controller('SettingsController', ['$scope', 'Authentication',
  function($scope, Authentication) {
    $scope.user = Authentication.user;
  }
]);
'use strict';

angular.module('user')
  .directive('passwordValidator', ['PasswordValidator', function(PasswordValidator) {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, modelCtrl) {
        modelCtrl.$parsers.unshift(function(password) {
          var result = PasswordValidator.getResult(password);
          var strengthIdx = 0;

          // Strength Meter - visual indicator for users
          var strengthMeter = [{
            color: "danger",
            progress: "20"
          }, {
            color: "warning",
            progress: "40"
          }, {
            color: "info",
            progress: "60"
          }, {
            color: "primary",
            progress: "80"
          }, {
            color: "success",
            progress: "100"
          }];
          var strengthMax = strengthMeter.length;

          if (result.errors.length < strengthMeter.length) {
            strengthIdx = strengthMeter.length - result.errors.length - 1;
          }

          scope.strengthColor = strengthMeter[strengthIdx].color;
          scope.strengthProgress = strengthMeter[strengthIdx].progress;

          if (result.errors.length) {
            scope.popoverMsg = PasswordValidator.getPopoverMsg();
            scope.passwordErrors = result.errors;
            modelCtrl.$setValidity('strength', false);
            return undefined;
          } else {
            scope.popoverMsg = '';
            modelCtrl.$setValidity('strength', true);
            return password;
          }
        });
      }
    };
  }]);
'use strict';

angular.module('user')
  .directive("passwordVerify", function() {
    return {
      require: "ngModel",
      scope: {
        passwordVerify: '='
      },
      link: function(scope, element, attrs, modelCtrl) {
        scope.$watch(function() {
          var combined;
          if (scope.passwordVerify || modelCtrl.$viewValue) {
            combined = scope.passwordVerify + '_' + modelCtrl.$viewValue;
          }
          return combined;
        }, function(value) {
          if (value) {
            modelCtrl.$parsers.unshift(function(viewValue) {
              var origin = scope.passwordVerify;
              if (origin !== viewValue) {
                modelCtrl.$setValidity("passwordVerify", false);
                return undefined;
              } else {
                modelCtrl.$setValidity("passwordVerify", true);
                return viewValue;
              }
            });
          }
        });
      }
    };
  });

'use strict';

// Users directive used to force lowercase input
angular.module('user').directive('lowercase', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function(input) {
        return input ? input.toLowerCase() : '';
      });
      element.css('text-transform', 'lowercase');
    }
  };
});
'use strict';

// Authentication service for user variables
angular.module('user').factory('Authentication', ['$window',
  function($window) {
    var auth = {
      user: $window.user
    };

    return auth;
  }
]);
'use strict';

// PasswordValidator service used for testing the password strength
angular.module('user').factory('PasswordValidator', ['$window',
  function($window) {
    var owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;

    return {
      getResult: function(password) {
        var result = owaspPasswordStrengthTest.test(password);
        return result;
      },
      getPopoverMsg: function() {
        var popoverMsg = "Please enter a passphrase or password with greater than 10 characters, numbers, lowercase, upppercase, and special characters.";
        return popoverMsg;
      }
    };
  }
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('user').factory('User', ['$resource',
  function($resource) {
    return $resource('api/user', {}, {
      get: {
        method: 'GET'
      },
      update: {
        method: 'PUT'
      }
    });
  }
]);

angular.module('user.admin').factory('Admin', ['$resource',
  function($resource) {
    return $resource('api/admin/user/:userId', {
      userId: '@_id'
    }, {
      query: {
        method: 'GET',
        params: {},
        isArray: true
      },
      update: {
        method: 'PUT'
      }
    });
  }
]);
