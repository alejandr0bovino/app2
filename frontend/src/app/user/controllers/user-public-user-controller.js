angular.module( 'ngBoilerplate.user.PublicUserCtrl', [

])

.controller( 'PublicUserCtrl', function PublicUserCtrl($rootScope, $scope, $auth, user, userAll, growl, $state ) {

  if (user.data === null) {
    $state.go('home');
  } else {
    $scope.public_user = user.data;

    userAll.$promise.then(function(users) {
      $scope.userAll = users;
    });

    // var $header = $('#profile-picture'),
    // bg = $header.data('bg');

    // $header.css('background-image', 'url(' + bg + ')');
  }

})

;