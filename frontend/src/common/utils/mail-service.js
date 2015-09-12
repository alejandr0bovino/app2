angular.module('ngBoilerplate.mail.service', [

])

.factory('Mail', function(ENV, $http) {
  return {
    // sendMailConfirm: function(data) {
    //   return $http.post(ENV.apiEndpoint + '/mail/confirm/', data);
    // },
    // sendMailPasswordReset: function(data) {
    //   return $http.post(ENV.apiEndpoint + '/mail/password-reset/', data);
    // },
  };
})

;
