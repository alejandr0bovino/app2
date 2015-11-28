angular.module('ngBoilerplate.contacts', [
  'ngBoilerplate.contacts.service',
  'ui.router'
])

.config(
  ['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
      $urlRouterProvider
        .when('/c?id', '/contacts/:id');

      $stateProvider
        .state('contacts', {
          abstract: true,
          url: '/contacts',
          views: {
            "main": {
              controller: ['$scope', '$state', 'contacts', 'utils', 'authenticated', 'growl',
                function ( $scope,   $state,   contacts,   utils, authenticated, growl) {
                  if (contacts) {
                    $scope.contacts = contacts;
                    $scope.goToRandom = function () {
                      if (!authenticated) {
                        $scope.pleaseLogin();
                      } else {
                        var randId = utils.newRandomKey($scope.contacts, "id", $state.params.contactId);
                        $state.go('contacts.detail', { contactId: randId });
                      }
                    };


                    $scope.pleaseLogin = function() {
                      if (!authenticated) {
                        growl.warning(
                          '<a href="' + $state.href('user.signin') + '">Please log in to see contacts.</a>',
                          {
                            ttl: 20000,
                            disableCountDown: false,
                            disableCloseButton: false
                          }
                        );
                      }
                    };
                  }
                }
              ],
              templateUrl: 'contacts/contacts.tpl.html'
            }
          },
          resolve: {
            authenticated: function($auth){
              // return authenticate.islogged();
              return $auth.isAuthenticated();
            },
            contacts: function(contacts){
              return contacts.all();
            }
          },
          data:{
            pageTitle: 'Contacts',
            headerTitle: 'Contacts',
            headerSubtitle: 'example'
          },
          onExit: function(growlMessages, $timeout) {
            $timeout(function(){
              growlMessages.destroyAllMessages();
            }, 2000);
          }
        })

        .state('contacts.list', {
          url: '',
          templateUrl: 'contacts/contacts.list.tpl.html',
          // data:{
          //   pageTitle: 'Contacts',
          //   headerTitle: 'Contacts',
          //   headerSubtitle: 'example'
          // },
        })

        .state('contacts.detail', {
          url: '/{contactId:[0-9]{1,4}}',
          views: {
            '': {
              templateUrl: 'contacts/contacts.detail.tpl.html',
              resolve: {
                userObject: function(User){
                  return User.get().$promise;
                }
              },
              controller: ['$scope', '$stateParams', 'utils', 'userObject', 'growl', '$document',
                function (  $scope, $stateParams, utils, userObject, growl, $document) {
                  $scope.contact = utils.findById($scope.contacts, $stateParams.contactId);

                  // $state.current.data.headerTitle = $scope.contact.name;

                  if(userObject.role == 'Admin') {
                    $scope.permissionToEdit = true;

                    $scope.contact.items.forEach(function (element, index) {
                      element.editing = false;
                      element.focused = false;
                      element.originalValue = element.value;
                    });

                    $scope.edit = function (e) {
                      $scope.contact.items.forEach(function (element, index) {
                        element.editing = false;
                        element.focused = false;
                        element.value = element.originalValue;
                      });

                      e.editing = true;
                      e.focused = true;
                    };

                    $scope.done = function (e) {
                      if ( e.value !== e.originalValue ) {

                        // persist

                        e.editing = false;
                        e.focused = false;
                        e.originalValue = e.value;

                        growl.success('Actualizaci&oacute;n correcta', {
                          ttl: 3000
                        });
                      }
                    };

                    $scope.keypressCallback = function (e) {
                      if ( e.value !== e.originalValue ) {
                        e.editing = false;
                        e.originalValue = e.value;
                        growl.success('Actualizaci&oacute;n correcta', {
                          ttl: 3000
                        });
                      }
                    };

                    angular.element($document[0].body).on('click',function(e) {
                      $scope.contact.items.forEach(function (element) {
                        element.editing = false;
                        element.focused = false;
                        element.value = element.originalValue;
                      });
                    });
                  } else {
                    $scope.permissionToEdit = false;
                  }
                }]
            },
            'tip@contacts.detail': {
              templateProvider: ['$stateParams',
                function (        $stateParams) {
                  return '<small class="text-muted">Contact ID: ' + $stateParams.contactId + '</small>';
                }]
            }
          },
          data:{
            permissions: {
              only: ['User'],
              redirectTo: 'contacts.list'
            },
            // pageTitle: 'Contact page',
            // headerTitle: 'Contact page',
            // // headerSubtitle: 'cccc'
          }
        });
    }
  ]
)


//.directive('syncFocus', function($timeout, $rootScope) {
.directive('syncFocus', function($timeout) {
  return {
    restrict: 'A',
    scope: {
      focusValue: "=syncFocus"
    },
    link: function($scope, $element, attrs) {
      $scope.$watch("focusValue", function(currentValue, previousValue) {
        if (currentValue === true && !previousValue) {
          $element[0].focus();
        } else if (currentValue === false && previousValue) {
          $element[0].blur();
        }
      });
    }
  };
})



;