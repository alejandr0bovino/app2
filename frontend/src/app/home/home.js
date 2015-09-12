
angular.module( 'ngBoilerplate.home', [
  'ui.router'
])


.config(function config( $stateProvider ) {
  $stateProvider.state( 'home', {
    url: '/',
    views: {
      "main": {
        //controller: 'HomeCtrl',
        templateUrl: 'home/home.tpl.html'
      }
    },
    // data:{
      // pageClass: 'home',
      // pageTitle: '',
      // headerTitle: 'This example is a quick exercise to illustrate how',
      // headerSubtitle: 'This example is a quick exercise to illustrate how the default, static and fixed to top,'
    // }
  });
})

/**
 * And of course we define a controller for our route.
 */
// .controller( 'HomeCtrl', function HomeController( $scope, $sce ) {

// })

;

