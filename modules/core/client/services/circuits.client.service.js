/**
 * Created by breed on 8/4/16.
 */

'use strict';


// Service to determine circuit and display rank from raw rank
angular.module('core').factory('Circuit', [
    function() {

        var Circuit = {};
        
        Circuit.circuit = function(rank) {
            if (rank === null) {
                return "Mosh Pit";
            } else if (rank < 11) {
                return "World Circuit";
            } else if (rank < 21) {
                return "Major Circuit";
            } else if (rank < 31) {
                return "Minor Circuit";
            } else {
                return "Circuit undetermined";
            }
        };
        
        Circuit.displayRank = function(rank) {
            if (rank === null || rank > 3*cSize) {
                return "Un"; // unranked
            } else if (rank % 10 === 0) {
                return 10;
            } else {
                return rank % 10
            }
        };

        return Circuit;

    }
]);
