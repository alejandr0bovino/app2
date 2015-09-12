angular.module( 'ngBoilerplate.user.UpdateCtrl', [

])

.controller( 'UpdateCtrl', function UpdateCtrl( $rootScope, $timeout, $scope, $auth, $state, User, resA, growl, go) {
  if (!resA) {
    $state.go('user.login');
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



    $scope.updateInfoEnter = function() {
      document.getElementById('updateInfoSubmit').click();
    };

    $scope.updateInfo = function() {
      // User.update({
      //   userName: $scope.userName,
      //   password: $scope.password,
      //   email: angular.lowercase($scope.email),
      //   pendingUpdate: 'empty',
      // }, function(data) {
      //   User.get(function(data){
      //     $rootScope.user = data;
      //   }, function(data){
      //     growl.error("Unable to get information");
      //   });
      //   growl.success("Registration completed successfully");
      //   console.log(go);
      //   $state.go(go);
      // }, function(response){
      //   if (typeof response.data.message != 'undefined') {
      //     growl.error(response.data.message);
      //   }
      // });




      // document.getElementById('location').blur();
      // document.getElementById('name').blur();

      // $scope.userName = '';
      // $scope.password = '';
      // $scope.confirmPassword = '';
      document.querySelector('.js-btn-unfocus').blur();
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