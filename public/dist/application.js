'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
  // Init module configuration options
  var applicationModuleName = 'seanjs';
  var applicationModuleVendorDependencies = ['ngResource', 'ngAnimate', 'ngMessages', 'ui.router', 'ui.bootstrap', 'ui.utils', 'angularFileUpload', 'ngLodash', 'yaru22.angular-timeago'];

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
  function($locationProvider, $httpProvider, $routeProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');

    $httpProvider.interceptors.push('authInterceptor');

    // // configuring base url for deckster popouts
    // var popoutRoute = Deckster.getPopoutRoute('/deckster/');
    //
    // // configuring the popout base template
    // $routeProvider.when(popoutRoute.fullPath, {
    //   templateUrl: 'partials/deckster-popout.html'
    // });
    //
    // $routeProvider.when('/', {
    //   templateUrl: 'partials/main.html',
    //   controller: 'MainCtrl'
    // });
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

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core', ['yaru22.angular-timeago','chart.js']);
ApplicationConfiguration.registerModule('core.admin', ['core']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);

ApplicationConfiguration.registerModule('news', ['core']);

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
//                 templateUrl: 'modules/challenges/client/views/edit-challenge.client.view.html'
//             });
//     }
// ]);

'use strict';

// Setting up route
angular.module('challenge').config(['$stateProvider',
    function($stateProvider) {
        // User state routing
        // $stateProvider
        //     .state('edit', {
        //         abstract: true,
        //         url: '/edit',
        //         templateUrl: 'modules/challenges/client/views/challenge.client.view.html'
        //     })
        //     .state('edit.create', {
        //         url: '/create',
        //         templateUrl: 'modules/challenges/client/views/challenge-modal.client.view.html'
        //     });
        $stateProvider
            .state('challenge', {
                url: '/challenge',
                abstract: true,
                templateUrl: 'modules/challenges/client/views/challenge.client.view.html',
                data: {
                    roles: ['user']
                },
                controller: 'ChallengeController'
            })
            .state('challenge.create', {
                url: '/challenge',
                templateUrl: 'modules/challenges/client/views/challenge-modal.client.view.html',
                controller: 'ChallengeController'
            });
    }
]);

'use strict';

angular.module('challenge').controller('ChallengeController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator','Admin', '$uibModal', 'Challenges', 'Circuit',
    function($scope, $state, $http, $location, $window, Authentication, PasswordValidator, Admin, $uibModal, Challenges, Circuit) {
        $scope.authentication = Authentication;
        $scope.popoverMsg = PasswordValidator.getPopoverMsg();
        $scope.selectedTime = 'Now';
        $scope.message = "";

        // Variables saved for UserController
        $scope.challengeId = -1;
        $scope.challengerId = -1;
        $scope.challengeeId = -1;
        
        $scope.challenges = {};
        $scope.challengesToday = [];
        $scope.pastChallenges = [];
        $scope.upcomingChallenges = [];

        $scope.initPage = function () {
            $scope.challenges = {};
            $scope.challengesToday = [];
            $scope.pastChallenges = [];
            $scope.upcomingChallenges = [];

            $http.get('/api/user').success(function (response) {
                // If successful show success message and clear form
                $scope.success = true;
                $scope.currRank = response.rank;
                $scope.challengerId = response.id;

                new Circuit().then(function (result) {
                    $scope.circuit = result.circuit($scope.currRank);

                    $scope.model = {
                        opponentId: -1
                    };

                    $scope.run = function () {
                    };

                    Challenges.query(function (data) {
                        $scope.users = data;
                        if ($scope.circuit === "World Circuit" && $scope.users.length < 1) {
                            $scope.message = "Looks like you are in position #1! Wait until someone else challenges you.";
                        } else if ($scope.circuit !== "World Circuit" && $scope.currRank % result.cSize === 1) {
                            $scope.message = "You are at the top of your circuit! Play the bottom player from the " + result.circuit($scope.currRank - result.cSize) + " to move up.";
                        } else if ($scope.users.length < 1) {
                            $scope.message = "Looks like you don't have anyone to challenge.";
                        }
                    });
                    $scope.getChallenges();
                    console.log("getting the user!!!");
                });
            }).error(function (response) {
                $scope.error = response.message;
            });
        };

        $scope.initPage();

        $scope.editModal = function (challengeeUser, challengerUser, challengeId) {
            console.log("making the edit modal");
            var modal = $uibModal.open({
                templateUrl: 'modules/challenges/client/views/edit-challenge.client.view.html', // todo
                controller: 'ResultController', // todo
                scope: $scope,
                backdrop: false,
                windowClass: 'app-modal-window',
                resolve: {
                    challengerUser: function () {
                        return challengerUser;
                    },
                    challengeeUser: function () {
                        return challengeeUser;
                    },
                    challengeId: function () {
                        return challengeId;
                    }
                }
            });

            modal.result.then(function(){
                $scope.initPage();
            });
        };

        $scope.cancelModal = function (challengeId) {
            console.log("making the cancel modal");
            console.log($scope.challengeId);
            var modal = $uibModal.open({
                templateUrl: 'modules/challenges/client/views/cancel-modal.client.view.html', // todo
                controller: 'DeleteController', // todo
                scope: $scope,
                backdrop: false,
                windowClass: 'app-modal-window',
                resolve: {
                    challengeId: function () {
                        return challengeId;
                    }
                }
            });

            modal.result.then(function(){
                $scope.initPage();
            });
        };

        $scope.createChallengeModal = function () {
            console.log("making the cancel modal");
            console.log($scope.challengeId);
            var modal = $uibModal.open({
                templateUrl: 'modules/challenges/client/views/challenge-modal.client.view.html', // todo
                controller: 'ChallengeController', // todo
                scope: $scope,
                backdrop: false,
                windowClass: 'app-modal-window'
            });

            modal.result.then(function(){
                $scope.initPage();
            });
        };

        $scope.createChallenge = function() {
            if($scope.model.opponentId === -1){
                return;
            }
            $scope.challengeeId = $scope.model.opponentId;

            var challengObj = {
                scheduledTime: $scope.dt,
                challengerUserId: $scope.challengerId,
                challengeeUserId: $scope.model.opponentId,
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


        $scope.getChallenges = function() {
            console.log("challenger Id: " + $scope.challengerId);
            var params = {
                userId: $scope.challengerId
            };

            $http.post('/api/challenge/mychallenges', params).success(function(response) {
                $scope.challenges = response;
                angular.forEach($scope.challenges,function(value,index){

                    $http.post('/api/user/getUserById', { userId: value.challengerUserId })
                        .success(function (data) {
                            value.challengerUser = data;
                        });

                    $http.post('/api/user/getUserById', { userId: value.challengeeUserId })
                        .success(function (data) {
                            value.challengeeUser = data;
                        });
                });
                $scope.filterChallenges();
            });

        };

        $scope.deleteChallenge = function(challengeId) {
            console.log($scope);
            var params = {
                id: challengeId
            };
            console.log("deleting challenge with id " + $scope.challengeId);
            $http.post('/api/challenge/delete', params)
                .success(function (data) {
                    console.log("success");
                });
            $scope.$dismiss();
        };

        $scope.dismiss = function() {
            $scope.$dismiss();
        };

        //filters all a user's challenges into the ones happening today
        $scope.filterChallenges = function() {
            var minTimeToday = new Date();
            minTimeToday.setHours(0);
            minTimeToday.setMinutes(0);
            
            var maxTimeToday = new Date();
            maxTimeToday.setHours(23);
            maxTimeToday.setMinutes(59);
            
            angular.forEach($scope.challenges,function(value,index){
                var scheduledDate = new Date(value.scheduledTime);
                if(scheduledDate>minTimeToday && scheduledDate<maxTimeToday) {
                    console.log("adding challenge to today: " + value);
                    $scope.challengesToday.push(value);
                } else if(scheduledDate<minTimeToday) {
                    console.log("adding challenge to past challenges: " + value);
                    $scope.pastChallenges.push(value);
                } else if(scheduledDate>maxTimeToday) {
                    console.log("adding challenge to upcoming: " + value);
                    $scope.upcomingChallenges.push(value);
                }
            });
            console.log("the final count" + $scope.challenges);
        };

        // TODO: would probably be good to break the modal logic below out into its own controller
        
        $scope.min = null;
        $scope.max = null;
        $scope.dt = null;

        $scope.initTimePicker = function(selectedDate) {
            var min = new Date(selectedDate.getTime());
            min.setHours(0);
            min.setMinutes(0);
            $scope.min = min;

            var max = new Date(selectedDate.getTime());
            max.setHours(24);
            max.setMinutes(0);
            $scope.max = max;
        };

        $scope.init = function() {
            $scope.dt = new Date();
            $scope.dt.setHours(12);
            $scope.dt.setMinutes(0);
            $scope.dt.setMilliseconds(0);
            $scope.initTimePicker($scope.dt);
        };
        $scope.init();

        $scope.clear = function() {
            $scope.dt = null;
        };

        $scope.open = function() {
            $scope.popup.opened = true;
        };


        $scope.popup = {
            opened: false
        };

        $scope.dateChange = function() {
            $scope.initTimePicker($scope.dt);
        };
    }
]);

'use strict';

angular.module('challenge').controller('DeleteController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator','Admin', '$uibModal', 'Challenges', 'Circuit','challengeId',
    function($scope, $state, $http, $location, $window, Authentication, PasswordValidator, Admin, $uibModal, Challenges, Circuit, challengeId) {
        $scope.authentication = Authentication;
        $scope.popoverMsg = PasswordValidator.getPopoverMsg();
        $scope.selectedTime = 'Now';
        $scope.message = "";

        // Variables saved for UserController
        $scope.challengeId = -1;
        $scope.challengerId = -1;
        $scope.challengeeId = -1;

        $scope.challenges = {};
        $scope.challengesToday = [];
        $scope.pastChallenges = [];
        $scope.upcomingChallenges = [];

        $scope.deleteChallenge = function() {
            console.log($scope);
            var params = {
                id: challengeId
            };
            console.log("deleting challenge with id " + challengeId);
            $http.post('/api/challenge/delete', params)
                .success(function (data) {
                    console.log("success");
                    toastr.success('Challenge Deleted','Success');
                });
            $scope.$close(true);
        };

        $scope.dismiss = function() {
            $scope.$close(true);
        };
        
    }
]);

/**
 * Created by breed on 7/26/16.
 */

'use strict';

angular.module('challenge').controller('ResultController', ['$scope', '$state', '$http','Authentication','challengerUser', 'challengeeUser','challengeId',
    function($scope, $state, $http, Authentication, challengerUser, challengeeUser, challengeId) {

        $scope.model = {
            Id: -1
        };

        $scope.challengerUser = challengerUser;
        $scope.challengeeUser = challengeeUser;
        $scope.challengeId = challengeId;

        $scope.opponent = $scope.users.filter(function( obj ) {
            return obj.id === $scope.challengeeId;
        })[0];

        $scope.Won = function() {
            // Update challenge
            var challengObj = {
                id: $scope.challengeId,
                winnerUserId: $scope.challengerId
            };
            $http.post('/api/challenge/update', challengObj).error(function (response) {
                $scope.error = response.message;
            });


            // Updating rankings
            var rankingObject = {
                challenger: $scope.challengerUser.id,
                challengee: $scope.challengeeUser.id
            };
            $http.post('/api/rankings/update', rankingObject).error(function(response) {
                $scope.error = response.message;
            });
        };


        $scope.Lost = function() {
            // Update challenge
            var challengObj = {
                id: $scope.challengeId,
                winnerUserId: $scope.challengeeUser.id
            };
            $http.post('/api/challenge/update', challengObj).error(function (response) {
                $scope.error = response.message;
            });


            //create news
            var newsObj = {
                challenger: $scope.challengerUser.id,
                challengee: $scope.challengeeUser.id
            };

            $http.post('/api/news/createChallengeLost', newsObj).error(function(response) {
                $scope.error = response.message;
            });
        };

        $scope.getSelectedChallenge = function() {

            var challengObj = {
                id: $scope.challengeId
            };
            $http.post('/api/challenge/get', challengObj)
                .success(function (response) {
                    console.log(response);
                    $scope.dt = response.scheduledTime;
                    $scope.dt = new Date(response.scheduledTime);
                    $scope.initTimePicker($scope.dt);
                })
                .error(function (response) {
                    console.log(response);
                });
        };

        $scope.getSelectedChallenge();

        $scope.Submit = function() {
            console.log($scope);
            if($scope.model.Id===$scope.challengerUser.id) {
                $scope.Won();
            } else if($scope.model.Id===$scope.challengeeUser.id) {
                $scope.Lost();
            }
            $scope.dismiss();
        };

        $scope.dismiss = function() {
            console.log($scope);
            $scope.$close(true);
        };


        // TODO: would probably be good to break the modal logic below out into its own controller

        $scope.min = null;
        $scope.max = null;
        $scope.dt = null;

        $scope.initTimePicker = function(selectedDate) {
            var min = new Date(selectedDate.getTime());
            min.setHours(0);
            min.setMinutes(0);
            $scope.min = min;

            var max = new Date(selectedDate.getTime());
            max.setHours(24);
            max.setMinutes(0);
            $scope.max = max;
        };

        $scope.init = function() {
            $scope.dt = new Date();
            $scope.dt.setHours(12);
            $scope.dt.setMinutes(0);
            $scope.dt.setMilliseconds(0);
            $scope.initTimePicker($scope.dt);
        };

        $scope.clear = function() {
            $scope.dt = null;
        };

        $scope.open = function() {
            $scope.popup.opened = true;
        };


        $scope.popup = {
            opened: false
        };

        $scope.dateChange = function() {
            $scope.initTimePicker($scope.dt);
        };

    }
]);

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('challenge').factory('User', ['$resource',
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

angular.module('challenge').factory('Challenges', ['$resource',
    function($resource) {
        return $resource('api/rankings/challengees', {
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

/**
 * Created by breed on 8/3/16.
 */
'use strict';

angular.module('core').controller('ChallengesCardController', ['$scope', '$timeout', '$window', 'Authentication', 'Circuit', '$http',
    function($scope, $timeout, $window, Authentication, Circuit, $http) {
        $scope.user = Authentication.user;
        $scope.imageURL = $scope.user.profileImageURL;
        $scope.displayRank = "Unknown";
        $scope.circuit = "Unknown";

        $http.get('/api/user').success(function (response) {
            $scope.circuit = Circuit.circuit(response.rank);
            $scope.displayRank = Circuit.displayRank(response.rank);

        }).error(function (response) {
            $scope.error = response.message;
        });
    }
]);

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

/**
 * Created by breed on 8/3/16.
 */
'use strict';

angular.module('core').controller('ProfileCardController', ['$scope', '$timeout', '$window', 'Authentication', 'Circuit', '$http',
    function($scope, $timeout, $window, Authentication, Circuit, $http) {
        $scope.user = Authentication.user;
        $scope.imageURL = $scope.user.profileImageURL;
        $scope.displayRank = "Unknown";
        $scope.circuit = "Unknown";

        $http.get('/api/user').success(function (response) {
            new Circuit().then(function(result) {
                $scope.circuit = result.circuit(response.rank);
                $scope.displayRank = result.displayRank(response.rank);
            });
        }).error(function (response) {
            $scope.error = response.message;
        });
    }
]);

/**
 * Created by breed on 8/5/16.
 */

'use strict';

angular.module('rankings').controller('RankingCardController', ['$scope', '$filter', 'Rankings', 'Circuit',
    function($scope, $filter, Rankings, Circuit) {
        $scope.world = [];
        $scope.major = [];
        $scope.minor = [];
        $scope.mosh = [];

        Rankings.query(function(data) {
            $scope.users = data;
            $scope.buildPager();
        });

        $scope.figureOutItemsToDisplay = function() {
            var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
            var end = begin + $scope.itemsPerPage;

            // Separate out by circuit
            $scope.world = $scope.filter($scope.users.slice(0, $scope.cSize));
            $scope.major = $scope.filter($scope.users.slice($scope.cSize, 2*$scope.cSize));
            $scope.minor = $scope.filter($scope.users.slice(2*$scope.cSize, 3*$scope.cSize));
            $scope.mosh = $scope.filter($scope.users.slice(3*$scope.cSize, end));

        };

        $scope.buildPager = function() {
            $scope.pagedItems = [];
            $scope.itemsPerPage = 100;
            $scope.currentPage = 1;
            new Circuit().then(function(result) {
                $scope.cSize = result.cSize;
                $scope.figureOutItemsToDisplay();
            });
        };

        $scope.filter = function(users) {
            $scope.filteredItems = $filter('filter')(users, {
                $: $scope.search
            });
            $scope.filterLength = $scope.filteredItems.length;
            var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
            var end = begin + $scope.itemsPerPage;
            return $scope.filteredItems.slice(begin, end);
        };

        $scope.pageChanged = function() {
            $scope.figureOutItemsToDisplay();
        };
    }
]);

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

angular.module('core').controller('HeaderController', ['$rootScope', '$scope', '$location', '$state', 'Authentication', 'Menus', '$window',
  function($rootScope, $scope, $location, $state, Authentication, Menus, $window) {
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

'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$http', '$compile', '$timeout', 'Card', '$rootScope',
  function($scope, Authentication, $http, $compile, $timeout, Card, $rootScope) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    // says when it's okay to render the deck
    $scope.initialized = false;
    $scope.mainDeck = {
      rootUrl: '#/deckster',
      //settings for gridster
      gridsterOpts: {
        max_cols: 4,
        widget_margins: [10, 10],
        widget_base_dimensions: ['auto', 250],
        responsive_breakpoint: 850
      }
    };

    // examples Of how you can fetch content for cards
    var getSummaryTemplate = function(cardConfig, cb) {
      // Not using the cardConfig here but you could use it to make request
      $http.get('modules/core/client/views/testSummaryCard.html').success(function (html) {
        if (cb) cb($compile(html)($scope));
      });
    };

    var getDetailsTemplate = function(cardConfig, cb) {
      // Not using the cardConfig here but you could use it to make request
      $http.get('modules/core/client/views/testDetailsCard.html').success(function (html) {
        if (cb) cb($compile(html)($scope));
      });
    };

    var viewRankings = function(cardConfig, cb) {
      // Not using the cardConfig here but you could use it to make request
      if ($scope.authentication.user) {
        $http.get('modules/core/client/views/cards/rankingsCard.client.view.html').success(function (html) {
          if (cb) cb($compile(html)($scope));
        });
      }
    };
    
    var viewProfile = function(cardConfig, cb) {
      // Not using the cardConfig here but you could use it to make request
      if ($scope.authentication.user) {
        $http.get('modules/core/client/views/cards/profile.client.view.html').success(function (html) {
          if (cb) cb($compile(html)($scope));
        });
      }
    };
      
    var viewNews = function(cardConfig, cb) {
        if($scope.authentication.user) {
            // Not using the cardConfig here but you could use it to make request
            $http.get('modules/core/client/views/cards/news.client.view.html').success(function (html) {
                return cb && cb($compile(html)($scope));
            });
        }
    };
          
    var viewChallenges = function(cardConfig, cb) {
      if($scope.authentication.user) {
        // Not using the cardConfig here but you could use it to make request
        $http.get('modules/challenges/client/views/my-challenges.client.view.html').success(function (html) {
          return cb && cb($compile(html)($scope));
        });
      }
    };

    var viewStats = function(cardConfig, cb) {
      if($scope.authentication.user) {
        // Not using the cardConfig here but you could use it to make request
        $http.get('modules/core/client/views/Cards/statsCard.client.view.html').success(function (html) {
          return cb && cb($compile(html)($scope));
        });
      }
    };

    // Define a static array of card configurations or load them from a server (ex: user defined cards)
    $scope.mainDeck.cards = [
      {
        title: 'Rankings',
        id: 'rankingsCard',
        hasPopout: true,
        summaryContentHtml: viewRankings,
        detailsContentHtml: viewRankings,
        position: {
          size_x: 2,
          size_y: 2,
          col: 1,
          row: 3
        }
      },
      {
        title: 'Your Profile',
        id: 'profileCard',
        summaryContentHtml: viewProfile,
        detailsContentHtml: viewProfile,
        position: {
          size_x: 1,
          size_y: 2,
          col: 1,
          row: 1
        }
      },
        {

            title: 'News Feed',
            id: 'newsFeedCard',
            summaryContentHtml: viewNews,
            detailsContentHtml: viewNews,
            position: {
                size_x: 1,
                size_y: 2,
                col: 4,
                row: 1
            }
        },
        {   
        title: 'My Challenges',
        id: 'ChallengesCard',
        summaryContentHtml: viewChallenges,
        detailsContentHtml: viewChallenges,
        position: {
          size_x: 2,
          size_y: 2,
          col: 2,
          row: 1
        }
      },
      {
        title: 'My Stats',
        id: 'StatsCard',
        summaryContentHtml: viewStats,
        detailsContentHtml: viewStats,
        position: {
          size_x: 2,
          size_y: 2,
          col: 3,
          row: 3
        }
      }
      // {
      //   title: 'Timeline',
      //   id: 'timelineCard',
      //   summaryContentHtml: getSummaryTemplate,
      //   detailsContentHtml: getDetailsTemplate,
      //   position: {
      //     size_x: 1,
      //     size_y: 1,
      //     col: 4,
      //     row: 3
      //   }
      // }
    ];

    // Once the cards are loaded (could be done in a async call) initialize the deck
    $timeout(function () {
      $scope.initialized = true;
    });


  }
]);

/**
 * Created by breed on 8/3/16.
 */

'use strict';

/*globals $:false */

angular.module('core')

    .factory('Deckster', function () {
        return window.Deckster;
    })


    .directive('decksterDeck', ["$parse", "$timeout", function ($parse, $timeout) {

        var defaults = {
            gridsterOpts: {
                max_cols: 4,
                widget_margins: [10, 10],
                widget_base_dimensions: ['auto', 250],
                responsive_breakpoint: 850
            }
        };

        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'modules/core/client/views/decksterDeck.html', // TODO
            scope: {
                deck: '=',
                initialized: '='
            },
            controller: ["$scope", function($scope) {
                $scope.deckInitialized = false;

                $scope.$on('deckster:resize', function () {
                    if ($scope.deckster) {
                        $timeout(function () {
                            $scope.deckster.$gridster.recalculate_faux_grid();
                        });
                    }
                });

                this.addCard = function (card, callback) {
                    $scope.deckster.addCard(card, function (card) {
                        if (callback) callback(card);
                    });
                };

                this.init = function (element, opts) {
                    $scope.deckster = $(element).deckster(opts).data('deckster');
                    $scope.deckInitialized = true;
                };
            }],
            link: function (scope, element, attrs, ctrl) {
                var deckOptions = $.extend(true, {}, defaults, scope.deck);
                var $deckEl = $(element).find('.deckster-deck');

                scope.$watch('initialized', function(init) {
                    if (init && !scope.deckInitialized) {
                        ctrl.init($deckEl, deckOptions);
                    }
                });

                scope.$on('$destroy', function() {
                    scope.deckster.destroy();
                    scope.deckInitialized = false;
                });
            }
        };
    }])

    .directive('decksterCard', ["$parse", "$q", "$http", "$timeout", function ($parse, $q, $http, $timeout) {


        return {
            restrict: 'E',
            require: ['^decksterDeck', 'decksterCard'],
            controller: ["$scope", "$compile", function ($scope, $compile) {
                // //Default summaryContentHtml function
                // this.getSummaryContent = function (card, cb) {
                //   $timeout(function() {
                //     cb($compile('<div></div>')($scope));
                //   });
                // };
                //
                // // Default detailsContentHtml function
                // this.getDetailsContent = function (card, cb) {
                //   $timeout(function() {
                //     cb($compile('<div></div>')($scope));
                //   });
                // };

                // Default leftControlsHtml function
                this.getLeftControlsContent = function (card, cb) {
                    $timeout(function() {
                        cb($compile('<div></div>')($scope));
                    });
                };

                // Default rightControlsHtml function
                this.getRightControlsContent = function (card, cb) {
                    $timeout(function() {
                        cb($compile('<div></div>')($scope));
                    });
                };

                // Default centerControlsHtml function
                this.getCenterControlsContent = function (card, cb) {
                    $timeout(function() {
                        cb($compile('<div></div>')($scope));
                    });
                };

                this.onReload = function (card) {
                    console.log('card reloaded', card);
                };

                this.onResize = function (card) {
                    console.log('card resized', card);
                };

                this.onExpand = function (card)  {
                    console.log('card expanded', card);
                };

                this.scrollToCard = function () {
                    $scope.card.scrollToCard();
                };

                this.toggleCard = function () {
                    // $scope.card.hidden ? $scope.card.showCard() : $scope.card.hideCard();
                };

                this.setUpCard = function (cardOpts) {
                    if(!cardOpts.summaryViewType && !cardOpts.detailsViewType) {
                        cardOpts.summaryContentHtml = cardOpts.summaryContentHtml || this.getSummaryContent;
                        cardOpts.detailsContentHtml = cardOpts.detailsContentHtml || this.getDetailsContent;
                        cardOpts.onResize = cardOpts.onResize || this.onResize;
                        cardOpts.onReload = cardOpts.onReload || this.onReload;
                    }

                    cardOpts.showFooter = false;
                    cardOpts.leftControlsHtml = this.getLeftControlsContent;
                    cardOpts.rightControlsHtml = this.getRightControlsContent;
                    cardOpts.centerControlsHtml = this.getCenterControlsContent;

                    $scope.$on('deckster-card:scrollto-' + cardOpts.id, this.scrollToCard);
                    $scope.$on('deckster-card:toggle-' + cardOpts.id, this.toggleCard);

                    return cardOpts;
                };

            }],
            link: function (scope, element, attrs, ctrls) {
                var deckCtrl = ctrls[0];
                var cardCtrl = ctrls[1];

                var cardOpts = $parse(attrs.cardOptions || {})(scope);

                scope.$watch('deckInitialized', function (initialized) {
                    if (initialized) {
                        deckCtrl.addCard(cardCtrl.setUpCard(cardOpts), function (card) {
                            scope.card = card;

                            // When the deck is resize resize this card as well
                            scope.$on('deckster:resize', function () {
                                // TODO code to resize cards
                            });

                            scope.$on('deckster:redraw', function () {
                                $timeout(function () {
                                    // TODO code to redraw cards
                                });
                            });
                        });
                    }
                });
            }
        };
    }])

    //deckster popout
    .directive('decksterPopout', ['$injector', '$compile', '$http', 'Deckster', function($injector, $compile, $http, Deckster) {
        return {
            restrict: 'E',
            link: function(scope, element) {
                var cardId, section;

                var $routeParams = $injector.get('$routeParams');
                cardId = $routeParams.id;
                section = $routeParams.section;


                var getSummaryTemplate = function(cardConfig, cb) {
                    // Not using the cardConfig here but you could use it to make request
                    $http.get('partials/testSummaryCard.html').success(function(html) {
                        if (cb) cb($compile(html)(scope));
                    });
                };

                var getDetailsTemplate = function(cardConfig, cb) {
                    // Not using the cardConfig here but you could use it to make request
                    $http.get('partials/testDetailsCard.html').success(function (html) {
                        if (cb) cb($compile(html)(scope));
                    });
                };

                // Get card config from server or angular constants using cardId
                var cardConfig =  {
                    title: 'Photos',
                    id: 'photoCard',
                    summaryContentHtml: getSummaryTemplate,
                    detailsContentHtml: getDetailsTemplate,
                    position: {
                        size_x: 1,
                        size_y: 1,
                        col: 1,
                        row: 1
                    }
                };

                Deckster.generatePopout(element, cardConfig, section);
            }
        };
    }]);

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
/**
 * Created by breed on 8/3/16.
 */

'use strict';

angular.module('core').factory('Card', ["$http", "Deckster", "DataManager", "$filter", "lodash", function ($http, Deckster, DataManager, $filter, lodash) {
        var Card = function (cardData) {
            return this.setData(cardData);
        };

        Card.prototype.setData = function (cardData) {
            angular.extend(this, cardData);
            // this.onResize = DataManager.defaultOnResize;
            // this.loadData = DataManager.defaultLoadData;
            // this.reloadView = DataManager.defaultOnReload;
            return this;
        };

        Card.prototype.onResize = function (card) {
            card.resizeCardViews();
        };

        Card.prototype.loadData = function (card, callback) {
            card.showSpinner();

            var cardOptions = card.options.getCurrentViewOptions(card.currentSection);
            var cardType = card.options.getCurrentViewType(card.currentSection);

            if (cardType === 'drilldownView') {
                cardType = cardOptions.viewType;
            }

            var loadData = function (data) {
                var transformData = function (data) {
                    data = DataManager.transformDataForCard(data, cardType, cardOptions);
                    // setSeriesColors(card, data.series);
                    if (callback) callback(data);
                    card.hideSpinner();
                };

                if (cardOptions.preDataTransform) {
                    cardOptions.preDataTransform(card, data, transformData);
                } else {
                    transformData(data);
                }
            };

            if(cardType !== 'table') {
                var filters = {};
                $http.get(cardOptions.apiUrl, {
                    params: filters
                }).then(function (response) {
                    loadData(response.data);
                }).finally(function () {
                    card.hideSpinner();
                });
            } else {
                // callback && callback();
                card.hideSpinner();
            }
        };

        Card.prototype.reloadView = function (card) {
            var view = Deckster.views[card.options.getCurrentViewType(card.currentSection)];
            if (view.reload) {
                view.reload(card, card.currentSection);
            }
        };

        Card.prototype.isNew = function () {
            return !angular.isDefined(this.id);
        };

        Card.prototype.getCurrentViewType = function (section) {
            return this[section + 'ViewType'];
        };

        /**
         * Get the view options of associated with the currentSection.
         * If the view is a drilldownView it gets the view options associated with the
         * active view.
         *
         * @param section
         * @returns {*}
         */
        Card.prototype.getCurrentViewOptions = function (section) {
            var viewOptions = this[section + 'ViewOptions'];
            if (this.getCurrentViewType(section) === 'drilldownView') {
                return viewOptions.views[viewOptions.activeView];
            } else {
                return viewOptions;
            }
        };
        
        Card.dataFormatter = {
            'name': nameFormatter,
            'date': dateFormatter,
            'title': titleFormatter,
            'titleKeepSymbols': titleKeepSymbolsFormatter,
            'default': titleFormatter,
            'caps': capsFormatter,
            'capsNoCommas': capsNoCommasFormatter,
            'currency': currencyFormatter,
            'none': function(val) {return val;}
        };

        
        function capsFormatter(val) {
            return val.toUpperCase();
        }
        
        function capsNoCommasFormatter(val) {
            if (typeof val === 'string' || val instanceof String) {
                val = val.replace(',', '');
                return val.toUpperCase();
            }
            return val;
        }
        
        // Used to title-ize values
        function titleFormatter (val, unformat) {
            if(unformat) {
                return lodash.snakeCase(val);
            } else {
                return lodash.startCase(val);
            }
        }
        
        // Used to title-ize values without removing symbolic characters (other than _)
        function titleKeepSymbolsFormatter (val) {
            return lodash.map(lodash.words(val, /[^\s_]+/g), function(word){
                return lodash.capitalize(word);
            }).join(' ');
        }
        
        // Used to format name values
        function nameFormatter (val, unformat) {
            var parts;
        
            // If it is comma separated assume that its in the form lastname, firstname
            if (unformat){
                if (val && val.match(/\s/g)) {
                    parts = val.split(' ');
                    return (parts[1].trim() + ', ' + parts[0].trim()).toLowerCase();
                } else {
                    return val.toLowerCase();
                }
            } else if (val === true || val === false) {
                return val;
            } else {
                if (val && val.match(/.*,.*/g)) {
                    parts = val.split(',');
                    return lodash.startCase([parts[1].trim(), parts[0].trim()].join(' '));
                } else {
                    return lodash.startCase(val);
                }
            }
        }
        
        function currencyFormatter(val, decimalPlaces) {
            if(lodash.isFinite(val)) {
                return $filter('currency')(val, '$', decimalPlaces || 0);
            } else {
                return val;
            }
        }
        
        // Used to format date values
        function dateFormatter (date, format) {
            //return moment(new Date(date)).format(format);
            return date; // TODO
        }
        
        Card.prototype.getDataFormatter = function (format) {
            if (lodash.isEmpty(format)) {
                return Card.dataFormatter['default'];
            } else if (lodash.isString(format)) {
                return Card.dataFormatter[format];
            } else {
                return Card.dataFormatter[format.type];
            }
        };

        return Card;
    }]);

/**
 * Created by breed on 8/4/16.
 */

'use strict';


// Service to determine circuit and display rank from raw rank
angular.module('core').factory('Circuit', ['$http', '$q',
    function($http, $q) {

        var circuits = function() {
            var deferred = $q.defer();

            var Circuit = {};

            $http.get('/api/props').then(function (response) {
                Circuit.cSize = response.data.circuitSize ? response.data.circuitSize : 10;
                var cSize = Circuit.cSize;
                Circuit.circuit = function (rank) {
                    if (rank === null || rank > 3*cSize) {
                        return "Mosh Pit";
                    } else if (rank < (+cSize + 1)) {
                        return "World Circuit";
                    } else if (rank < 2 * +cSize + 1) {
                        return "Major Circuit";
                    } else if (rank < 3 * +cSize + 1) {
                        return "Minor Circuit";
                    } else {
                        return "Circuit undetermined";
                    }
                };

                Circuit.displayRank = function (rank) {
                    if (rank === null || rank > 3*cSize) {
                        return "Un"; // unranked
                    } else if (rank % cSize === 0) {
                        return cSize;
                    } else {
                        return rank % cSize;
                    }
                };

                deferred.resolve(Circuit);

            }, function (error) {
                console.log("Error", error);
            });

            return deferred.promise;

        };

        return circuits;
    }
]);

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

/**
 * Created by breed on 8/3/16.
 */

'use strict';

angular.module('core').factory('DataManager', ["$http", "$q", "Deckster", "lodash", function ($http, $q, Deckster, lodash) {

    var DataManager = {};
    DataManager.fiscalYearStart = new Date('4/4/2015'); // TODO: This needs to be pulled from a DB at some point.
    DataManager.fiscalYearEnd = new Date('4/6/2016');
    var dbColumnMetadata = null;

    DataManager.colorMap = {
        white: '#ffffff',
        headcount: '#7cb5ec',
        hires: '#8dce39',
        vterminations: '#f7a35c',
        iterminations: '#de546b'
    };

    DataManager.query = function (queryParams) {
        var deferred = $q.defer();

        $http.post('/api/data/query/', queryParams).then(function (response) {
            deferred.resolve(response.data);
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    };

    var _query = function _query(queryParams, callback) {
        DataManager.query(queryParams).then(function (jsonResultSet) {
            callback(jsonResultSet || []);
        }, function () {
            callback([]);
        });
    };

    DataManager.externalAPI = function (queryParams) {
        var deferred = $q.defer();

        $http.post('/api/data/externalAPI/', queryParams).then(function (response) {
            deferred.resolve(response.data);
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    };

    DataManager.transformDataForCard = function (data, cardType, cardOptions) {
        setDefaultTransformOptions(cardOptions);
        // TODO: after setting defaults this might be a good place for validating the dataTransform options of the card json
        var transform = cardOptions.customDataTransformer || dataTransformer[cardType];
        return transform(data, cardOptions);
    };

    function setDefaultTransformOptions(options) {
        options.dataTransform = lodash.merge({}, options.dataTransform);
        options.dataTransform.titleFormats = lodash.merge({
            category: 'default',
            series: 'default',
            categoryX: 'default',
            categoryY: 'default'
        }, options.dataTransform.titleFormats);
    }

    DataManager.generateAutocompleteConfig = function (apiUrl, nameColumn, valueColumn, titleName, formatter, selected, dependsOnFilters, dependedByFilters, selections, allowClear) {
        return {
            name: nameColumn,
            titleName: titleName,
            nameColumn: nameColumn,
            valueColumn: valueColumn,
            displayName: '<%= ' + nameColumn + ' %>',
            displayNameFormatter: formatter,
            selectedFilter: selected && selected[nameColumn] ? selected : null,
            autocomplete: {
                apiUrl: apiUrl
            },
            dependsOnFilters: dependsOnFilters,
            dependedByFilters: dependedByFilters,
            selections: selections,
            allowClear: allowClear
        };
    };

    // DataManager.getHistogramControls = function () {
    //   return {
    //     rightControlsContent: 'components/deckster/views/histogramChart/histogramChart-controls.html',
    //     selectedFilter: 10,
    //     selectedBinNumber: 10,
    //     changeBinNumber: function (card, binNumber) {
    //       var templateVariables = card.options.getTemplateVariables();
    //       var viewOptions = card.options.getCurrentViewOptions(card.currentSection);
    //       viewOptions.controls.selectedBinNumber = binNumber;
    //       templateVariables.binClause = binNumber;
    //       FilterService.createFilteredQuery(card, templateVariables);
    //     }
    //   }
    // };

    DataManager.getLayerManagerClauses = function (layerManCol, layerManName) {
        return {
            managerType: layerManCol,
            managerClause: layerManCol + " ~ '" + layerManName + "'",
            activeClause: "employment_status = 'active'"
        };
    };

    var setSeriesColors = function setSeriesColors(card, series) {
        var seriesColors = card.$deckster.options.seriesColorMap;
        lodash.each(series, function (series) {
            var seriesName = series.name;
            if (lodash.contains(lodash.keys(seriesColors), seriesName)) {
                series.color = seriesColors[seriesName];
            }
        });
    };

    DataManager.loadSummaryBarData = function (deck, callback) {
        if (deck.summaryBar.apiUrl) {
            var filters = deck.getSelectedFiltersJSON();

            $http.get(deck.summaryBar.apiUrl, {
                params: filters
            }).then(function (response) {
                var data = response.data;

                if (deck.summaryBar.postQuery) {
                    deck.summaryBar.postQuery(deck, data);
                }

                callback(data);
            });
        } else {
            console.info("No endpoint found for card");
        }
    };

    DataManager.defaultLoadData = function (card, callback) {
        card.showSpinner();

        // get current view metadata
        var cardOptions = card.options.getCurrentViewOptions(card.currentSection);
        var cardType = card.options.getCurrentViewType(card.currentSection);

        //Adjust some property locations if this is a drillable card
        if (cardType === 'drilldownView') {
            cardType = cardOptions.viewType;
        }

        // create the initial query (passing in null for filters to set default values)
        if (!cardOptions.query && cardOptions.queryTemplate) {
            //setting date range on the filters
            var date = {
                start: card.$deckster.options.startDate,
                end: card.$deckster.options.endDate,
                maxEndDate: card.$deckster.options.maxEndDate
            };

            var selectedFilter = card.$deckster.options.getSelectedFiltersJSON();
            selectedFilter.date_range = date;
            // FilterService.createFilteredQuery(card, selectedFilter, {reloadContent: false});
        }

        // load card controls
        //if(!lodash.isUndefined(cardOptions.controls) && lodash.isFunction(cardOptions.controls.loadControls)) {
        //  cardOptions.controls.loadControls(card);
        //}

        var loadData = function loadData(data) {
            var transformData = function transformData(data) {
                data = DataManager.transformDataForCard(data, cardType, cardOptions);
                setSeriesColors(card, data.series);
                if (callback) callback(data);
                card.hideSpinner();
            };

            if (cardOptions.preDataTransform) {
                cardOptions.preDataTransform(card, data, transformData);
            } else {
                transformData(data);
            }
        };

        if (cardOptions.query) {
            _query(cardOptions.query, function (data) {
                loadData(data);
            }, function () {
                card.hideSpinner();
            });
        } else if (cardOptions.apiUrl) {
            if (cardType !== 'table') {
                // var filters = angular.merge(card.$deckster.options.getSelectedFiltersJSON(), card.options.drilldownFilters || {});
                var filters = {};
                $http.get(cardOptions.apiUrl, {
                    params: filters
                }).then(function (response) {
                    loadData(response.data);
                }).finally(function () {
                    card.hideSpinner();
                });
            } else {
                if (callback) callback();
                card.hideSpinner();
            }
        } else {
            console.info("No endpoint found for card");
        }
    };

    DataManager.defaultOnResize = function (card) {
        card.resizeCardViews();
    };

    DataManager.defaultOnReload = function (card) {
        var view = Deckster.views[card.options.getCurrentViewType(card.currentSection)];
        if (view.reload) {
            view.reload(card, card.currentSection);
        }
    };

    DataManager.getLastUpdated = function (card, callback) {
        $http.post('/api/data/lastUpdated/', card.lastUpdated || {}).then(function (response) {
            var date = response.data;
            //callback(date ? moment(date).toDate() : null);
            callback(date ? date : null); // TODO
        });
    };
    //
    // DataManager.promise = $http.post('/api/data/queryColumnMetadata/').then(function (response) {
    //   dbColumnMetadata = response.data;
    // });

    // DataManager.getPostgresDate = function (date) {
    //   return DateUtils.getFormattedDateFromDate(date);
    // };

    var dataTransformer = {
        'barChart': chartDataTransformer,
        'columnChart': chartDataTransformer,
        'columnRangeChart': columnRangeDataTransformer,
        'lineChart': chartDataTransformer,
        'splineChart': chartDataTransformer,
        'areaChart': chartDataTransformer,
        'pieChart': percentageChartDataTransformer,
        'donutChart': percentageChartDataTransformer,
        'geoMap': geoMapDataTransformer,
        'table': tableDataTransformer,
        'quadChart': quadChartDataTransformer,
        'heatmapChart': heatmapChartDataTransformer,
        'boxPlot': boxPlotDataTransformer,
        'histogramChart': chartDataTransformer
        //'scatterPlotChart': scatterPlotDataTransformer
    };

    // function scatterPlotDataTransformer(data, options) {
    //     var dataTransform = options.dataTransform;
    //     var categoryTitleFormatter = getDataFormatter(dataTransform.titleFormats.category);
    //     var legends = lodash.uniq(lodash.map(data, function (point) {
    //         return categoryTitleFormatter(point[dataTransform.legendPivot], dataTransform.titleFormats.category.format);
    //     }));
    //
    //     var symbols = lodash.keys(Highcharts.SVGRenderer.prototype.symbols);
    //     options.legendSymbols = {};
    //     lodash.each(legends, function (legendItem, index) {
    //         options.legendSymbols[legendItem] = symbols[index % symbols.length];
    //     });
    //
    //     var myData = {};
    //     lodash.each(data, function (point) {
    //         var legendKey = categoryTitleFormatter(point[dataTransform.legendPivot], dataTransform.titleFormats.category.format);
    //         var name = categoryTitleFormatter(point[dataTransform.nameColumn], dataTransform.titleFormats.category.format);
    //         myData[name] = myData[name] || { name: name, data: [], marker: { symbol: 'circle' } };
    //         myData[name].data.push({
    //             y: lodash.isNaN(point[dataTransform.yAxisColumn]) ? 0 : parseFloat(point[dataTransform.yAxisColumn]),
    //             x: lodash.isNaN(point[dataTransform.xAxisColumn]) ? 0 : parseFloat(point[dataTransform.xAxisColumn]),
    //             name: name,
    //             marker: {
    //                 symbol: options.legendSymbols[legendKey]
    //             }
    //         });
    //     });
    //
    //     myData = lodash.values(myData);
    //     return { query: options.query, series: myData };
    // }

    /**
     * Transform data for injecting into a box plot
     * @param data
     * @param options
     */

    function boxPlotDataTransformer(data, options) {
        var dataTransform = options.dataTransform;
        var categoryTitleFormatter = getDataFormatter(dataTransform.titleFormats.category);
        var categoryData;

        if (dataTransform.row === 'category') {
            categoryData = lodash.map(lodash.pluck(data, dataTransform.nameColumn), function (week) {
                return categoryTitleFormatter(week, dataTransform.titleFormats.category.format);
            });
        } else {
            categoryData = lodash.pluck(data, dataTransform.nameColumn);
        }

        var seriesData = lodash.map(data, function (row) {
            var lowerLimit = parseFloat(row.lower_limit);
            var upperLimit = parseFloat(row.upper_limit);

            if (row.min <= lowerLimit) {
                row.min = lowerLimit;
            }
            if (row.max >= upperLimit) {
                row.max = upperLimit;
            }
            return lodash.map([row.min, row.q1, row.median, row.q3, row.max], parseFloat);
        });

        var meanData = lodash.map(data, function (meanValue) {

            if (dataTransform.row === 'category') {
                meanValue[dataTransform.nameColumn] = categoryTitleFormatter(meanValue[dataTransform.nameColumn], dataTransform.titleFormats.category.format);
            }

            return lodash.map([categoryData.indexOf(meanValue[dataTransform.nameColumn]), parseFloat(meanValue.mean)]);
        });
        return {
            name: 'Hourly Distribution By Week',
            data: seriesData,
            categories: categoryData,
            mean: meanData
        };
    }

    /**
     *  Note: below is a way to inject various series attributes into the series object before processing. Simply make a
     *  JSON object in the summaryViewOptions that looks like:
     *  seriesOptions: {
   *    name:{
   *      'Data item name #1':
   *        {seriesAttributeName: seriesAttributeValue (e.g.pointPadding: 0.3, pointPlacement: -0.15)},
   *      'Data item name #2':
   *        {seriesAttributeName: seriesAttributeValue}
   *    }
   *  }
     * @param series
     * @param options
     */
    var applySeriesOptions = function applySeriesOptions(series, options) {
        if (options.seriesOptions) {
            //Creates an array corresponding to what we want our series to look like. It is unsorted at this point
            lodash.each(series, function (seriesItem) {
                if (options.seriesOptions.name[seriesItem.name]) {
                    seriesItem = lodash.merge(seriesItem, options.seriesOptions.name[seriesItem.name]);
                    var names = lodash.map(lodash.keys(options.seriesOptions.name), function (key) {
                        return key;
                    });
                    seriesItem.order = names.indexOf(seriesItem.name);
                }
                return seriesItem;
            });

            //This is to get the series into the order specified in the seriesOptions object
            series.sort(function (a, b) {
                if (a.order > b.order) {
                    return 1;
                }
                if (a.order < b.order) {
                    return -1;
                }
                // a must be equal to b
                return 0;
            });
        }
    };

    /**
     * Transform data for injecting into a basic chart (i.e. bar chart, line chart)
     * @param data
     * @param options
     * @returns {{query: *, categories: *, series: *}}
     */
    function chartDataTransformer(data, options) {

        var categories = [];
        var series = [];

        var dataTransform = options.dataTransform;

        // if first row is empty data, then delete it from consideration
        var firstRow = data[0];
        data = dataTransform.emptyRow ? data.slice(1) : data;

        // var categoryTitleFormatter = getDataFormatter(dataTransform.titleFormats.category);
        // var seriesTitleFormatter = getDataFormatter(dataTransform.titleFormats.series);

        var nameColumn = dataTransform.nameColumn;

        if (dataTransform.row === 'series') {
            categories = lodash.map(lodash.keys(lodash.omit(firstRow, dataTransform.nameColumn)), function (category) {
                //return categoryTitleFormatter(category, dataTransform.titleFormats.category.format);
                return category;
            });
            lodash.forEach(data, function (obj) {
                series.push({
                    //name: seriesTitleFormatter(obj[dataTransform.nameColumn], dataTransform.titleFormats.series.format),
                    name: obj[dataTransform.nameColumn],
                    data: lodash.map(lodash.values(lodash.omit(obj, dataTransform.nameColumn)), Number)
                });
            });
        } else if (dataTransform.row === 'category') {
            console.log(data);
            categories = lodash.map(data, function (obj) {
                //return categoryTitleFormatter(obj[dataTransform.nameColumn], dataTransform.titleFormats.category.format);
                return obj[nameColumn];
            });
            lodash.forOwn(firstRow, function (value, key) {
                if (key !== nameColumn) {
                    series.push({
                        //name: seriesTitleFormatter(key, dataTransform.titleFormats.series.format),
                        name: key,
                        data: lodash.map(lodash.pluck(data, key), Number),
                        visible: !lodash.includes(options.nonVisibleSeries, key)
                    });
                }
            });
        }

        applySeriesOptions(series, options);

        return {
            query: options.query,
            categories: categories,
            series: series
        };
    }

    /**
     * Transform data for injecting into a quad chart
     * @param data
     * @param options
     * @returns {{data: *}}
     */
    function quadChartDataTransformer(data, options) {

        // TODO: fillin with whatever makes sense when it makes sense

        return { data: data };
    }

    /**
     * Transform data for injecting into a columnRange chart
     * @param data
     * @param options
     * @returns {{query: *, categories: *, series: *}}
     */
    function columnRangeDataTransformer(data, options) {
        var series = [];

        var dataTransform = options.dataTransform;

        var categoryTitleFormatter = getDataFormatter(dataTransform.titleFormats.category);
        var seriesTitleFormatter = getDataFormatter(dataTransform.titleFormats.series);

        var categories = lodash.map(data, function (obj) {
            return categoryTitleFormatter(obj[dataTransform.nameColumn], dataTransform.titleFormats.category.format);
        });

        lodash.forEach(dataTransform.seriesMap, function (seriesInfo) {
            var seriesName = seriesInfo.name;
            series.push({
                name: seriesTitleFormatter(seriesName, dataTransform.titleFormats.series.format),
                data: lodash.map(data, function (row) {
                    var returnData = [];
                    // If only a single series column is defined, then store it individually.
                    // This is needed for laying point data on top of the columnrange chart.
                    if (!lodash.isUndefined(seriesInfo.seriesColumn)) {
                        returnData = [row[seriesInfo.seriesColumn]];
                    } else {
                        returnData = [row[seriesInfo.minColumn], row[seriesInfo.maxColumn]];
                    }
                    return returnData;
                })
            });
        });

        applySeriesOptions(series, options);

        return { query: options.query, categories: categories, series: series };
    }

    function getDataFormatter(format) {
        if (lodash.isEmpty(format)) {
            return dataTransformer['default'];
        } else if (lodash.isString(format)) {
            return dataTransformer[format];
        } else {
            return dataTransformer[format.type];
        }
    }

    DataManager.getDataFormatter = getDataFormatter;

    /**
     * Transform data for injecting into a pergentage chart (i.e. donut chart, pie chart)
     * @param data
     * @param options
     * @returns {{query: *, data: *}}
     */
    function percentageChartDataTransformer(data, options) {
        var dataTransform = options.dataTransform;
        var transformedData;

        var categoryTitleFormatter = getDataFormatter(dataTransform.titleFormats.category);

        if (dataTransform.row === 'series') {
            transformedData = lodash.map(lodash.pairs(data[0]), function (pair) {
                pair[0] = categoryTitleFormatter(pair[0], dataTransform.titleFormats.category.format);
                return pair;
            });
        } else {
            transformedData = lodash.map(data, function (row) {
                var title = row[dataTransform.nameColumn];
                var value = lodash.values(lodash.omit(row, dataTransform.nameColumn))[0];
                return { name: categoryTitleFormatter(title), y: parseFloat(value) };
            });
        }

        applySeriesOptions(transformedData, options);

        return { query: options.query, data: transformedData };
    }

    /**
     * Transform data for injecting into a table
     * @param data
     * @param options
     */
    function tableDataTransformer(data, options) {
        //Table data transforms should be done in the table.js responseHandler
        return data;
    }

    function getDefaultColumnMetadata(col) {
        return { name: col, displayName: lodash.startCase(col), type: 'STRING' };
    }

    /**
     * Transform data for injecting into a map
     * @param data
     * @param options
     * @returns {*}
     */
    function geoMapDataTransformer(data, options) {
        var generateGeoJSONData = function generateGeoJSONData(geoRecs) {
            var returnGeoJSON = [];
            lodash.each(geoRecs, function (geoRec) {
                var latitude = geoRec.latitude;
                var longitude = geoRec.longitude;
                if (!lodash.isNull(latitude) && !lodash.isNull(longitude)) {
                    var geoPoint = {};
                    geoPoint.type = 'Feature';
                    geoPoint.properties = {};
                    // Store the returned column values in the geoPoint for later use (in the tooltip)
                    lodash.forEach(lodash.keys(geoRec), function (key) {
                        geoPoint.properties[key] = geoRec[key];
                    });
                    geoPoint.geometry = {};
                    geoPoint.geometry.type = 'Point';
                    //These are backwards due to the fact that markers require longitude first
                    geoPoint.geometry.coordinates = [longitude, latitude];
                    returnGeoJSON.push(geoPoint);
                }
            });

            return returnGeoJSON;
        };

        var geoJSONData = generateGeoJSONData(data) || [];
        return { query: options.query, geoJSONData: geoJSONData };
    }

    function getGradientColor(baseColor, percent) {
        var gradient = Math.round(180 * (1 - percent));
        var step = lodash.padLeft(gradient.toString(16), 2, '0');
        return baseColor.replace(/00/g, step);
    }

    function heatmapChartDataTransformer(data, options) {
        var heatmapData = [];

        if (!lodash.isEmpty(data)) {
            var dataTransform = options.dataTransform;

            var categoryXTitleFormatter = getDataFormatter(dataTransform.titleFormats.categoryX);
            var categoryYTitleFormatter = getDataFormatter(dataTransform.titleFormats.categoryY);

            var categoriesX = lodash.map(lodash.keys(lodash.omit(data[0], dataTransform.nameColumn)), function (category) {
                return category;
            });

            var categoriesY = lodash.map(data, function (category) {
                return category[dataTransform.nameColumn];
            });

            lodash.forEach(data, function (row, yIndex) {
                lodash.forEach(row, function (value, key) {
                    if (key !== dataTransform.nameColumn) {
                        var xIndex = lodash.indexOf(categoriesX, key);
                        if (!options.colorMap) {
                            heatmapData.push([xIndex, yIndex, value]);
                        } else {
                            var color;
                            if (options.colorMap.addGradientForRow) {
                                var baseColor = options.colorMap[row[dataTransform.nameColumn]] || options.colorMap['default'];
                                color = value === 0 ? options.colorMap['default'] : getGradientColor(baseColor, value);
                                //                if (value === 0) {
                                //                  color = "#636363";
                                //                } else {
                                //                  color = getGradientColor(baseColor, value);
                                //                }
                            } else {
                                color = options.colorMap[value] || options.colorMap['default'];
                            }
                            heatmapData.push({ x: xIndex, y: yIndex, value: value, color: color });
                        }
                    }
                });
            });

            categoriesX = lodash.map(categoriesX, function (category) {
                return categoryXTitleFormatter(category, dataTransform.titleFormats.categoryX.format);
            });

            categoriesY = lodash.map(categoriesY, function (category) {
                return categoryYTitleFormatter(category, dataTransform.titleFormats.categoryY.format);
            });

            return { query: options.query, categories: { x: categoriesX, y: categoriesY }, data: heatmapData };
        }
    }

    // Chart Paging

    DataManager.chartPaging = {
        getPagingValuesFromClause: function getPagingValuesFromClause(pagingClause) {
            var pagingValues = {};
            pagingValues.limit = parseInt(new RegExp(/(?:LIMIT\s)(\d+)/g).exec(pagingClause)[1]);
            pagingValues.offset = parseInt(new RegExp(/(?:OFFSET\s)(\d+)/g).exec(pagingClause)[1]);
            return pagingValues;
        },

        getRecTotal: function getRecTotal(card, callback) {
            var templateVariables = card.options.getTemplateVariables();
            // Set paging totals
            // Get the original query
            var countQuery = lodash.cloneDeep(card.options.getCurrentViewOptions(card.currentSection).query);
            // Remove the paging clause from the query
            countQuery.json.expression = countQuery.json.expression.replace(templateVariables.cardFilter_pagingClause, '');
            // Wrap the query in a SELECT COUNT
            countQuery.json.expression = "SELECT COUNT(*) FROM (" + countQuery.json.expression + ") as countQuery";
            // Set the total records to the result
            DataManager.query(countQuery).then(function (jsonResultSet) {
                callback(parseInt(jsonResultSet[0].count));
            }, function () {
                callback(0);
            });
        },

        getPageCount: function getPageCount(card) {
            var templateVariables = card.options.getTemplateVariables();
            var pagingClauseValues = this.getPagingValuesFromClause(templateVariables.cardFilter_pagingClause);
            return Math.ceil(templateVariables.cardFilter_pagingRecTotal / pagingClauseValues.limit);
        },

        getCurrentPage: function getCurrentPage(card) {
            var templateVariables = card.options.getTemplateVariables();
            var pagingClauseValues = this.getPagingValuesFromClause(templateVariables.cardFilter_pagingClause);
            return pagingClauseValues.offset / pagingClauseValues.limit + 1;
        }

    };

    return DataManager;
}]);
//# sourceMappingURL=DataManager.service.js.map

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

angular.module('rankings').controller('RankingController', ['$scope', '$filter', 'Rankings', 'Circuit',
    function($scope, $filter, Rankings, Circuit) {
        $scope.world = [];
        $scope.major = [];
        $scope.minor = [];
        $scope.mosh = [];

        Rankings.query(function(data) {
            $scope.users = data;
            $scope.buildPager();
        });

        $scope.figureOutItemsToDisplay = function() {
            var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
            var end = begin + $scope.itemsPerPage;

            // Separate out by circuit
            $scope.world = $scope.filter($scope.users.slice(0, $scope.cSize));
            $scope.major = $scope.filter($scope.users.slice($scope.cSize, 2*$scope.cSize));
            $scope.minor = $scope.filter($scope.users.slice(2*$scope.cSize, 3*$scope.cSize));
            $scope.mosh = $scope.filter($scope.users.slice(3*$scope.cSize, end));

        };

        $scope.buildPager = function() {
            $scope.pagedItems = [];
            $scope.itemsPerPage = 100;
            $scope.currentPage = 1;
            new Circuit().then(function(result) {
                $scope.cSize = result.cSize;
                $scope.figureOutItemsToDisplay();
            });
        };

        $scope.filter = function(users) {
            $scope.filteredItems = $filter('filter')(users, {
                $: $scope.search
            });
            $scope.filterLength = $scope.filteredItems.length;
            var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
            var end = begin + $scope.itemsPerPage;
            return $scope.filteredItems.slice(begin, end);
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
      .state('authentication.invalid', {
        url: '/invalidemail',
        templateUrl: 'modules/users/client/views/email-invalid.client.view.html'
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

      $scope.imageURL = user.profileImageURL;
      $scope.$broadcast('show-errors-reset', 'updatePicture');

      // Show success message
      $scope.success = true;

      $http.get('api/user/me').success(function (data) {
        // Populate user object
        Authentication.user = data;
        $scope.imageURL = Authentication.user.profileImageURL;

        if (!$scope.$$phase) { // check if digest already in progress
          $scope.$apply(); // launch digest;
        }
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