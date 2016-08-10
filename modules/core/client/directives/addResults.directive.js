/**
 * Created by breed on 8/9/16.
 */

'use strict';

angular.module('core').directive('addResults', function() {
    return {
        restrict: 'E',
        templateUrl: '/modules/core/client/views/addResults.client.view.html',
        controller: 'DisplayRoomController'
    };
});
