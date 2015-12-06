angular.module( 'ngBoilerplate.user.SigninCtrl', [])
.controller( 'SigninCtrl', function SigninCtrl($rootScope, $scope, $http, $auth, $state, $timeout, User, growl, authenticated,  go, ENV, formFactory) {
  if (authenticated) {
    $state.go('user.profile');
  } else {
    $scope.signin = function() {
      $scope.signinForm.$setPristine();
      $scope.btnDisabled = true;

      var promise = $http.post(
        ENV.apiEndpoint + '/auth/signin',{email:angular.lowercase($scope.email),password:$scope.password},{ignoreLoadingBar:true}
      );

      promise.then(
        function(response) {
          $timeout(function() {
            $auth.setToken(response.data.token);
            $rootScope.user = response.data.user;

            $state.go(go);

            $timeout(function() {
              growl.success("Logged in");
            }, 750);
          }, 1250);
        },
        function(response) {
          if (typeof response.data.message != 'undefined') {
            growl.warning(response.data.message);
            $scope.btnDisabled = false;
            // $scope.email = '';
            // $scope.password = '';

            formFactory.enableElements();
            // formFactory.clearElements();
            // formFactory.focusElement();
          }
        }
      );

      return promise;
    };

    // $scope.email = "imagenes43@gmail.com";
    // $scope.password = "lsjE55::::3:fsfsx";
    // $scope.password = "lsjE55::::3:fsfsxefwef";
  }
})

;