angular.module('ngBoilerplate.shell.service', [

])

.factory('shell', function() {
  return {
    referer: null,
    setReferer: function (referer) {
      this.referer = referer;
    },
    getReferer: function() {
      return this.referer;
    },
    clearReferer: function() {
      this.referer = null;
    },
  };
})

;