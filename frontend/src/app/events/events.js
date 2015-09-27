angular.module( 'ngBoilerplate.events', [])

.config(function config( $stateProvider ) {
  $stateProvider.state('events', {
    abstract: true,
    url: "/events",
    views: {
      "main": {
        templateUrl: "events/events.tpl.html",
      }
    },
    resolve: {
      authenticated: function(authenticate){
        return authenticate.islogged();
      },
    }
  })
    .state('events.types', {
      url: "^/events",
      templateUrl: "events/events.types.tpl.html",
      controller: "TypesCtrl",
      resolve: {
        types: function(authenticated, xEventType){
          if (authenticated) {
            return xEventType.query().$promise;
          }
        }
      }
    })

    .state('events.type', {
      url: "^/events/:slug",
      templateUrl: "events/events.type.tpl.html",
      controller: 'typeCtrl',
      resolve: {
        type: function(authenticated, $stateParams, xEventType){
          if (authenticated && $stateParams.slug !== '') {
            return xEventType.getType({slug: $stateParams.slug });
          }
        }
      }
    })

    .state('events.event', {
      url: "^/events/:typeSlug/:eventID/:eventSlug",
      templateUrl: "events/events.event.tpl.html",
      controller: 'eventCtrl',
      resolve: {
        xevent: function(authenticated, $stateParams, xEvent){
          if (authenticated && $stateParams.typeSlug !== '' && $stateParams.eventID !== '' && $stateParams.eventSlug !== '') {
            return xEvent.get({typeslug: $stateParams.typeSlug, eventid: $stateParams.eventID, eventslug: $stateParams.eventSlug});
          }
        }
      }
    });
})

.controller( 'TypesCtrl', function TypesCtrl($scope, types) {
  $scope.types = types;
})


.controller('typeCtrl', function categoryCtrl($scope, $state, $stateParams, type, growl) {
  if ($stateParams.slug === '' ) {
    $state.go('events.types');
  } else {
    type.$promise.then(function (response) {
      $scope.type = response;
    },function (response) {
      growl.error('type not found');
      $state.go('events.types');
    });
  }
})


.controller('eventCtrl', function eventCtrl($scope, $state, $stateParams, xevent, growl) {
  if ($stateParams.typeSlug === '') {
    $state.go('events.type');
  } else {
    if ($stateParams.eventID === '' || $stateParams.eventSlug === '') {
      $state.go('events.type', { slug: $stateParams.typeSlug });
    } else {
      xevent.$promise.then(function (response) {
        $scope.type = response;
        $scope.xevent = response.events[0];
      },function (response) {
        growl.error(response.data.message);
        if (response.data.message === 'type not found') {
          $state.go('events.type');
        } else {
          $state.go('events.type', { slug: $stateParams.typeSlug });
        }
      });
    }
  }
})


.factory('xEventType', function(ENV, $resource) {
  var eventEndpoint = ENV.apiEndpoint + '/api/event-types';

  return $resource(eventEndpoint,
    {},
    {
      getType: {
        method: 'GET',
        url: eventEndpoint + '/:slug',
      }
    }
  );
})


.factory('xEvent', function(ENV, $resource) {
  var eventEndpoint = ENV.apiEndpoint + '/api/event/:id';

  return $resource(eventEndpoint,
    { id: '@id' },
    {
      get: {
        method: 'GET',
        url: eventEndpoint + '/:typeslug/:eventid/:eventslug'
      }
    }
  );
})


;