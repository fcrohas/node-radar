module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-jade');  
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.initconfig({
    watch: {
      sass: {
        files: ['sass/**/*.scss'],
        tasks: ['sass'],
        options: {
          livereload: true, // needed to run LiveReload
        }
      },
      jade: {
        files: ['views/**/*.jade'],
        tasks: ['jade'],
        options: {
          livereload: true, // needed to run LiveReload
        }
      },
      javascript: {
        files: ['public/**/*.js'],
        tasks: ['jshint'],
        options: {
          livereload: true, // needed to run LiveReload
        }
      }
    }
  });
  grunt.registerTask('default', ['watch']);
  //grunt.registerTask('dev', ['watch']);
  grunt.registerTask('prod', ['lint test']);  
};