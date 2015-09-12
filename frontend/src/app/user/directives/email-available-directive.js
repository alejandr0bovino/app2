angular.module( 'ngBoilerplate.user.emailAvailable', [

])

.directive('emailAvailable', function(User, $timeout) {
  return {
    require: 'ngModel',
    link: function(scope, elem, attr, ctrl) {
      ctrl.$parsers.push(function(viewValue) {
        ctrl.$setValidity('emailAvailable', true);

        if(ctrl.$valid) {
          ctrl.$setValidity('checkingEmail', false);

          if(viewValue !== "" && typeof viewValue !== "undefined") {

            User.emailAvailable({
              email: viewValue
            }, function(data) {
              if (data.exists) {
                ctrl.$setValidity('emailAvailable', false);
                ctrl.$setValidity('checkingEmail', true);
              } else {
                ctrl.$setValidity('emailAvailable', true);
                ctrl.$setValidity('checkingEmail', true);
              }
            }, function(error){
            });

          } else {
            ctrl.$setValidity('emailAvailable', false);
            ctrl.$setValidity('checkingEmail', true);
          }
        }

        return viewValue;
      });

    }
  };
})


.directive('emailCheck', function(User, $timeout) {
  return {
    require: 'ngModel',
    link: function(scope, elem, attr, ctrl) {
      ctrl.$parsers.push(function(viewValue) {
        ctrl.$setValidity('emailCheck', true);

        if(ctrl.$valid) {
          if(viewValue !== "" && typeof viewValue !== "undefined") {

            User.emailAvailable({
              email: viewValue
            }, function(data) {
              if (data.exists) {
                ctrl.$setValidity('emailCheck', true);
              } else {
                ctrl.$setValidity('emailCheck', false);
              }
            }, function(error){
            });

          } else {
            ctrl.$setValidity('emailCheck', false);
          }
        }

        return viewValue;
      });

    }
  };
})


;
