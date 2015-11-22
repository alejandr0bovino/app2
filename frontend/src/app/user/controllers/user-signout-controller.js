angular.module( 'ngBoilerplate.user.SignoutCtrl', [

])

.controller( 'SignoutCtrl', function SignoutCtrl( $rootScope, $scope, $auth, $state, go, growl ) {
  $auth.logout()
    .then(function() {
      growl.success('Logged out');
      $rootScope.user = null;
      $state.go(go);
    });

})

;