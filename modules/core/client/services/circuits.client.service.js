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
                    if (rank === null) {
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
                    if (rank === null || 3*cSize) {
                        return "Un"; // unranked
                    } else if (rank % cSize === 0) {
                        return cSize;
                    } else {
                        return rank % cSize
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
