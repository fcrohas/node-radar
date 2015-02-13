module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-initconfig');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['sass']);
  grunt.registerTask('dev', 'watch');
  grunt.registerTask('prod', 'lint test');  
  grunt.task.run('initconfig');
};