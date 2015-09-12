angular.module( 'ngBoilerplate.user.passwordStrength', [

])

.directive('passwordStrength', [
  function() {
    return {
      require: 'ngModel',
      restrict: 'E',
      scope: {
        password: '=ngModel'
      },

      link: function(scope, elem, attrs, ctrl) {
        scope.$watch('password', function(newVal) {
          scope.strength = isSatisfied(newVal && newVal.length >= 8) +
            isSatisfied(newVal && /(?=.*[a-z])/.test(newVal)) +
            isSatisfied(newVal && /(?=.*[A-Z])/.test(newVal)) +
            isSatisfied(newVal && /(?=.*\W)/.test(newVal)) +
            isSatisfied(newVal && /\d/.test(newVal));

          scope.rule1Satisfied = isSatisfied(newVal && newVal.length >= 8);
          scope.rule2Satisfied = isSatisfied(newVal && /\d/.test(newVal));
          scope.rule3Satisfied = isSatisfied(newVal && /(?=.*[a-z])/.test(newVal));
          scope.rule4Satisfied = isSatisfied(newVal && /(?=.*[A-Z])/.test(newVal));
          scope.rule5Satisfied = isSatisfied(newVal && /(?=.*\W)/.test(newVal));

          function isSatisfied(criteria) {
            return criteria ? 1 : 0;
          }
        }, true);
      },


      // template: '<div id="password-strength-legend" class="help-block col-md-9">' +
      template: "<div class='password-strength__help-block help-block'>" +
          "<span ng-class='{\"is-valid\": rule1Satisfied}'><span>8 characters min</span> <i class='fa fa-check'></i>,</span> "+
          "<span ng-class='{\"is-valid\": rule2Satisfied}'><span>one digit</span> <i class='fa fa-check'></i>,</span> "+
          "<span ng-class='{\"is-valid\": rule3Satisfied}'><span>one lowercase letter</span> <i class='fa fa-check'></i>,</span> "+
          "<span ng-class='{\"is-valid\": rule4Satisfied}'><span>one uppercase letter</span> <i class='fa fa-check'></i>,</span> "+
          "<span ng-class='{\"is-valid\": rule5Satisfied}'><span>and one symbol</span> <i class='fa fa-check'></i>.</span>"+
        "</div>" +
        "<div class='password-strength__progress'><div class='progress'>" +
          "<div class='progress-bar progress-bar-1' style='width: {{strength >= 1 ? 20 : 0}}%'></div>" +
          "<div class='progress-bar progress-bar-2' style='width: {{strength >= 2 ? 20 : 0}}%'></div>" +
          "<div class='progress-bar progress-bar-3' style='width: {{strength >= 3 ? 20 : 0}}%'></div>" +
          "<div class='progress-bar progress-bar-4' style='width: {{strength >= 4 ? 20 : 0}}%'></div>" +
          "<div class='progress-bar progress-bar-5' style='width: {{strength >= 5 ? 20 : 0}}%'></div>" +
        "</div></div>"
    };
  }
])

.directive('patternValidator', [
  function() {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function(scope, elem, attrs, ctrl) {
        // var message = document.getElementById('password-strength-legend');
        // var messageElement = angular.element(message);

        ctrl.$parsers.unshift(function(viewValue) {
          // messageElement.addClass('has-error');

          var patt = new RegExp(attrs.patternValidator);
          var isValid = patt.test(viewValue);
          ctrl.$setValidity('passwordPattern', isValid);
          // if (isValid) {
          //   messageElement.removeClass('has-error');
          // }
          return viewValue;
        });
      }
    };
  }
])

;
