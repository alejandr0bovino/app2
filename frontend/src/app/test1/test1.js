angular.module( 'ngBoilerplate.test1', [
  'ui.router',
  'ngFileUpload'
])



.config(function config( $stateProvider ) {
  $stateProvider.state( 'test1', {
    url: '/test1',
    views: {
      "main": {
        controller: 'Test1Ctrl',
        // resolve: {
        //   userObject: function(authenticate, User){
        //     if ( authenticate.islogged()) {
        //       return User.get().$promise;
        //     }
        //   }
        // },
        templateUrl: 'test1/test1.tpl.html'
      }
    },
    data:{
      // pageClass: 'about',
      pageTitle: 'About',
      headerTitle: 'The Elevator <small>For the impatient</small>',
      headerSubtitle: 'This example is a quick exercise to illustrate how the default'
    }
  });
})

.controller( 'Test1Ctrl', function Test1Ctrl( $rootScope, $scope, Upload, growl , ENV, User, authenticate) {

if (authenticate.islogged()) {
    User.get(function(data){
      $scope.user = data;
    }, function(data){
      growl.error("Unable to get information");
    });

    // $scope.$watch('files', function () {
    //   if ($scope.files && $scope.files.length) {
    //     $scope.filename = $scope.files[0].name;
    //   }
    // });

    window.addEventListener("dragover", function(e) {
      e.preventDefault();
    }, false);
    window.addEventListener("drop", function(e) {
      e.preventDefault();
    }, false);


    $scope.upload = function (file) {


      var userName = $scope.user.pendingUpdate ? 'no' : $scope.user.userName;
      console.log(file);
      Upload.upload({
        url: ENV.apiEndpoint + '/api/user/upload-file',
        method: 'POST',
        file: file,
        fields: {type: 'cover'},
      })
      .success(function (data, status, headers, config) {
        growl.success('file <b>' + config.file.name + '</b> uploaded.');
      }).error(function (data, status, headers, config) {
        growl.error('error status: ' + status);
      });
    };
  }
})


// .filter('filterUrl', function() {
//   return function(str) {
//     if (str !== undefined) {
//       return str.replace('https://','http://');
//     }
//   };
// })



;


