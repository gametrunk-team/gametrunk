/**
 * Created by breed on 8/9/16.
 */

'use strict';

angular.module('core').directive('rankingsDisplay', function() {
    return {
        restrict: 'E',
        templateUrl: '/modules/core/client/views/displayRoom/drRankings.client.view.html',
        controller: 'DrRankingController'
    };
});
