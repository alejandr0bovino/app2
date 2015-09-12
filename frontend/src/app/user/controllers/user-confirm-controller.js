angular.module( 'ngBoilerplate.user.ConfirmCtrl', [

])

// .controller( 'ConfirmCtrl', function ConfirmCtrl( $stateParams, $scope, $auth, $state, $timeout, growl, User, resA) {
  // if (resA) {
  //   $state.go('user.profile');
  // } else {
  //   if ($stateParams.email === null) {
  //     $state.go('home');
  //   } else {
  //     $stateParams.email = null;
  //   }
  // }
.controller( 'ConfirmCtrl', function ConfirmCtrl($stateParams, $state) {
  if ($stateParams.email === null) {
    $state.go('home');
  }
})

;