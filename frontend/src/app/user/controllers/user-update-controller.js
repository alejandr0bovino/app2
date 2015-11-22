angular.module( 'ngBoilerplate.user.UpdateCtrl', [

])

.controller( 'UpdateCtrl', function UpdateCtrl( $rootScope, $timeout, $scope, $auth, $state, User, resA, growl, go) {
  if (!resA) {
    $state.go('user.signin');
  } else {

    User.get(function(data){
      // $rootScope.user = data;
      $scope.user = data;
       if (!data.pendingUpdate) {
        $state.go('user.profile');
      }
    }, function(data){
      growl.error("Unable to get information");
    });


    $scope.updateInfo = function() {
      $scope.updateInfoForm.$setPristine();

      var updatex = User.update({
        userName: $scope.userName,
        password: $scope.password,
        email: angular.lowercase($scope.email),
        pendingUpdate: 'empty',
      });

      var promise = updatex.$promise.then(
        function(response) {
          $rootScope.user = response.user;

          $timeout(function() {
            $state.go(go);

            $timeout(function() {
              growl.success("Registration completed successfully");
            }, 750);
          }, 2000);
        },
        function(response) {
          if (typeof response.data.message != 'undefined') {
            growl.error(response.data.message);
          }
        }
      );

      return promise;



    };
  }

})
;