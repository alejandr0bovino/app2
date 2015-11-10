module.exports = function ( grunt ) {
  grunt.loadNpmTasks('grunt-ng-constant');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-ngmin');
  grunt.loadNpmTasks('grunt-html2js');

  var modRewrite = require('connect-modrewrite');
  var userConfig = require( './build.config.js' );

  var taskConfig = {
    pkg: grunt.file.readJSON("package.json"),
    meta: {
      banner:
        '/**\n' +
        ' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' * <%= pkg.homepage %>\n' +
        ' *\n' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
        ' */\n'
    },

    ngconstant: {
      // Options for all targets
      options: {
        space: '  ',
        wrap: '"use strict";\n\n {%= __ngModule %}',
        name: 'config'
      },
      // Environment targets
      development: {
        options: {
          dest: '<%= build_dir %>/scripts/config.js'
        },
        constants: {
          ENV: grunt.file.readJSON('development.json')
        }
      },
      production: {
        options: {
          dest: '<%= compile_dir %>/scripts/config.js'
        },
        constants: {
          ENV: grunt.file.readJSON('production.json')
        }
      }
    },

    htmlmin: {
      compile: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: {
          '<%= compile_dir %>/index.html': '<%= compile_dir %>/index.html'
        }
      }
    },

    clean: [
      '<%= build_dir %>',
      '<%= compile_dir %>'
    ],


    /**
     * `grunt-contrib-sass` handles our SASS compilation and uglification automatically.
     * Only our `main.scss` file is included in compilation; all other files
     * must be imported from this file.
     */
    sass: {
      options: {
        compass: true
      },
      build: {
        files: {
          '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css': '<%= app_files.sass %>'
        },
        options: {
          style: 'expanded',
          lineNumbers: true
        }
      },
      compile: {
        files: {
          '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css': '<%= app_files.sass %>'
        },
        options: {
          sourcemap: 'none',
          style: 'compressed'
        }
      }
    },

    /**
     * The `copy` task just copies files from A to B. We use it here to copy
     * our project assets (images, fonts, etc.) and javascripts into
     * `build_dir`, and then to copy the assets to `compile_dir`.
     */
    copy: {
      build_app_assets: {
        files: [
          {
            src: [ '**' ],
            dest: '<%= build_dir %>/assets/',
            cwd: 'src/assets',
            expand: true
          },
          {
            src: [ '**' ],
            dest: '<%= build_dir %>/uploads/',
            cwd: 'src/uploads',
            expand: true
          }
        ]
      },
      build_appjs: {
        files: [
          {
            src: [ '<%= app_files.js %>' ],
            dest: '<%= build_dir %>/',
            cwd: '.',
            expand: true
          }
        ]
      },
      build_vendorjs: {
        files: [
          {
            src: [ '<%= vendor_files.js %>' ],
            dest: '<%= build_dir %>/',
            cwd: '.',
            expand: true
          }
        ]
      },
      build_vendorcss: {
        files: [
          {
            src: [ '<%= vendor_files.css %>' ],
            dest: '<%= build_dir %>/',
            cwd: '.',
            expand: true
          }
        ]
      },
      compile_assets: {
        files: [
          {
            src: [ '**' ],
            dest: '<%= compile_dir %>/assets',
            cwd: '<%= build_dir %>/assets',
            expand: true
          },
          {
            src: [ '**' ],
            dest: '<%= compile_dir %>/uploads',
            cwd: '<%= build_dir %>/uploads',
            expand: true
          }
        ]
      },
      // build_admin:{
      //   files: [
      //     {
      //       src: [ '**' ],
      //       dest: '<%= build_dir %>/admin/',
      //       cwd: 'src/admin',
      //       expand: true
      //     },
      //     {
      //       src: [ '<%= vendor_files.admin %>' ],
      //       dest: '<%= build_dir %>/admin/vendor/',
      //       cwd: '.',
      //       expand: true,
      //       flatten: true
      //     }
      //  ]
      // }
    },

    /**
     * `grunt concat` concatenates multiple source files into a single file.
     */
    concat: {
      /**
       * The `build_css` target concatenates compiled CSS and vendor CSS
       * together.
       */
      build_css: {
        src: [
          '<%= vendor_files.css %>',
          '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
        ],
        dest: '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
      },
      /**
       * The `compile_js` target is the concatenation of our application source
       * code and all specified vendor source code into a single file.
       */
      compile_js: {
        // options: {
        //   banner: '<%= meta.banner %>'
        // },
        src: [
          '<%= vendor_files.js %>',
          'module.prefix',
          '<%= build_dir %>/src/**/*.js',
          '<%= html2js.app.dest %>',
          '<%= html2js.common.dest %>',
          'module.suffix'
        ],
        dest: '<%= compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.js'
      },
      compile_css: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: [
          '<%= vendor_files.css %>',
          '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
        ],
        dest: '<%= compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
      }
    },


    /**
     * `ng-min` annotates the sources before minifying. That is, it allows us
     * to code without the array syntax.
     */
    ngmin: {
      compile: {
        files: [
          {
            src: [ '<%= app_files.js %>' ],
            cwd: '<%= build_dir %>',
            dest: '<%= build_dir %>',
            expand: true
          }
        ]
      }
    },

    /**
     * Minify the sources!
     */
    uglify: {
      compile: {
        options: {
          banner: '<%= meta.banner %>',
          mangle: false
        },
        files: {
          '<%= concat.compile_js.dest %>': '<%= concat.compile_js.dest %>'
        }
      }
    },

    jshint: {
      src: [
        'src/**/*.js', '!src/assets/**/*.js', '!src/admin/**/*.js', '!src/common/component/canvas-ext.js'
      ],
      gruntfile: [
        'Gruntfile.js'
      ],
      options: {
        curly: true,
        immed: true,
        newcap: true,
        noarg: true,
        sub: true,
        boss: true,
        eqnull: true,
        es5: true,
        // ignores: ['src/common/component/canvas-ext.js']
      },
      globals: {}
    },

    html2js: {
      /**
       * These are the templates from `src/app`.
       */
      app: {
        options: {
          base: 'src/app'
        },
        src: [ '<%= app_files.atpl %>' ],
        dest: '<%= build_dir %>/templates-app.js'
      },

      /**
       * These are the templates from `src/common`.
       */
      common: {
        options: {
          base: 'src/common',
          module: 'templates-ui',
          rename: function (modulePath) {
            var moduleName = modulePath.replace('templates-ui/', '');
            var split = moduleName.substring(0, 5);

            if (split == "growl") {
              return 'templates' + '/' + moduleName;
            } else {
              return 'template' + '/' + moduleName;
            }
          }
        },
        src: [ '<%= app_files.ctpl %>' ],
        dest: '<%= build_dir %>/templates-ui.js'
      }
    },

    /**
     * The `index` task compiles the `index.html` file as a Grunt template. CSS
     * and JS files co-exist here but they get split apart later.
     */
    index: {
      /**
       * During development, we don't want to have wait for compilation,
       * concatenation, minification, etc. So to avoid these steps, we simply
       * add all script files directly to the `<head>` of `index.html`. The
       * `src` property contains the list of included files.
       */
      build: {
        dir: '<%= build_dir %>',
        src: [
          '<%= vendor_files.js %>',
          '<%= build_dir %>/src/**/*.js',
          '<%= html2js.common.dest %>',
          '<%= html2js.app.dest %>',
          '<%= vendor_files.css %>',
          '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
        ]
      },

      /**
       * When it is time to have a completely compiled application, we can
       * alter the above to include only a single JavaScript and a single CSS
       * file. Now we're back!
       */
      compile: {
        dir: '<%= compile_dir %>',
        src: [
          '<%= concat.compile_js.dest %>',
          // '<%= vendor_files.css %>',
          '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
        ]
      }
    },


    /**
     * And for rapid development, we have a watch set up that checks to see if
     * any of the files listed below change, and then to execute the listed
     * tasks when they do. This just saves us from having to type "grunt" into
     * the command-line every time we want to see what we're working on; we can
     * instead just leave "grunt watch" running in a background terminal. Set it
     * and forget it, as Ron Popeil used to tell us.
     *
     * But we don't need the same thing to happen for all the files.
     */

    delta: {
      /**
       * By default, we want the Live Reload to work for all tasks; this is
       * overridden in some tasks (like this file) where browser resources are
       * unaffected. It runs by default on port 35729, which your browser
       * plugin should auto-detect.
       */
      options: {
        livereload: true
      },

      /**
       * When the Gruntfile changes, we just want to lint it. In fact, when
       * your Gruntfile changes, it will automatically be reloaded!
       */
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: [ 'jshint:gruntfile' ],
        options: {
          livereload: false
        }
      },

      /**
       * When our JavaScript source files change, we want to run lint them and
       * run our unit tests.
       */
      jssrc: {
        files: [
          '<%= app_files.js %>'
        ],
        tasks: [ 'jshint:src', 'copy:build_appjs' ]
      },



      /**
       * When assets are changed, copy them. Note that this will *not* copy new
       * files, so this is probably not very useful.
       */
      assets: {
        files: [
          'src/assets/**/*'
        ],
        tasks: [ 'copy:build_app_assets' ]
      },

      /**
       * When index.html changes, we need to compile it.
       */
      html: {
        files: [ '<%= app_files.html %>' ],
        tasks: [ 'index:build' ]
      },

      /**
       * When our templates change, we only rewrite the template cache.
       */
      tpls: {
        files: [
          '<%= app_files.atpl %>',
          '<%= app_files.ctpl %>'
        ],
        tasks: [ 'html2js' ]
      },

      /**
       * When the CSS files change, we need to compile and minify them.
       */
      sass: {
        files: [ 'src/**/*.scss' ],
        tasks: [ 'sass:build' ]
      },


      // admin: {
      //   files: [ 'src/admin/app.js' ],
      //   tasks: ['copy:build_admin'],
      // }
    },


    /**
      connect
    */
    connect: {
      options: {
        port: 9001,
        livereload: 35729,
        hostname: 'dev.test24.xyz',
        middleware: function (connect, options) {
          var optBase = (typeof options.base === 'string') ? [options.base] : options.base;

          // return [modRewrite(['!admin|\\.html|\\.js|\\.json|\\.svg|\\.css|\\.png|\\.ico|\\.jpg|\\.gif|\\.swf$ /index.html [L]'])].concat(
          return [modRewrite(['!admin|\\.html|\\.js|\\.json|\\.svg|\\.eot|\\.ttf|\\.woff|\\.woff2|\\.css|\\.png|\\.ico|\\.jpg|\\.gif|\\.swf$ /index.html [L]'])].concat(

            optBase.map(function(path){
              return connect.static(path);
            })
          );
        }
      },
      livereload: {
        options: {
          open: true,
          base: [
            '.tmp',
            '<%= build_dir %>'
          ]
        }
      },
    }
  };


  grunt.initConfig( grunt.util._.extend( taskConfig, userConfig ) );

  grunt.renameTask( 'watch', 'delta' );


  // global
  grunt.registerTask( 'build', [
    'clean',
    'ngconstant:development',
    'html2js',
    'jshint',
    'sass:build',
    'copy:build_app_assets',
    'copy:build_appjs',
    'copy:build_vendorjs',
    'copy:build_vendorcss',
    // 'copy:build_admin',
    // 'concat:build_css',
    'index:build'
  ]);

  grunt.registerTask( 'compile', [
    'ngconstant:production',
    'sass:compile',
    'copy:compile_assets',
    'ngmin',
    'concat:compile_js',
    'concat:compile_css',
    'uglify',
    'index:compile',
    'htmlmin'
  ]);

  //default
  grunt.registerTask( 'default', 'serve' );

  // admin
  // grunt.registerTask('serve_admin', function () {
  //   grunt.task.run([
  //     'build',
  //     'connect:livereload',
  //     'delta:admin'
  //   ]);
  // });

 // development
  grunt.registerTask('serve', function () {
    grunt.task.run([
      'build',
      'connect:livereload',
      'delta'
    ]);
  });


  //production
  grunt.registerTask( 'prod', ['build', 'compile' ] );




  /**
   * A utility function to get all app JavaScript sources.
   */
  function filterForJS ( files ) {
    return files.filter( function ( file ) {
      return file.match( /\.js$/ );
    });
  }

  /**
   * A utility function to get all app CSS sources.
   */
  function filterForCSS ( files ) {
    return files.filter( function ( file ) {
      return file.match( /\.css$/ );
    });
  }

  /**
   * The index.html template includes the stylesheet and javascript sources
   * based on dynamic names calculated in this Gruntfile. This task assembles
   * the list into variables for the template to use and then runs the
   * compilation.
   */
  grunt.registerMultiTask( 'index', 'Process index.html template', function () {
    var dirRE = new RegExp( '^('+grunt.config('build_dir')+'|'+grunt.config('compile_dir')+')\/', 'g' );
    var jsFiles = filterForJS( this.filesSrc ).map( function ( file ) {
      return file.replace( dirRE, '' );
    });
    var cssFiles = filterForCSS( this.filesSrc ).map( function ( file ) {
      return file.replace( dirRE, '' );
    });

    grunt.file.copy('src/index.html', this.data.dir + '/index.html', {
      process: function ( contents, path ) {
        return grunt.template.process( contents, {
          data: {
            scripts: jsFiles,
            styles: cssFiles,
            version: grunt.config( 'pkg.version' )
          }
        });
      }
    });
  });
};