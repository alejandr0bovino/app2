angular.module( 'ngBoilerplate.user.formUsable', [

])

.directive('formUsable', function($timeout) {
  return {
    restrict : "A",
    link : function(scope, element, attrs) {
      var submitBtn = element[0].querySelector('.js-form-submit'),
          // blurElements = angular.element(element[0].querySelectorAll('.js-form-blur'));
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

        // $timeout(function(){
        forEach(blurElements, function (index, element) {
          // angular.element(element).attr('disabled', true);
          element.blur();
          element.disabled = true;
        });
        // }, 100);

        submitBtn.blur();
      }

      submitBtn.addEventListener("click", submitBtnClick);
    }
  };

});