angular.module( 'ngBoilerplate.user.LogoutCtrl', [

])

.controller( 'LogoutCtrl', function LogoutCtrl( $rootScope, $scope, $auth, $state, go, growl ) {
  $auth.logout()
    .then(function() {
      growl.success('Logged out');
      $rootScope.user = null;
      $state.go(go);
    });

})

;