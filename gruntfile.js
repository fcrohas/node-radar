module.exports = function(grunt) {
  "use strict";
  require('load-grunt-tasks')(grunt);
  //console.log(grunt);
  grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      sass: {
        dist: {
          files: [{
            expand: true,
            cwd: 'sass',
            src: ['style.scss'],
            dest: 'public/stylesheets',
            ext: '.css'
          }]
        }
      }
    // ,
    // watch: {
    //   sass: {
    //     files: ['sass/**/*.scss'],
    //     tasks: ['sass'],
    //     options: {
    //       livereload: true, // needed to run LiveReload
    //     }
    //   },
    //   jade: {
    //     files: ['views/**/*.jade'],
    //     tasks: ['jade'],
    //     options: {
    //       livereload: true, // needed to run LiveReload
    //     }
    //   },
    //   javascript: {
    //     files: ['public/**/*.js'],
    //     tasks: ['jshint'],
    //     options: {
    //       livereload: true, // needed to run LiveReload
    //     }
    //   }
    // }
  });
  //grunt.loadNpmTasks('grunt-sass');
  //grunt.loadNpmTasks('grunt-jade');  
  //grunt.loadNpmTasks('grunt-contrib-jshint');
  //grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['sass']);
  //grunt.registerTask('dev', ['watch']);
  //grunt.registerTask('prod', ['lint test']);  
};