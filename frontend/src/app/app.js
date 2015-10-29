angular.module( 'ngBoilerplate', [
  'config',
  'templates-app',
  'templates-ui',
  'ui.router',
  'ui.bootstrap',
  'ngAnimate',
  // 'ngTouch',
  'ngSanitize',
  'ngResource',
  //
  'angular-loading-bar',
  'uiSwitch',
  'permission',
  'angular-growl',
  'angular-progress-button-styles',
  //
  // 'ngBoilerplate.test1',
  // 'ngBoilerplate.test2',
  'ngBoilerplate.home',
  'ngBoilerplate.about',
  'ngBoilerplate.events',
  'ngBoilerplate.contacts',
  'ngBoilerplate.user',
  //
  'ngBoilerplate.utils.service',
  'ngBoilerplate.authenticate.service',
  'ngBoilerplate.shell.service',
  'ngBoilerplate.user.service',
])

.constant("requireAuth", ['events.types', 'contacts.list'])

.config( function myAppConfig (ENV, $locationProvider, $stateProvider, $urlRouterProvider, $authProvider, growlProvider, cfpLoadingBarProvider) {
  $urlRouterProvider.otherwise('/');

  $urlRouterProvider.rule(function($injector, $location) {
    var path = $location.path();
    var hasTrailingSlash = path[path.length-1] === '/';

    console.log(path);
    console.log(hasTrailingSlash);

    if(hasTrailingSlash) {
      var newPath = path.substr(0, path.length - 1);
      return newPath;
    }
  });

  //////////////
  // cfpLoadingBarProvider.latencyThreshold = 0;

  //////////////
  $authProvider.signupUrl = ENV.apiEndpoint + '/auth/signup';
  $authProvider.loginUrl  = ENV.apiEndpoint + '/auth/login';
  $authProvider.unlinkUrl = ENV.apiEndpoint + '/auth/unlink';
  $authProvider.logoutRedirect = null;
  $authProvider.loginOnSignup = false;
  $authProvider.signupRedirect = false;

  $authProvider.facebook({
    clientId: ENV.facebookClientId,
    url: ENV.apiEndpoint + '/auth/facebook',
  });

  $authProvider.google({
    clientId: ENV.googleClientId,
    url: ENV.apiEndpoint + '/auth/google',
  });

  $authProvider.twitter({
    url: ENV.apiEndpoint + '/auth/twitter',
  });

  $authProvider.github({
    url: ENV.apiEndpoint + '/auth/github',
    clientId: ENV.githubClientId,
    redirectUri: ENV.baseUrl
  });

  ///

  if(window.history && window.history.pushState){
    $locationProvider.html5Mode(true);
  }

  ///

  growlProvider.globalTimeToLive(5000);
  growlProvider.globalDisableCountDown(true);
  growlProvider.globalDisableCloseButton(true);
})

.run(['$rootScope', '$state', '$stateParams', 'Permission', '$q', 'User',  'authenticate', '$auth', 'growl',
  function ($rootScope,   $state,   $stateParams, Permission, $q, User, authenticate, $auth, growl) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    $rootScope.env = 'development';


    ///////

    $rootScope.isAuthenticated = function() {
      return authenticate.islogged();
    };

    if (authenticate.islogged()) {
      User.get(function(data){
        if (!angular.isDefined(data.email)) {
          $auth.logout()
          .then(function() {
            $rootScope.user = null;
            $state.go('home');
          });
        } else {
          $rootScope.user = data;
        }

      }, function(data){
        growl.error("Unable to get information");
      });
    }

    // $rootScope.isLoading = true;

    $rootScope.$on('cfpLoadingBar:loading', function (event, data) {
      $rootScope.isLoading = true;
    });
    $rootScope.$on('cfpLoadingBar:loaded', function (event, data) {
      $rootScope.isLoading = false;
    });

    ///////


    Permission
      .defineRole('Anonymous', function () {
        if (!authenticate.islogged()) {
          return true;
        }
        return false;
      })
      .defineRole('User', function () {
        if (authenticate.islogged()) {
          return true;
        }
        return false;
      })
      .defineRole('Editor', function () {
        var deferred = $q.defer();
         User.get(function (data) {
          if (data.role === 'Editor') {
            deferred.resolve();
          } else {
            deferred.reject();
          }
        }, function () {
          deferred.reject();
        });
        return deferred.promise;
      })
      .defineRole('Admin', function () {
        var deferred = $q.defer();
         User.get(function (data) {
          if (data.role === 'Admin') {
            deferred.resolve();
          } else {
            deferred.reject();
          }
        }, function () {
          deferred.reject();
        });
        return deferred.promise;
      });

    //////
    var storage = localStorage.getItem('isThemeLight');
    $rootScope.isThemeLight = storage === null ? true : (storage === "true" ? true : false);
  }
])

