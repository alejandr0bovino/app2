angular.module( 'ngBoilerplate.user.ProfileCtrl', [
  'ngFileUpload',
  'ap.canvas.ext',
  'rzModule'
])

.controller('ProfileCtrl', function ProfileCtrl($rootScope, $scope, $auth, User, growl, $state, resA, $timeout, $modal, formFactory ) {
  if (!resA) {
    $state.go('user.signin');
  } else {
    User.get(function(data){
      $rootScope.initialUser = angular.copy(data);
      $scope.user = data;
      $rootScope.removePictureEnabled = (data.profile !== undefined) && (data.profile.picture.medium !== 'https://s3.amazonaws.com/app2-uploads/user/picture/default/default-medium.png');
      $rootScope.removeCoverEnabled = (data.profile !== undefined) && (data.profile.cover.large !== 'https://s3.amazonaws.com/app2-uploads/user/cover/default/default-large.jpg');
    }, function(data){
      growl.error("Unable to get information");
    });

    //

    $scope.updateUser = function() {
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
          // formFactory.enableElements(document.getElementById('updateUserForm'));
          formFactory.enableElements();
          $rootScope.initialUser = null;
          $rootScope.user = response.user;
          $timeout(function(){
            growl.success("Profile updated");
          }, 750);
        },
        function(response) {
          console.log(response.status);
        }
      );

      return promise;
    };

    $scope.updatePassword = function() {
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
          // formFactory.enableElements(document.getElementById('updatePasswordForm'));
          formFactory.enableElements();
          $scope.user.oldPassword = '';
          $scope.user.newPassword = '';
          $scope.user.confirmPassword = '';
          $timeout(function(){
            growl.success("Password updated");
          }, 750);
        },
        function error(response) {
          formFactory.enableElements(document.getElementById('updatePasswordForm'));
          $scope.user.oldPassword = '';
          $timeout(function(){
            growl.error(response.data.message);
          }, 750);
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
            case 'github':
              $scope.user.github = null;
            break;
          }
        })
        .catch(function(response) {
          growl.error(response.data ? response.data.message : 'Could not unlink <b class="text-capitalize">' + provider + '</b> account');
        });
    };

    //

    $scope.removeImage = function(type) {
      var removePicture = $modal.open({
        templateUrl: 'user/templates/modal/remove-image.tpl.html',
        controller: 'RemoveImageCtrl',
        backdrop: 'static',
        resolve: {
          type: function() {
            return type;
          },
        },
      });
    };

    $scope.uploadImage = function(type) {
      var x = type == 'cover' ? 'lg' : 'sm';
      var size = 'dialog-upload--' + x;
      var uploadCover = $modal.open({
        templateUrl: 'user/templates/modal/upload-image.tpl.html',
        controller: 'UploadImageCtrl',
        backdrop: 'static',
        size: size,
        resolve: {
          type: function() {
            return type;
          },
        },
      });
    };
  }
})

.controller('RemoveImageCtrl', function($rootScope, $scope, $modalInstance, growl, ENV, $timeout, User, type) {
  $timeout(function(){
    document.getElementById('removeImageSubmit').focus();
  }, 260);

  $scope.remove = function() {
    $scope.btnDisabled = true;

    var remove = User.removePicture({'type': type});
    var promise = remove.$promise;

    promise.then(
      function(response) {
        $rootScope.initialUser = null;
        $rootScope.user = response.user;

        $timeout(function(){
          $modalInstance.dismiss('cancel');
          $timeout(function(){
            if (type == 'cover') {
              $rootScope.removeCoverEnabled = false;
              growl.success("Cover removed");
            } else {
              $rootScope.removePictureEnabled = false;
              growl.success("Picture removed");
            }
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

  $scope.type = type;
   // $scope.removeButtonText = 'Remove picture';
})

.controller('UploadImageCtrl', function($rootScope, $scope, $modalInstance, Upload, growl, ENV, $timeout, $window, apImageHelper, type) {
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

          if (type == 'cover') {
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

              if (type == 'cover') {
                $scope.controlZoom = true;
                $scope.controlDrag = true;
              } else {
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

      if (type=='cover') {
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
              ttl: 4000,
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

      if (type=='cover') {
        // canvasData = apImageHelper.cropImage($scope.leftCanvas.image, $scope.leftCanvas.frame, {width: 2500, height: 886});
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
        fields: {type: type},
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
                if (type == 'picture') {
                  $rootScope.removePictureEnabled = true;
                  growl.success('Picture updated');
                } else {
                  $rootScope.removeCoverEnabled = true;
                  growl.success('Cover updated');
                }
              }, 750);
            }, 2750);
          }, 300);
        },
        function(response) {
          console.log(response.status);
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

  $scope.type = type;
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