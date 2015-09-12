angular.module( 'ngBoilerplate.user.LoginCtrl', [

])

.controller( 'LoginCtrl', function LoginCtrl($rootScope, $scope, $auth, $state, User, growl, resA, go) {
  if (resA) {
    $state.go('user.profile');
  } else {
    $scope.login = function() {
      $auth.login({ email: $scope.email, password: $scope.password })
        .then(function() {
          growl.success('Logged in: <b>' + $scope.email + '</b>');

          User.get(function(data){
            $rootScope.user = data;
          }, function(data){
            growl.error("Unable to get information");
          });

          $state.go(go);
        })
        .catch(function(response) {
          if (response.data.message === "You need to confirm your registration") {
            growl.warning(response.data.message);
          }
          else {
            growl.error(response.data.message);
          }

          $scope.password = '';
        });
    };
  }
})

;