angular.module( 'ngBoilerplate.user.ConnectCtrl', [

])

.controller( 'ConnectCtrl', function ConnectCtrl( $rootScope, $scope, $auth, $state, User, growl, go, resA, $timeout) {
  $scope.authenticate = function(provider) {

    $auth.authenticate(provider)
      .then(function(response) {
        growl.success('Connected with:  <b>' + provider + '</b>');

        // User.getUser().success(function(data) {
        //   $rootScope.user = data;
        // });
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
        growl.error(response.data ? response.data.message : 'Could not connect <b>' + provider + '</b> account');
      });
  };

})
;