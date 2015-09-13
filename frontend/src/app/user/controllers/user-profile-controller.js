angular.module( 'ngBoilerplate.user.ProfileCtrl', [
  'ngFileUpload',
  'ap.canvas.ext',
  'rzModule'
])

.controller( 'ProfileCtrl', function ProfileCtrl($rootScope, $scope, $auth, User, growl, $state, resA, $timeout, $modal ) {
  if (!resA) {
    $state.go('user.login');
  } else {
    User.get(function(data){
      $rootScope.initialUser = angular.copy(data);
      // $scope.auxUser = angular.copy(data);
      $scope.user = data;
      $rootScope.removeEnabled = (data.profile !== undefined) && (data.profile.picture.medium !== 'https://s3.amazonaws.com/app2-uploads/user/picture/default/default-medium.png');
    }, function(data){
      growl.error("Unable to get information");
    });

    //

    $scope.myFunction = function() {
      document.getElementById('updateUserSubmit').click();
    };

    //

    $scope.updateUser = function() {
      document.getElementById('location').blur();
      document.getElementById('name').blur();

      $scope.user.oldPassword = '';
      $scope.user.newPassword = '';
      $scope.user.confirmPassword = '';
      $scope.updateUserForm.$setPristine();

      if (angular.isDefined($scope.updatePasswordForm)) {
        $scope.updatePasswordForm.$setPristine();
      }


      var updatex = User.update({
        name: $scope.user.profile.name,
        location: $scope.user.profile.location
      });

      var promise = updatex.$promise.then(
        function(response) {
          growl.success("Profile updated");

          $rootScope.initialUser = null;
          $rootScope.user = response.user;
        },
        function(response) {
          console.log(response.status);
        }
      );

      return promise;
    };
    $scope.myFunction2 = function() {
      document.getElementById('updatePasswordSubmit').click();
    };
    $scope.updatePassword = function() {

      document.getElementById('oldPassword').blur();
      document.getElementById('newPassword').blur();
      document.getElementById('confirmPassword').blur();

      $scope.user.profile.location = $rootScope.user.profile.location;
      $scope.user.profile.name = $rootScope.user.profile.name;

      $scope.updateUserForm.$setPristine();
      $scope.updatePasswordForm.$setPristine();


      var updatex = User.updatePassword({
        oldPassword: $scope.user.oldPassword,
        newPassword: $scope.user.newPassword
      });

      var promise = updatex.$promise;

      promise.then(
        function success(response) {
         growl.success("Password updated");
         $scope.user.oldPassword = '';
         $scope.user.newPassword = '';
         $scope.user.confirmPassword = '';
        },
        function error(response) {
          growl.error(response.data.message);
          $scope.user.oldPassword = '';
        }
      );

      return promise;
    };

    //

    $scope.link = function(provider) {
      $auth.link(provider)
        .then(function(response) {
          $rootScope.user = response.data.user;

          growl.success('Linked <b class="text-capitalize">' + provider + '</b> account');
          switch(provider) {
            case 'facebook':
              $scope.user.facebook = 1;
            break;
            case 'google':
              $scope.user.google = 1;
            break;
            case 'twitter':
              $scope.user.twitter = 1;
            break;
          }
          $state.reload();
        })
        .catch(function(response) {
          if (typeof response.data != 'undefined') {
            growl.error(response.data.message);
          }
        });
    };

    $scope.unlink = function(provider) {
      $auth.unlink(provider)
        .then(function() {
          growl.success('Unlinked <b class="text-capitalize">' + provider + '</b> account');
          switch(provider) {
            case 'facebook':
              $scope.user.facebook = null;
            break;
            case 'google':
              $scope.user.google = null;
            break;
            case 'twitter':
              $scope.user.twitter = null;
            break;
          }
        })
        .catch(function(response) {
          growl.error(response.data ? response.data.message : 'Could not unlink <b class="text-capitalize">' + provider + '</b> account');
        });
    };



    //

    $scope.removePicture = function() {
      var removePicture = $modal.open({
        templateUrl: 'user/templates/modal/remove-picture.tpl.html',
        controller: 'RemovePictureCtrl',
        backdrop: 'static',
      });
    };

    //

    $scope.uploadPicture = function() {
      var uploadPicture = $modal.open({
        templateUrl: 'user/templates/modal/upload-picture.tpl.html',
        controller: 'UploadImageCtrl',
        backdrop: 'static',
        size: 'dialog-upload modal-dialog-upload--sm',
        resolve: {
          uploadType: function() {
            return 'picture';
          },
        },
      });
    };

    //

    $scope.uploadCover = function() {
      var uploadCover = $modal.open({
        templateUrl: 'user/templates/modal/upload-cover.tpl.html',
        controller: 'UploadImageCtrl',
        backdrop: 'static',
        size: 'dialog-upload modal-dialog-upload--lg',
        resolve: {
          uploadType: function() {
            return 'cover';
          },
        },
      });
    };
    // $scope.uploadCover();

  }
})

