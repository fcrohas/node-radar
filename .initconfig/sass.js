module.exports = function(grunt) {
  return {
    sass: {
      dist: {
        files: {
          'public/stylesheets/style.css' : 'sass/style.scss'
        }
      }
    }
  };
};