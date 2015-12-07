angular.module( 'ngBoilerplate.user.form', [])

.directive('formUsable', function() {
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
        scope.inputDisabled = true;
      });
      // scope.inputDisabled = false;
    }
  };
})

// .factory('formFactory', function() {
//   var blurElements = document.querySelectorAll('.js-form-blur');

//   return {
//   };
// })
;