.controller('RemovePictureCtrl', function($rootScope, $scope, $modalInstance, growl, ENV, $timeout, User) {
  $timeout(function() {
    // angular.element(document.querySelector('.js-btn-focus')).triggerHandler('focus');
    angular.element(document.querySelector('.js-btn-focus'))[0].focus();
  }, 100);

  $scope.remove = function() {

    document.querySelector('.js-btn-unfocus').blur();
    $scope.btnDisabled = true;

    var remove = User.removePicture();
    var promise = remove.$promise;

    promise.then(
      function(response) {
        $rootScope.initialUser = null;
        $rootScope.user = response.user;
        $rootScope.removeEnabled = false;

        $timeout(function(){
          $modalInstance.dismiss('cancel');
          $timeout(function(){
            growl.success("Picture removed");
          }, 850);
        }, 1400);
      },
      function(response) {
        console.log(response.status);
      }
    );

    return promise;

  };
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

   // $scope.removeButtonText = 'Remove picture';
})

.controller('UploadImageCtrl', function($rootScope, $scope, $modalInstance, Upload, growl, ENV, $timeout, $window, apImageHelper, uploadType) {
  var wscreen;
  var uploadErrorMessage;

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

  var handleFileSelect = function(evt, minWidth, minHeight) {
    var file = evt;
    var reader = new FileReader();

    reader.onload = function (evt) {
      var image = new Image();
      image.src = evt.target.result;

      image.onload = function() {
        var imageWidth = this.width,
            imageHeight = this.height;
        if (imageWidth > (minWidth - 1) && imageHeight > (minHeight - 1)) {
          var ceil = 100;
          var w, h;

          if (uploadType == 'cover') {
            if (wscreen == 'xs') {
              w = 306;
              h = 115;
            } else if (wscreen == 'sm') {
              w = 720;
              h = 255;
            } else {
              w = 846;
              h = 300;
            }
          } else {
            if (wscreen == 'xs') {
              w = 306;
              h = 306;
            } else if (wscreen == 'sm') {
              w = 340;
              h = 340;
            } else {
              w = 400;
              h = 400;
            }
          }

          var widthScale = w / imageWidth;
          var heightScale = h / imageHeight;
          var position = Math.max(widthScale, heightScale);
          position = Math.round(position * 100);

          $scope.$apply(function($scope){
            $scope.priceSlider = {
              value: position,
              ceil: ceil,
              floor: position,
            };

            $scope.$broadcast('reCalcViewDimensions');



            // $timeout(function(){
              // $timeout(function(){
                if (angular.isDefined(uploadErrorMessage)) {
                  uploadErrorMessage.destroy();
                }
              // }, 1000);

              $scope.leftCanvas = {
                src: evt.target.result,
              };

              if (uploadType == 'picture') {
                if (imageWidth == 400 && imageHeight == 400)  {
                  $scope.controlZoom = false;
                  $scope.controlDrag = false;
                } else if (imageWidth == 400 || imageHeight == 400)  {
                  $scope.controlZoom = false;
                  $scope.controlDrag = true;
                } else {
                  $scope.controlZoom = true;
                  $scope.controlDrag = true;
                }
              } else {
                $scope.controlZoom = true;
                $scope.controlDrag = true;
              }

            // }, 300);
          });
        } else {
          uploadErrorMessage = growl.error(
            '<i class="fa fa-warning"></i> image should be more than <b>' + minWidth + 'px wide</b> and <b>' + minHeight + 'px high</b>',
            {
              referenceId: 111,
              ttl: 4000,
              // disableCountDown: false,
              disableCloseButton: false
            }
          );
        }
      };
    };

    reader.readAsDataURL(file);
  };

  //

  $scope.$watch('file', function (file) {
    if( (file != null) ){
      if (angular.isDefined(uploadErrorMessage)) {
        uploadErrorMessage.destroy();
      }

      if (uploadType=='cover') {
        if (file.size <= 3145728) {
          handleFileSelect(file, 846, 300);
        } else {
          uploadErrorMessage = growl.error(
            '<i class="fa fa-warning"></i> File max size: <b>3Mb</b>',
            {
              referenceId: 111,
              ttl: 4000,
              disableCloseButton: false
            }
          );
        }
      } else {
        if (file.size <= 1048576) {
          handleFileSelect(file, 400, 400);
        } else {
          uploadErrorMessage = growl.error(
            '<i class="fa fa-warning"></i> File max size: <b>1Mb</b>',
            {
              referenceId: 111,
              ttl: 4000000,
              disableCloseButton: false
            }
          );
        }
      }
    }
  });

  $scope.$watch(
    function () {
      return $window.innerWidth;
    },
    function (value) {
      if (value < 768) {
        wscreen = 'xs';
      }

      if (value > 767 && value < 992)  {
        wscreen = 'sm';
      }

      if (value > 992) {
        wscreen = 'md';
      }
    },
    true
  );

  var win = angular.element($window);

  win.bind('resize', function(){
    $scope.$apply();
  });

  // $scope.zoomOut = function() {
  //   $scope.leftCanvas.scale = $scope.leftCanvas.scale - 0.1;
  // };

  // $scope.zoomIn = function() {
  //   if ($scope.leftCanvas.scale < 3) {
  //     $scope.leftCanvas.scale = $scope.leftCanvas.scale + 0.1;
  //   }
  // };


  $scope.onSliderChange = function() {
    if ($scope.priceSlider.value < 100) {
      $scope.leftCanvas.scale = $scope.priceSlider.value / 100;
    } else {
      $scope.leftCanvas.scale = 1;
    }
  };


  $scope.upload = function () {
    if ($scope.leftCanvas.image !== null ) {
      var canvasData;

      if (uploadType=='cover') {
        canvasData = apImageHelper.cropImage($scope.leftCanvas.image, $scope.leftCanvas.frame, {width: 1500, height: 531});
      } else {
        canvasData = apImageHelper.cropImage($scope.leftCanvas.image, $scope.leftCanvas.frame, {width: 400, height: 400});
      }

      var file = apImageHelper.dataURItoBlob(canvasData.dataURI);
      // var file = dataURItoBlob(canvasData.dataURI);

      var upload = Upload.upload({
        url: ENV.apiEndpoint + '/api/user/upload-file',
        method: 'POST',
        file: file,
        fields: {type: uploadType},
        ignoreLoadingBar: true,
      });

      var promise = upload.then(
        function(response) {
          $rootScope.initialUser = null;
          $rootScope.user = response.data.user;
          var nn = document.getElementById('nn');
          angular.element(nn).removeClass('active');
          $scope.shouldLeave = true;

          $timeout(function(){
            $scope.uploaded = true;
            $scope.uploadBtnText = 'Uploaded successfully';

            $timeout(function(){
              $modalInstance.dismiss('cancel');
              $timeout(function(){
                if (uploadType == 'picture') {
                  $rootScope.removeEnabled = true;
                  growl.success('Picture updated');
                } else {
                  growl.success('Cover updated');
                }
              }, 850);
            }, 2750);
          }, 750);
        },
        function(response) {
          // console.log(response.status);
        }
      );

      return promise;
    }
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.restart = function() {
    if (angular.isDefined(uploadErrorMessage)) {
      uploadErrorMessage.destroy();
    }
    $scope.leftCanvas = {
      src: null,
      image: null,
      frame: null,
      scale: null,
      offset: null
    };

    $scope.nnn = false;
    $scope.controlZoom = false;
    $scope.controlDrag = false;
  };

  $scope.n = function() {
    $scope.nnn = true;
    var nn = document.getElementById('nn');
    angular.element(nn).addClass('active');
    $scope.uploadReady = true;
    $timeout(function() {
      nn.click();
    }, 100);
  };

  // init

  $scope.leftCanvas = {
    src: null,
    image: null,
    frame: null,
    scale: null,
    offset: null
  };

  $scope.uploadBtnText = 'Apply & Upload';
  $scope.nnn = false;
  $scope.shouldLeave = false;
  $scope.uploadReady = false;

  //

  window.addEventListener("dragover", function(e) {
    e.preventDefault();
  }, false);
  window.addEventListener("drop", function(e) {
    e.preventDefault();
  }, false);
})



;