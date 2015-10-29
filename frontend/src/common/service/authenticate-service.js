angular.module('ngBoilerplate.authenticate.service', [

])

.factory("authenticate", function($auth){
  return {
    islogged: function(){
      var islogged = false;

      if ($auth.isAuthenticated()) {
        islogged = true;
      }

      return islogged;      
    }
  };
})

;