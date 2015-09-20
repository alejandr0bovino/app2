angular.module( 'ngBoilerplate.user.SignupCtrl', [

])

.controller( 'SignupCtrl', function SignupCtrl(ENV, $rootScope, $timeout, $scope, $http, $auth, $state, User, growl, resA ) {
  if (resA) {
    $state.go('user.profile');
  } else {
    $scope.signupEnter = function() {
      document.getElementById('signupSubmit').click();
    };

    $scope.signup = function() {
      //   $auth.signup({
      //     email: angular.lowercase($scope.email),
      //     userName: $scope.userName,
      //     password: $scope.password,
      //     name: $scope.name,
      //   })
      //   .then(function(response) {
      //     var lEmail = angular.lowercase($scope.email);

      //     User.confirmRegistrationPost({
      //       email: lEmail,
      //       url: ENV.baseUrl + $state.href('user.verified')
      //     }, function(response) {
      //       growl.success('Signed up: <b>' + $scope.email + '</b>');
      //       $state.go('user.confirm', {email: lEmail});
      //     }, function(response) {
      //       if (typeof response.data.message != 'undefined') {
      //         growl.warning(response.data.message);
      //       }
      //     });

      //   })
      //   .catch(function(response) {
      //     if (typeof response.data.message != 'undefined') {
      //       growl.error(response.data.message);
      //     }
      //   });



      // var signup = $auth.signup({
      //   email: angular.lowercase($scope.email),
      //   userName: $scope.userName,
      //   password: $scope.password,
      //   name: $scope.name,
      // });
      document.querySelector('.js-btn-unfocus').blur();
      $scope.signupForm.$setPristine();
      $scope.btnDisabled = true;

      var promise = $http.post(
        ENV.apiEndpoint + '/auth/signup',
        {
          email: angular.lowercase($scope.email),
          userName: $scope.userName,
          password: $scope.password,
          name: $scope.name,
        },
        {
          ignoreLoadingBar: true
        }
      )
      .then(function(response) {
        return response;
      });


      promise.then(
        function(response) {
          $timeout(function() {
            $scope.singupBtnText = 'Successfully signed up';
          }, 100);

          var lEmail = angular.lowercase($scope.email);

          User.confirmRegistrationPost({
            email: lEmail,
            url: ENV.baseUrl + $state.href('user.verified')
          }, function(response) {

            $timeout(function() {
              $state.go('user.confirm', {email: lEmail});

              $timeout(function() {
                growl.success('Signed up: <b>' + $scope.email + '</b>');
              }, 750);
            }, 1500);


          }, function(response) {
            if (typeof response.data.message != 'undefined') {
              growl.warning(response.data.message);
            }
          });
        },
        function(response) {
          if (typeof response.data.message != 'undefined') {
            growl.warning(response.data.message, {
              // ttl: 10000
            });
            $scope.btnDisabled = false;
            $scope.email = '';
          }
        }
      );

      return promise;
    };

    $scope.name = "imagenes";
    $scope.email = "imagenes43@gmail.com";
    $scope.userName = "imagenes43";
    $scope.password = "lsjE55::::3:fsfsx";
    $scope.confirmPassword = "lsjE55::::3:fsfsx";
    $scope.singupBtnText = 'Send';

  }
})

;