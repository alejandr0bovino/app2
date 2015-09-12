angular.module( 'ngBoilerplate.user.usernameAvailable', [

])

.directive('usernameAvailable', function(User, $timeout) {
  return {
    require: 'ngModel',
    link: function(scope, elem, attr, ctrl) {
      ctrl.$parsers.push(function(viewValue) {
        ctrl.$setValidity('usernameAvailable', true);

        if(ctrl.$valid) {
          ctrl.$setValidity('checkingUsername', false);

          if(viewValue !== "" && typeof viewValue !== "undefined") {
            User.usernameAvailable({
              username: viewValue
            }, function(data) {
              if (data.exists) {
                ctrl.$setValidity('usernameAvailable', false);
                ctrl.$setValidity('checkingUsername', true);
              } else {
                ctrl.$setValidity('usernameAvailable', true);
                ctrl.$setValidity('checkingUsername', true);
              }
            }, function(error){
            });

          } else {
            ctrl.$setValidity('usernameAvailable', false);
            ctrl.$setValidity('checkingUsername', true);
          }
        }

        return viewValue;
      });
    }
  };
})

;
