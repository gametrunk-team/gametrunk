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
        cb && cb($compile(html)($scope));
      });
    };

    var getDetailsTemplate = function(cardConfig, cb) {
      // Not using the cardConfig here but you could use it to make request
      $http.get('modules/core/client/views/testDetailsCard.html').success(function (html) {
        cb && cb($compile(html)($scope));
      });
    };

    var viewRankings = function(cardConfig, cb) {
      // Not using the cardConfig here but you could use it to make request
      $http.get('modules/rankings/client/views/rankings/list-rankings.client.view.html').success(function (html) {
        cb && cb($compile(html)($scope));
      });
    };

    // Define a static array of card configurations or load them from a server (ex: user defined cards)
    $scope.mainDeck.cards = [
      {
        title: 'Rankings',
        id: 'rankingsCard',
        hasPopout: true,
        summaryContentHtml: viewRankings,
        detailsContentHtml: getDetailsTemplate,
        position: {
          size_x: 1,
          size_y: 1,
          col: 1,
          row: 3
        }
      },
      {
        title: 'Alerts',
        id: 'alertsCard',
        summaryContentHtml: getSummaryTemplate,
        detailsContentHtml: getDetailsTemplate,
        position: {
          size_x: 1,
          size_y: 2,
          col: 3,
          row: 1
        }
      },
      {
        title: 'Geospatial',
        id: 'mapCard',
        summaryContentHtml: getSummaryTemplate,
        detailsContentHtml: getDetailsTemplate,
        position: {
          size_x: 2,
          size_y: 2,
          col: 1,
          row: 1
        }
      },
      {
        title: 'Table Data',
        id: 'tableCard',
        summaryContentHtml: getSummaryTemplate,
        detailsContentHtml: getDetailsTemplate,
        position: {
          size_x: 1,
          size_y: 2,
          col: 4,
          row: 1
        }
      },
      {
        title: 'Timeline',
        id: 'timelineCard',
        summaryContentHtml: getSummaryTemplate,
        detailsContentHtml: getDetailsTemplate,
        position: {
          size_x: 3,
          size_y: 1,
          col: 2,
          row: 3
        }
      }
    ];

    // Once the cards are loaded (could be done in a async call) initialize the deck
    $timeout(function () {
      $scope.initialized = true;
    });


  }
]);
