module.exports = function(grunt) {
  grunt.initConfig({
    "grunt-vows" : {
      files : ["test/example.js"]
    }
  });
  grunt.loadNpmTasks("grunt-vows");

  grunt.register("test","vows")
};
