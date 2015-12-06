angular.module( 'ngBoilerplate.user.form', [])

.directive('formUsable', function($timeout, formFactory) {
  return {
    restrict : "A",
    link : function(scope, element, attrs) {
      var submitBtn = element[0].querySelector('.js-form-submit');

      element.bind("keydown", function (event) {
        if(event.which === 13) {
          submitBtn.click();
          event.preventDefault();
        }
      });

      submitBtn.addEventListener("click", function(){
        formFactory.disableElements();
        // submitBtn.blur();
        // this.blur();
      });
    }
  };
})

.factory('formFactory', function($timeout) {
  var blurElements = document.querySelectorAll('.js-form-blur');

  return {
    enableElements: function () {
      for (var i = 0; i < blurElements.length; i++) {
        blurElements[i].disabled = false;
      }
    },
    disableElements: function () {
      for (var i = 0; i < blurElements.length; i++) {
        blurElements[i].disabled = true;
      }
    },
    clearElements: function () {
      for (var i = 0; i < blurElements.length; i++) {
        blurElements[i].value = '';
      }
    },
    focusElement: function (element) {
      element = element ? document.querySelector('input[name="'+element+'"]') : document.querySelector('.js-form-blur');
      element.focus();
    }
  };
})
;