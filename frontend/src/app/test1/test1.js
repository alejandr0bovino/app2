angular.module( 'ngBoilerplate.test1', [
  // 'ui.router',
])

.config(function config( $stateProvider ) {
  $stateProvider.state('test1', {
    abstract: true,
    url: "/test1",
    views: {
      "main": {
        templateUrl: "test1/test1.tpl.html",
        // controller: "TypesCtrl"
      }
    },
    resolve: {
      authenticated: function(authenticate){
        return authenticate.islogged();
      },
      // types: function(authenticated, xEventType){
      //   if (authenticated) {
      //     return xEventType.query().$promise;
      //   }
      // }
    }
  })
    .state('test1.types', {
      url: "^/test1",
      templateUrl: "test1/test1.types.tpl.html",
      controller: "TypesCtrl",
      resolve: {
        // authenticated: function(authenticate){
        //   return authenticate.islogged();
        // },
        types: function(authenticated, xEventType){
          if (authenticated) {
            return xEventType.query().$promise;
          }
        }
      }
    })

    .state('test1.type', {
      url: "^/test1/:slug",
      templateUrl: "test1/test1.type.tpl.html",
      controller: 'typeCtrl',
      resolve: {
        type: function(authenticated, $stateParams, xEventType){
          if (authenticated && $stateParams.slug !== '') {

            return xEventType.getType({slug: $stateParams.slug });
          }
        }
      }
    })

    .state('test1.event', {
      url: "^/test1/:typeSlug/:eventID/:eventSlug",
      templateUrl: "test1/test1.event.tpl.html",
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

.controller( 'TypesCtrl', function TypesCtrl( $rootScope, $scope, $http, Upload, growl , ENV, types) {
  $scope.types = types;
})


.controller('typeCtrl', function categoryCtrl($scope, $state, $stateParams, type) {
  if ($stateParams.slug === '' ) {
    $state.go('test1.types');
  } else {
    type.$promise.then(function (response) {
      $scope.type = response;
    },function (response) {
      $state.go('test1.types');
    });
  }
})


.controller('eventCtrl', function eventCtrl($scope, $state, $stateParams, xevent, growl) {
  if ($stateParams.typeSlug === '') {
    $state.go('test1.type');
  } else {
    if ($stateParams.eventID === '' || $stateParams.eventSlug === '') {
      $state.go('test1.type', { slug: $stateParams.typeSlug });
    } else {
      xevent.$promise.then(function (response) {
        // $scope.xevent = response;
        $scope.type = response;
        $scope.xevent = response.events[0];
      },function (response) {
        growl.error(response.data.message);
        if (response.data.message === 'type not found') {
          $state.go('test1.type');
        } else {
          $state.go('test1.type', { slug: $stateParams.typeSlug });
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
        // params: { slug: '@slug' },
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
        // params: { typeslug: '@typeslug' },
        url: eventEndpoint + '/:typeslug/:eventid/:eventslug'
      }
    }

  );

})


;