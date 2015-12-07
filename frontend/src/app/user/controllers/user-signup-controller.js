angular.module( 'ngBoilerplate.user.SignupCtrl', [

])

.controller( 'SignupCtrl', function SignupCtrl(ENV, $rootScope, $timeout, $scope, $http, $auth, $state, User, growl, authenticated ) {
  if (authenticated) {
    $state.go('user.profile');
  } else {
    $scope.signup = function() {
      $scope.signupForm.$setPristine();
      // $scope.btnDisabled = true;

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
      );
      // .then(function(response) {
      //   return response;
      // });


      promise.then(
        function(response) {
          $timeout(function() {
            $scope.singupBtnText = 'Successfully signed up';
          }, 300);

          var lEmail = angular.lowercase($scope.email);

          User.confirmRegistrationPost(
            {
              email: lEmail,
              url: ENV.baseUrl + $state.href('user.verified')
            },
            function(response) {
              $timeout(function() {
                $state.go('user.confirm', {email: lEmail});

                $timeout(function() {
                  growl.success('Signed up: <b>' + $scope.email + '</b>');
                }, 750);
              }, 1500);
            },
            function(response) {
              if (typeof response.data.message != 'undefined') {
                growl.warning(response.data.message);
              }
            }
          );
        },
        function(response) {
          if (typeof response.data.message != 'undefined') {
            growl.warning(response.data.message);
            $scope.email = '';

            $scope.inputDisabled = false;
            $timeout(function(){
              document.querySelector('input[name="email"]').focus();
            }, 10);
            
          }
        }
      );

      return promise;
    };

    $scope.singupBtnText = 'Send';

    $scope.name = "imagenes";
    $scope.email = "imagenes43@gmail.com";
    $scope.userName = "imagenes44";
    $scope.password = "lsjE55::::3:fsfsx";
    $scope.confirmPassword = "lsjE55::::3:fsfsx";

    $timeout(function(){
      $scope.signupForm.$invalid = false;
      $scope.signupForm.$pristine = false;
    },10);
    
  }
})

;