'use strict';

/*globals $:false */

angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$http', '$compile', '$timeout',
  function($scope, Authentication, $http, $compile, $timeout) {
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
    
    $http.get('/api/props').success(function (props) {
      $.get("http://ipinfo.io", function(response) {
        if (props.adminIp === response.ip) {
          $scope.displayRoom = true;
        }
      }, "jsonp");
    });
    
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
          col: 3,
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
                size_x: 2,
                size_y: 2,
                col: 1,
                row: 3
            }
        },
        {   
        title: 'My Challenges',
        id: 'ChallengesCard',
        summaryContentHtml: viewChallenges,
        detailsContentHtml: viewChallenges,
        position: {
          size_x: 3,
          size_y: 2,
          col: 2,
          row: 1
        }
      }
      // {
      //   title: 'Table Data',
      //   id: 'tableCard',
      //   summaryContentHtml: getSummaryTemplate,
      //   detailsContentHtml: getDetailsTemplate,
      //   position: {
      //     size_x: 1,
      //     size_y: 2,
      //     col: 4,
      //     row: 3
      //   }
      // },
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
