module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // clean: ["public/dist/**/*", "!public/dist/.gitkeep"],
    concat: {
      // options: {
      //   separator: ';',
      // },
      dist: {
        src: ['public/client/**/*.js'],
        dest: 'public/dist/concatenatedClient.js'
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
      my_target: {
        files: {
          'public/dist/uglified.js': ['public/dist/concatenatedClient.js']
        }
      }
    },

    jshint: {
      beforeconcat: ['**/*.js'],
      afterconcat: ['public/dist/concatenatedClient.js'],
      options: {
        force: 'true',
        jshintrc: '.jshintrc',
        ignores: [
          'public/lib/**/*.js',
          'node_modules/**/*.*'
        ]
      }
    },

    cssmin: {
      target: {
        files: {
          'public/dist/stylesmin.css': ['public/style.css']
        }
      }
    },

    watch: {
      scripts: {
        files: [
          'public/client/**/*.js',
          'public/lib/**/*.js',
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      prodServer: {
        command: {
        // 'git push jason master',
        'git push azure master'
        // ].join('&&')
      }
    },
  });


  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('server-dev', function (target) {
    // Running nodejs in a different process and displaying output on the main console
    var nodemon = grunt.util.spawn({
         cmd: 'grunt',
         grunt: true,
         args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    grunt.task.run([ 'watch' ]);
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('test', [
    // 'jshint:beforeconcat',
    'jshint',
    'mochaTest'
  ]);

  grunt.registerTask('build', [
    'test',
    // 'clean',
    'concat',
    // 'jshint:afterconcat',
    'jshint',
    'uglify',
    'cssmin'
  ]);

  // grunt upload
  //
  //
  // --prod=true

  grunt.registerTask('upload', function() {
    if(grunt.option('prod')) {
      grunt.task.run([ 'shell' ]);
    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  });

  // var target = grunt.option('prod');
  grunt.registerTask('deploy', [
    // add your deploy tasks here
    'build',
    // 'upload:'+true
    'upload'
  ]);


};
