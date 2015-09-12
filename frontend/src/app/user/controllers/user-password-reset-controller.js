angular.module( 'ngBoilerplate.user.PasswordResetCtrl', [

])

.controller( 'PasswordResetBeginCtrl', function PasswordResetBeginCtrl(ENV, $stateParams, $state, $scope, $timeout, User, resA, growl) {
  if (resA) {
    $state.go('user.profile');
  } else {
    // $scope.email_sent = false;
    $scope.passwordResetSendEnter = function() {
      document.getElementById('passwordResetSendSubmit').click();
    };
    $scope.passwordResetSend = function(){

      document.querySelector('.js-btn-unfocus').blur();

      // User.resetPasswordPost({
      //   email: $scope.email,
      //   url: ENV.baseUrl + '/' + $state.href('user.password_reset.choose')
      // }, function(response) {
      //   $state.go('user.password_reset.email_sent', {sent: true});
      // }, function(response){
      //   if (typeof response.data.message != 'undefined') {
      //     growl.warning(response.data.message, {
      //       ttl: 10000
      //     });
      //   }
      // });


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
          }
        }
      );

      return promise;

    };

    $scope.resetpasswordResetSendForm = function(){
      document.querySelector('input[name="email"]').blur();
      // document.querySelector('button[type="submit"]').focus();
    };

  }
})


.controller( 'PasswordResetEmailSentCtrl', function PasswordResetBeginCtrl(ENV, $stateParams, $state, $scope, User, resA, growl) {
  if (resA) {
    $state.go('user.profile');
  } else {
    if ($stateParams.sent === null) {
      $state.go('home');
    } else {
      $stateParams.sent = null;
    }
  }

})



.controller( 'PasswordResetChooseCtrl', function PasswordResetChooseCtrl($stateParams, $state, $scope, $timeout, User, growl, resA, $auth) {
  if (resA) {
    $auth.logout();
  }

  if ($stateParams.token === null || $stateParams.token === '') {
    $state.go('home');
  }
  // $scope.inputType = 'password';

  $scope.passwordResetChooseEnter = function() {
    document.getElementById('passwordResetChooseSubmit').click();
  };

  $scope.passwordResetChoose = function(){
    // User.resetPasswordPut({
    //   token: $stateParams.token,
    //   newPassword: $scope.newPassword
    // }, function(response) {
    //   growl.success("Password reset successfully, yo can login now.");
    //   $state.go('user.login');
    // }, function(response){
    //   if (typeof response.data.message != 'undefined') {
    //     if (response.data.message == 'Token has expired') {
    //       $scope.newPassword = '';
    //       $scope.confirmPassword = '';
    //       $scope.passwordResetChooseForm.$setPristine();
    //       growl.error('Reset password token has expired,<br> please <a href="' + $state.href('user.password_reset.begin') + '">request a new one</a>.');
    //     } else {
    //       growl.error(response.data.message);
    //     }
    //   }
    // });
      document.querySelector('.js-btn-unfocus').blur();
    // $scope.btnDisabled = true;
    // $scope.passwordResetChooseForm.$setPristine();

     var reset = User.resetPasswordPut({
        token: $stateParams.token,
        newPassword: $scope.newPassword
      });

      var promise = reset.$promise;

      promise.then(
        function(response) {
          $timeout(function() {
            $state.go('user.login');

            $timeout(function() {
              growl.success("Password reset successfully, yo can login now.");
            }, 750);
          }, 2000);
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