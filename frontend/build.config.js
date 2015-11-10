module.exports = {
  build_dir: 'build',
  compile_dir: 'bin',
  app_files: {
    js: [ 'src/**/*.js', '!src/assets/**/*.js', '!src/admin/**/*.js' ],
    atpl: [ 'src/app/**/*.tpl.html' ],
    ctpl: [ 'src/common/templates-ui/**/*.html' ],
    html: [ 'src/index.html' ],
    sass: 'src/scss/main.scss'
  },
  vendor_files: {
    js: [
      'vendor/angular/angular.min.js',
      'vendor/angular-bootstrap/ui-bootstrap-tpls.min.js',
      'vendor/angular-ui-router/release/angular-ui-router.min.js',
      'vendor/angular-resource/angular-resource.js',
      'vendor/angular-permission/dist/angular-permission.js',
      'vendor/angular-growl-v2/build/angular-growl.min.js',
      'vendor/angular-animate/angular-animate.js',
      'vendor/angular-messages/angular-messages.js',
      'vendor/angular-touch/angular-touch.min.js',
      'vendor/satellizer/satellizer.min.js',
      'vendor/angular-loading-bar/build/loading-bar.min.js',
      'vendor/angular-sanitize/angular-sanitize.js',
      'vendor/ng-scrollbar/dist/ng-scrollbar.js',
      'vendor/angular-ui-switch/angular-ui-switch.js',
      'vendor/ng-file-upload/ng-file-upload.min.js',
      'vendor/angular-progress-button-styles/dist/angular-progress-button-styles.js',
      'vendor/angularjs-slider/dist/rzslider.min.js',
      'vendor/angular-canvas-ext/exif.min.js',
      // 'vendor/angular-canvas-ext/angular-canvas-ext.js'
    ],
    css: [
      'vendor/angular-growl-v2/build/angular-growl.min.css',
      'vendor/angular-loading-bar/build/loading-bar.min.css',
      'vendor/angular-ui-switch/angular-ui-switch.min.css',
      'vendor/angular-progress-button-styles/dist/angular-progress-button-styles.css',
      'vendor/angularjs-slider/dist/rzslider.min.css'
    ],
    // admin: [
    //   'vendor/ng-admin/build/*.*',
    //   'vendor/angular-deferred-bootstrap/angular-deferred-bootstrap.min.js'
    // ]
  },
};