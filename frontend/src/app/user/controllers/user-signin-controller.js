angular.module( 'ngBoilerplate.user.SigninCtrl', [

])

.controller( 'SigninCtrl', function SigninCtrl($rootScope, $scope, $http, $auth, $state, $timeout, User, growl, authenticated,  go, ENV, formFactory) {
  if (authenticated) {
    $state.go('user.profile');
  } else {
    // $scope.login = function() {
    //   $auth.login({ email: $scope.email, password: $scope.password })
    //     .then(function() {
    //       growl.success('Logged in: <b>' + $scope.email + '</b>');

    //       User.get(function(data){
    //         $rootScope.user = data;
    //       }, function(data){
    //         growl.error("Unable to get information");
    //       });

    //       $state.go(go);
    //     })
    //     .catch(function(response) {
    //       if (response.data.message === "You need to confirm your registration") {
    //         growl.warning(response.data.message);
    //       }
    //       else {
    //         growl.error(response.data.message);
    //       }

    //       $scope.password = '';
    //     });
    // };


    $scope.signin = function() {
      $scope.signinForm.$setPristine();
      $scope.btnDisabled = true;

      var promise = $http.post(
        ENV.apiEndpoint + '/auth/signin',
        {
          email: angular.lowercase($scope.email),
          password: $scope.password,
        },
        {
          ignoreLoadingBar: true
        }
      );
      // .then(function(response) {
      //   return response;
      // });

      promise.then(
        function(response) {
          $timeout(function() {
            $scope.singinBtnText = 'Successfully logged in';
          }, 300);

          $timeout(function() {
            $auth.setToken(response.data.token);
            $rootScope.user = response.data.user;

            $state.go(go);

            $timeout(function() {
              growl.success("Logged in");
            }, 750);
          }, 1500);
        },
        function(response) {
          if (typeof response.data.message != 'undefined') {
            growl.warning(response.data.message);
            $scope.btnDisabled = false;
            $scope.email = '';
            $scope.password = '';

            formFactory.enableElements();
            formFactory.clearElements();
            formFactory.focusElement();
          }
        }
      );

      return promise;
    };


    $scope.singinBtnText = 'Send';
    $scope.email = "imagenes43@gmail.com";
    $scope.password = "lsjE55::::3:fsfsx";
  }
})

;