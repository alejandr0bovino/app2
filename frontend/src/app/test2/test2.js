angular.module( 'ngBoilerplate.test2', [
  // 'ngFileUpload',
  // 'ngImgCrop',
])


// .config(function config( $stateProvider ) {
//   $stateProvider.state( 'test2', {
//     url: '/test2',
//     views: {
//       "main": {
//         controller: 'Test2Ctrl',
//         templateUrl: 'test2/test2.tpl.html'
//       }
//     },
//     data: {}
//   });

// })


.config(function($stateProvider, $urlRouterProvider) {

  // $urlRouterProvider.otherwise('/test2');

  $stateProvider

  .state('test2', {
    // abstract: true,
    url: "/test2",

    views: {
      "main": {
        templateUrl: "test2/test2.tpl.html",
        controller: 'mainCtrl',
      }
    }
  })

//   .state('showcase', {
//     url: "",
// templateUrl: "test2/showcase.tpl.html",
// // views: {
// //       "ccc": {
// //         templateUrl: "test2/showcase.tpl.html",
// //         // controller: 'mainCtrl',
// //       }
// //     }
//   })
    .state('test2.category', {
      url: "^/test2/:category",

      // views: {
      //   "cc": {
          templateUrl: "test2/subcategory.tpl.html",
          controller: 'categoryCtrl',
        // }
      // }
    })
    .state('test2.category.subcategory', {
      url: "/:subcategory",
      templateUrl: "test2/product.tpl.html",
      controller: 'productCtrl',
    });
})


.controller('mainCtrl', ['$scope', '$http',
  function($scope, $http) {
    $scope.categories = [];

    $http.get('assets/test1.json').success(function(data) {
      $scope.categories = data;
      // console.log($scope.categories);
    }).
    error(function(data, status, headers, config) {
      // log error
    });

  }
])

.controller('categoryCtrl', ['$scope', '$stateParams',
  function($scope, $stateParams) {

    angular.forEach($scope.categories, function(value, key) {
      console.log(key);
      console.log(value);
      if (key === $stateParams.category) {
        console.log("si");
      } else {
        console.log("no");
      }
    });



    $scope.category = $stateParams.category;
    // $scope.subCats = _.find($scope.categories, { "url": $stateParams.category }).subCats;
    $scope.subCats = [];

    if ($scope.categories.length) {
    $scope.subCats = $scope.categories.filter(function(e) {
      return e.url == $stateParams.category;
    })[0].subCats;
    }
    console.log($scope.subCats);
  }
])
.controller('productCtrl', ['$scope', '$stateParams',
  function($scope, $stateParams) {
    $scope.subcategory = $stateParams.subcategory;
    // $scope.products = _.find($scope.subCats, { "url": $stateParams.subcategory}).products;

    if ($scope.subCats.length) {
      $scope.products = $scope.subCats.filter(function(e) {
        return e.url == $stateParams.subcategory;
      })[0].products;
    }
  }
])
;

