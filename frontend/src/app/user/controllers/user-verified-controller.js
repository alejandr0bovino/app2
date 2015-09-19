angular.module( 'ngBoilerplate.user.VerifiedCtrl', [

])

.controller( 'VerifiedCtrl', function VerifiedCtrl( $stateParams, $rootScope, $scope, $auth, $state, $timeout, growl, User ) {
  User.confirmRegistrationPut({
    token: $stateParams.token
  }, function(data){
    if (data.alreadyConfirmed) {
      $state.go('user.profile');
    } else {
      growl.success("Success");
      $auth.setToken(data.token, '/user/profile');

      User.get(function(data){
        $rootScope.user = data;
      }, function(data){
        growl.error("Unable to get information");
      });


      $timeout(function () {
        $state.go('user.profile');
      }, 5000);





    }
  }, function(data){
    if (typeof data.message != 'undefined') {
      // growl.error(response.data.message);
      $state.go('home');
    }
  });

})

;