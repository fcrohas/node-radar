module.exports = function(grunt) {
  return {
    watch: {
      source: {
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
  };
};