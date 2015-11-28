angular.module( 'ngBoilerplate.user.formUsable', [

])

.directive('formUsable', function($timeout) {
  return {
    restrict : "A",
    link : function(scope, element, attrs) {
      var submitBtn = element[0].querySelector('.js-form-submit'),
          blurElements = document.querySelectorAll('.js-form-blur');

      element.bind("keydown", function (event) {
        if(event.which === 13) {
          // scope.$apply(function (){ // scope.$eval(attrs.form); // });
          submitBtn.click();
          event.preventDefault();
        }
      });

      function submitBtnClick() {
        var forEach = function (array, callback, scope) {
          for (var i = 0; i < array.length; i++) {
            callback.call(scope, i, array[i]);
          }
        };

        forEach(blurElements, function (index, element) {
          element.blur();
          element.disabled = true;
        });

        submitBtn.blur();
      }

      submitBtn.addEventListener("click", submitBtnClick);
    }
  };

});