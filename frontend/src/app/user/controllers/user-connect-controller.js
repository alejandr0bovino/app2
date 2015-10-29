angular.module( 'ngBoilerplate.user.ConnectCtrl', [

])

.controller( 'ConnectCtrl', function ConnectCtrl( $rootScope, $scope, $auth, $state, User, growl, go, resA, $timeout, $filter) {
  $scope.authenticate = function(provider) {

    $auth.authenticate(provider)
      .then(function(response) {
        growl.success('<b>' + $filter('capitalize')(provider) + '</b> account connected.');

        User.get(function(data){
          $rootScope.user = data;
        }, function(data){
          growl.error("Unable to get information");
        });

        if(response.data.connect){
          $state.go('user.update');
        } else {
          $state.go(go);
        }
      })
      .catch(function(response) {
        // if (typeof response.data.message != 'undefined') {
        //   growl.error(response.data.message);
        // }
        growl.error(response.data ? response.data.message : 'Could not connect <b>' + $filter('capitalize')(provider) + '</b> account');
      });
  };

})

.filter('capitalize', function() {
   return function(token) {
      return token.charAt(0).toUpperCase() + token.slice(1);
   };
})

;