// .controller( 'AppCtrl', function AppCtrl ( $rootScope, $scope, $auth, shell, requireAuth, $document, User, $window, $timeout, $animate) {
.controller( 'AppCtrl', function AppCtrl ( $scope, $auth, shell, requireAuth, $document, $window, $timeout) {
  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){

    if (angular.isDefined( toState.data )) {
    $scope.pageTitle = angular.isDefined( toState.data.pageTitle ) ? toState.data.pageTitle + ' | Test' : 'Test';
    $scope.headerTitle = angular.isDefined( toState.data.headerTitle ) ? toState.data.headerTitle : toState.data.pageTitle;
    $scope.headerSubtitle = angular.isDefined( toState.data.headerSubtitle ) ? toState.data.headerSubtitle : null;
    }



    // $scope.pageTitle = typeof toState.data.pageTitle !== 'undefined' ? toState.data.pageTitle + ' | Test' : 'Test';
    // $scope.headerTitle = typeof toState.data.headerTitle !== 'undefined' ? toState.data.headerTitle : $scope.pageTitle;
    // $scope.headerSubtitle = typeof toState.data.headerSubtitle !== 'undefined' ? toState.data.headerSubtitle : null;


    //

    // if (toState.name == 'user.logout') {
    //   if (fromState.name == 'user.profile' || fromState.name == 'userpage') {
    //     shell.setReferer('home');
    //   } else {
    //     shell.setReferer(fromState.name);
    //   }
    // }
  });

  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    // var currentState = toState.name.split('.', 1);
    var currentState = toState.name;

    if((requireAuth.indexOf(currentState) > -1) && !$auth.isAuthenticated()) {
      // $scope.referer = function () {
      //   shell.setReferer(toState.name);
      // };
      shell.setReferer(toState.name);
    }

    // scroll top on page change
    $timeout(function () {
      $window.scrollTo(0,0);
    }, 10);
  });


  // Switch theme

  $scope.toggleTheme = function() {
    $scope.isThemeLight = !$scope.isThemeLight;
    localStorage.setItem('isThemeLight', $scope.isThemeLight);
  };

  // Sidebar

  $scope.toggleSidebar = function(){
    $scope.isSidebarOpen = !$scope.isSidebarOpen;
  };

  // Menu

  $scope.toggleMenu = function(){
    $scope.isMenuOpen = !$scope.isMenuOpen;
  };


  $scope.xxx = function(){
    if (angular.element($document[0].body).hasClass('sidebar-open')) {
      if (!angular.element(this).hasClass('js-toggle-sidebar') && !angular.element(this).hasClass('js-toggle-theme')) {
        $scope.toggleSidebar();
      }
    }

    if (angular.element($document[0].body).hasClass('menu-open')) {
      if (!angular.element(this).hasClass('js-toggle-menu') && !angular.element(this).hasClass('js-toggle-theme')) {
        $scope.toggleMenu();
      }
    }
  };


  var sideBarLinks = document.querySelectorAll('.theme-sidebar a');
  angular.element(sideBarLinks).on('click', function(event){
    if (angular.element($document[0].body).hasClass('sidebar-open')) {
      if (!angular.element(this).hasClass('js-toggle-sidebar') && !angular.element(this).hasClass('js-toggle-theme')) {
        $scope.toggleSidebar();
      }
    }

    if (angular.element($document[0].body).hasClass('menu-open')) {
      if (!angular.element(this).hasClass('js-toggle-menu') && !angular.element(this).hasClass('js-toggle-theme')) {
        $scope.toggleMenu();
      }
    }
  });
})

.directive('bodyClick', function ($document, $parse) {
  function hasParentClass( e, classname ) {
    if(e === document) {
      return false;
    }
    if( angular.element(e).hasClass(classname ) ) {
      return true;
    }
    return e.parentNode && hasParentClass( e.parentNode, classname );
  }

  var linkFunction = function ($scope, $element, $attributes) {
    var scopeExpression = $attributes.bodyClick;
    var invoker = $parse(scopeExpression);

    $document.on('click', function (event) {
      $scope.$apply(function () {
        invoker($scope, { $event: event });

        // sidebar
        if (angular.element($document[0].body).hasClass('sidebar-open') && !
          hasParentClass(event.target, 'theme-sidebar') && !
          hasParentClass(event.target, 'theme-footer')) {
          $scope.toggleSidebar();
        }

        // if (angular.element($document[0].body).hasClass('menu-open') && !
        //   hasParentClass(event.target, 'theme-sidebar') && !
        //   hasParentClass(event.target, 'theme-footer')) {
        //   $scope.toggleMenu();
        // }
      });
    });

  };

  return linkFunction;
})

.directive('stopEvent', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      element.bind(attr.stopEvent, function (e) {
          e.stopPropagation();
      });
    }
  };
})

;