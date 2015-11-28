angular.module( 'ngBoilerplate.user.ConfirmCtrl', [

])

.controller( 'ConfirmCtrl', function ConfirmCtrl($stateParams, $state) {
  if ($stateParams.email === null) {
    $state.go('home');
  }
})

;