angular.module('ngBoilerplate.user.service', [

])

.factory('User', function(ENV, $resource) {
  var userEndpoint = ENV.apiEndpoint + '/api/user';

  return $resource(userEndpoint,
    {},
    {
      all: {
        method: 'GET',
        url: userEndpoint + '/all',
        isArray: true
      },
      get:    {
        method: 'GET',
        ignoreLoadingBar: true
      },
      update: {
        method: 'PUT',
        isArray: false,
        ignoreLoadingBar: true
      },
      usernameAvailable: {
        method: 'GET',
        // params: { username: '@username' },
        url: userEndpoint + '/username-available/:username',
        isArray: false,
        ignoreLoadingBar: true
      },
      emailAvailable: {
        method: 'GET',
        // params: { email: '@email' },
        url: userEndpoint + '/email-available/:email',
        isArray: false,
        ignoreLoadingBar: true
      },
      confirmRegistrationPost: {
        method: 'POST',
        url: userEndpoint + '/confirm-registration',
        ignoreLoadingBar: true
      },
      confirmRegistrationPut: {
        method: 'PUT',
        url: userEndpoint + '/confirm-registration'
      },
      updatePassword: {
        method: 'PUT',
        url: userEndpoint + '/update-password',
        ignoreLoadingBar: true
      },
      resetPasswordPost: {
        method: 'POST',
        url: userEndpoint + '/reset-password',
        ignoreLoadingBar: true
      },
      resetPasswordPut: {
        method: 'PUT',
        url: userEndpoint + '/reset-password',
        ignoreLoadingBar: true
      },
      getPublicUser: {
        method: 'GET',
        // params: { username: '@username' },
        url: userEndpoint + '/public-user/:username',
      },
      removePicture: {
        method: 'PUT',
        // params: { type: '@type' },
        url: userEndpoint + '/remove-picture',
        ignoreLoadingBar: true
      }
    }
  );

})


;
