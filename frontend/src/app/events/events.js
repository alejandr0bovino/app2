angular.module( 'ngBoilerplate.events', [
  'ui.router',
  'ui.bootstrap'
])



.config(
  ['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider
      .when('/c?id', '/events/:id');

    $stateProvider
      .state('events', {
        abstract: true,
        url: '/events',
        resolve: {
          authenticated: function(authenticate){
            return authenticate.islogged();
          },
          types: function(authenticated, Event){
            if (authenticated) {
              return Event.getTypes();
            }
          }
        },
        views: {
          "main": {
            controller: 'EventsCtrl',
            templateUrl: 'events/events.tpl.html'
          }
        },
        data:{
          pageTitle: 'Events',
          // headerTitle: 'examples',
          headerSubtitle: 'example'
        }
      })

      // List

      .state('events.list', {
        url: '',
        templateUrl: 'events/events.list.tpl.html'
      })

      // Detail

      .state('events.detail', {
        url: '/{eventID}',
        resolve: {
          event: function(Event, $stateParams){
            return Event.get({id: $stateParams.eventID});
          }
        },
        views: {
          '': {
            templateUrl: 'events/events.detail.tpl.html',
            controller: 'EventsCtrlDetail'
          }
        },
        data:{
          pageTitle: 'Event',
          headerTitle: 'Event',
        }
      });


}])

.controller( 'EventsCtrl', function EventsCtrl( $scope, types ) {
  if (types) {
    types.$promise.then(function(types) {
      $scope.types = types;
    });
  }
})

.controller( 'EventsCtrlDetail', function EventsCtrl( $scope, event ) {
  if (event) {
    event.$promise.then(function(event) {
      $scope.event = event;
    });
  }
})

.factory('Event', function(ENV, $resource) {
  var eventEndpoint = ENV.apiEndpoint + '/api/event/:id';

  return $resource(eventEndpoint,
    { id: '@id' },
    {
      getTypes: {
        method: 'GET',
        url: eventEndpoint + '/types',
        isArray: true
      }
    }
  );

})







;
