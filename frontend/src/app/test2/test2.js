angular.module( 'ngBoilerplate.test2', [
  'ngFileUpload',
  // 'ngImgCrop',
])


.config(function config( $stateProvider ) {
  $stateProvider.state( 'test2', {
    url: '/test2',
    views: {
      "main": {
        controller: 'Test2Ctrl',
        templateUrl: 'test2/test2.tpl.html'
      }
    },
    data: {}
  });

})

.controller( 'Test2Ctrl', function Test2Ctrl($rootScope, $scope, apImageHelper, Upload, ENV, growl ) {

  function dataURItoBlob(dataURI) {
    var byteString,
    mimestring;

    if(dataURI.split(',')[0].indexOf('base64') !== -1 ) {
      byteString = atob(dataURI.split(',')[1]);
    } else {
      byteString = decodeURI(dataURI.split(',')[1]);
    }

    mimestring = dataURI.split(',')[0].split(':')[1].split(';')[0];

    var content = [];
    for (var i = 0; i < byteString.length; i++) {
      content[i] = byteString.charCodeAt(i);
    }

    return new Blob([new Uint8Array(content)], {type: mimestring});
  }









    $scope.myImage='';
    $scope.myCroppedImage='';



    var handleFileSelect=function(evt) {
      var file=evt.currentTarget.files[0];
      var reader = new FileReader();
      reader.onload = function (evt) {
        $scope.$apply(function($scope){
          $scope.myImage=evt.target.result;
        });
      };
      reader.readAsDataURL(file);
    };
    angular.element(document.querySelector('#fileInput')).on('change',handleFileSelect);




    $scope.upload = function () {

      var file = dataURItoBlob($scope.myCroppedImage);
      console.log(file);

      var upload = Upload.upload({
        url: ENV.apiEndpoint + '/api/user/upload-file',
        method: 'POST',
        file: file,
        fields: {type: 'picture'},

       })
       .success(function (data, status, headers, config) {
            growl.success("n");
        })
       .error(function (data, status, headers, config) {

      });

    };



    ///////////





 $scope.leftCanvas = {
    src: null,
    image: null,
    frame: null,
    scale: null,
    offset: null
  };

  $scope.rightCanvas = {
    src: null,
    image: null,
    frame: null,
    scale: null,
    offset: null
  };

  $scope.zoomIn = function() {
    $scope.leftCanvas.scale *= 1.2;
  };

  $scope.zoomOut = function() {
    $scope.leftCanvas.scale /= 1.2;
  };

  $scope.crop = function() {
    var canvasData = apImageHelper.cropImage($scope.leftCanvas.image, $scope.leftCanvas.frame, {width: 1500, height: 1500});
    // $scope.rightCanvas.src = canvasData.dataURI;
  };


  $scope.upload2 = function () {
    if ($scope.leftCanvas.image !== null ) {

      var canvasData = apImageHelper.cropImage($scope.leftCanvas.image, $scope.leftCanvas.frame, {width: 400, height: 400});


      var file = dataURItoBlob(canvasData.dataURI);
      console.log(file);

      var upload = Upload.upload({
        url: ENV.apiEndpoint + '/api/user/upload-file',
        method: 'POST',
        file: file,
        fields: {type: 'picture'},

       })
       .success(function (data, status, headers, config) {
            growl.success("n");
        })
       .error(function (data, status, headers, config) {

      });
    }
  };
})

;

