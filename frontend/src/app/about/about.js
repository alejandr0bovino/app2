angular.module( 'ngBoilerplate.about', [
  'ui.router'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'about', {
    url: '/about',
    views: {
      "main": {
        controller: 'AboutCtrl',
        templateUrl: 'about/about.tpl.html'
      }
    },
    data:{
      // pageClass: 'about',
      pageTitle: 'About',
      headerTitle: 'The Elevator <small>For the impatient</small>',
      headerSubtitle: 'This example is a quick exercise to illustrate how the default'
    }
  });
})

.controller( 'AboutCtrl', function AboutCtrl( $scope ) {

})

;
