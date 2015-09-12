(function () {
    "use strict";
    deferredBootstrapper.bootstrap({
      element: document.body,
      module: 'myApp',
      injectorModules: ['config', 'satellizer'],
      resolve: {
        USER: ['ENV', '$http', '$auth', '$q', '$rootScope', function (ENV, $http, $auth, $q) {
          if ($auth.isAuthenticated()) {
            return $http.get(ENV.apiEndpoint + '/api/user');
          } else {
            return $q.when(null);
          }
        }],
        LAYOUT: ['$http', function ($http) {
          return $http.get('./layout.html');
        }]
      }
    });

    angular.module('myApp', ['config', 'satellizer', 'ng-admin'])
      .controller( 'LoginCtrl', function LoginCtrl($scope, $location, $auth, resA) {
          if (resA !== null && resA.role === 'Admin') {
            $location.path('dashboard');
          } else {
              $scope.login = function() {
                $auth.login({ email: $scope.email, password: $scope.password })
                  .then(function() {
                      $location.path('dashboard');
                  })
                  .catch(function(response) {
                    $scope.password = '';
                  });
              };
          }
      })

      .controller( 'LogoutCtrl', function LogoutCtrl( $auth, $location ) {
        $auth.logout()
          .then(function() {
            $location.path('login');
          });

      })

      .run(['$rootScope', 'Restangular', '$location', '$auth', 'USER',
        function($rootScope, Restangular, $location, $auth, USER){

        Restangular.setErrorInterceptor(function(response, deferred, responseHandler) {
          if(response.status === 401){
              $location.path('login');
              return false;
          }
        });

        $rootScope.$on("$locationChangeStart", function (event, next, current) {
          if ( !$auth.isAuthenticated() || (USER !== null && USER.role !== "Admin") ) {
            $location.path('login');
          }
        });
      }])


      // .config(function (ENV, NgAdminConfigurationProvider, $stateProvider, $urlRouterProvider, $authProvider,
      //   Application, Entity, Field, Reference, ReferencedList, ReferenceMany, RestangularProvider, LAYOUT) {
      .config(function (ENV, NgAdminConfigurationProvider, $stateProvider, $urlRouterProvider, $authProvider, RestangularProvider, LAYOUT) {

        $urlRouterProvider.otherwise('dashboard');
        $authProvider.loginUrl  = ENV.apiEndpoint + '/auth/admin-login';

        $stateProvider
          .state('login', {
              url: '/login',
              resolve: {
                resA: function(USER) {
                  return USER;
                }
              },
              templateUrl: '_login.html',
              controller: 'LoginCtrl'
          })
          .state('logout', {
            url: '/log-out',
            controller: 'LogoutCtrl',
            templateUrl:  null
          });

        function truncate(value) {
          if (!value) {
              return '';
          }

          return value.length > 50 ? value.substr(0, 50) + '...' : value;
        }

        RestangularProvider.addFullRequestInterceptor(function(element, operation, what, url, headers, params) {
          if (operation == "getList") {
              // custom pagination params
              params._start = (params._page - 1) * params._perPage;
              params._end = params._page * params._perPage;
              delete params._page;
              delete params._perPage;
              // custom sort params
              if (params._sortField) {
                  params._sort = params._sortField;
                  delete params._sortField;
              }
              // custom filters
              if (params._filters) {
                  for (var filter in params._filters) {
                      params[filter] = params._filters[filter];
                  }
                  delete params._filters;
              }
          }
          return { params: params };
        });

        // var app = new Application('ng-admin backend demo')
        //   .baseApiUrl(ENV.apiEndpoint + '/admin/')
        //   .layout(LAYOUT);
        // var user = new Entity('users').identifier(new Field('_id'));

        RestangularProvider.addElementTransformer('users', function(element) {
          // console.log(element)
          // console.log(element)
          for (var key in element.profile) {
            element[key] = element.profile[key];
          }

          return element;
        });


        var nga = NgAdminConfigurationProvider;
        var app = nga.application('ng-admin backend demo')
                    .baseApiUrl(ENV.apiEndpoint + '/admin/')
                    .layout(LAYOUT);
        var user = nga.entity('users').identifier(nga.field('_id'));




        app
          .addEntity(user);

        // customize entities and views

        user.menuView()
          .icon('<span class="glyphicon glyphicon-file"></span>'); // customize the entity menu icon

        user.dashboardView() // customize the dashboard panel for this entity
          .title('Recent users')
          .order(1) // display the user panel first in the dashboard
          .limit(5) // limit the panel to the 5 latest users
          // .fields([new Field('profile').type('json').label('Username').isDetailLink(true).map(truncate)])
          .fields([
            // nga.field('profile', 'json'),
            nga.field('name').isDetailLink(true),
            nga.field('userName').isDetailLink(true),
            nga.field('email', 'email').map(truncate).isDetailLink(true)
          ]);

        user.listView()
          .title('All users') // default title is "[Entity_name] list"
          .description('List of users with infinite pagination') // description appears under the title
          .infinitePagination(true) // load pages as the user scrolls
          .fields([
              // new Field('_id').label('ID'),
              // new Field('userName').label('Username'),
              // new Field('profile.name').label('Full name'),

              nga.field('_id'),
              nga.field('email', 'email'),
              nga.field('userName'),

          ])
          .listActions(['show', 'edit', 'delete']);



        user.creationView()
          .fields([
            // new Field('title') // the default edit field type is "string", and displays as a text input
            //     .attributes({ placeholder: 'the user title' }) // you can add custom attributes, too
            //     .validation({ required: true, minlength: 3, maxlength: 100 }), // add validation rules for fields
            // new Field('teaser').type('text'), // text field type translates to a textarea
            // new Field('body').type('wysiwyg'), // overriding the type allows rich text editing for the body
            // new Field('published_at').type('date') // Date field type translates to a datepicker
            // new Field('email').type('email'),
            // new Field('userName').type('text'),
            // new Field('displayName').type('text'),

            nga.field('email', 'email'),
            nga.field('userName'),
            nga.field('profile', 'json').label('Profile'),
          ]);

        user.editionView()
          .title('Edit user "{{ entry.values.userName }}"') // title() accepts a template string, which has access to the entry
          .actions(['list', 'show', 'delete']) // choose which buttons appear in the top action bar. Show is disabled by default
          .fields([
            user.creationView().fields(), // fields() without arguments returns the list of fields. That way you can reuse fields from another view to avoid repetition

            // new Field('views')
            //     .type('number')
            //     .cssClasses('col-sm-4'),

          ]);

        user.showView() // a showView displays one entry in full page - allows to display more data than in a a list
          .fields([
            // new Field('userName'),
            // new Field('displayName'),
            user.editionView().fields(), // reuse fields from another view in another order
            // new Field('custom_action')
            //     .type('template')
            //     .template('<other-page-link></other-link-link>')
          ]);


        NgAdminConfigurationProvider.configure(app);
    });
}());