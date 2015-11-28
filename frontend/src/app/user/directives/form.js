angular.module( 'ngBoilerplate.user.form', [])

.directive('formUsable', function($timeout) {
  return {
    restrict : "A",
    link : function(scope, element, attrs) {
      var submitBtn = element[0].querySelector('.js-form-submit'),
          blurElements = element[0].querySelectorAll('.js-form-blur');

      element.bind("keydown", function (event) {
        if(event.which === 13) {
          submitBtn.click();
          event.preventDefault();
        }
      });

      submitBtn.addEventListener("click", function(){
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
      });
    }
  };
})

.factory('formFactory', function($timeout) {
  var forEach = function (array, callback, scope) {
    for (var i = 0; i < array.length; i++) {
      callback.call(scope, i, array[i]);
    }
  };

  return {
    enableElements: function () {
      var blurElements = document.querySelectorAll('.js-form-blur');



      forEach(blurElements, function (index, element) {
        angular.element(element).attr('disabled', false);
      });
    },
    clearElements: function () {
      var blurElements = document.querySelectorAll('.js-form-blur');


      forEach(blurElements, function (index, element) {
        element.value = '';
      });
    },
    focusElement: function (element) {
      element = element ? document.querySelector('input[name="'+element+'"]') : document.querySelector('.js-form-blur');
      element.focus();
    }
  };
})
;