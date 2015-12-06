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
      headerTitle: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. <small>Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s</small>',
      headerSubtitle: 'This example is a quick exercise to illustrate how the default'
    }
  });
})

.controller( 'AboutCtrl', function AboutCtrl( $scope ) {

})

;
