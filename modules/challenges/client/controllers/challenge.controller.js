'use strict';

angular.module('challenge').controller('ChallengeController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator','Admin', '$uibModal',
    function($scope, $state, $http, $location, $window, Authentication, PasswordValidator, Admin, $uibModal) {
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

        $scope.emailModal = function () {
            console.log("making the email modal");
            var modal = $uibModal.open({
                templateUrl: 'modules/challenges/client/views/result.client.view.html', // todo
                // template: '<p>wow check out this modal</p>'
                controller: 'ResultController', // todo
                scope: $scope,
                backdrop: false,
                windowClass: 'minimal-modal'
            });
        };

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
                
                $scope.emailModal();
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
