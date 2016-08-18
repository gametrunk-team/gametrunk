/**
 * Created by breed on 8/18/16.
 */

'use strict';

angular.module('core').directive('rankingShuffle', function() {
    return {
        restrict: 'E',
        templateUrl: '/modules/core/client/views/displayRoom/drRankingShuffle.client.view.html',
        controller: 'DrShuffleController'
    };
});
