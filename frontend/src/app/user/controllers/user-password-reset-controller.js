angular.module( 'ngBoilerplate.user.PasswordResetCtrl', [
])

.controller( 'PasswordResetBeginCtrl', function PasswordResetBeginCtrl(ENV, $state, $scope, $timeout, User, authenticated, growl, formFactory) {
  if (authenticated) {
    $state.go('user.profile');
  } else {
    $scope.passwordResetSend = function(){
      var reset = User.resetPasswordPost({
        email: $scope.email,
        url: ENV.baseUrl + '/' + $state.href('user.password_reset.choose')
      });

      var promise = reset.$promise;

      promise.then(
        function(response) {
          $timeout(function(){
            $state.go('user.password_reset.email_sent', {sent: true});
          }, 1500);
        },
        function(response) {
          if (typeof response.data.message != 'undefined') {
            growl.warning(response.data.message, {
              ttl: 10000
            });
            formFactory.enableElements($scope);
          }
        }
      );

      return promise;
    };
  }
})

.controller( 'PasswordResetEmailSentCtrl', function PasswordResetBeginCtrl(ENV, $stateParams, $state, $scope, User, authenticated, growl) {
  if (authenticated) {
    $state.go('user.profile');
  } else {
    if ($stateParams.sent === null) {
      $state.go('home');
    } else {
      $stateParams.sent = null;
    }
  }
})

.controller( 'PasswordResetChooseCtrl', function PasswordResetChooseCtrl($stateParams, $state, $scope, $timeout, User, growl, authenticated, $auth) {
  if (authenticated) {
    $auth.logout();
  }

  if ($stateParams.token === null || $stateParams.token === '') {
    $state.go('home');
  }

  $scope.passwordResetChoose = function(){
     var reset = User.resetPasswordPut({
        token: $stateParams.token,
        newPassword: $scope.newPassword
      });

      var promise = reset.$promise;

      promise.then(
        function(response) {
          $timeout(function() {
            $state.go('user.signin');

            $timeout(function() {
              growl.success("Password reset successfully, yo can login now.");
            }, 750);
          }, 1500);
        },
        function(response) {
          $scope.newPassword = '';
          $scope.confirmPassword = '';
          $scope.passwordResetChooseForm.$setPristine();
          if (response.data.message == 'Token has expired') {
            growl.error('Reset password token has expired,<br> please <a href="' + $state.href('user.password_reset.begin') + '">request a new one</a>.');
          } else {
            growl.error(response.data.message);
          }
        }
      );

      return promise;
  };
})

;