'use strict';
module.exports = function (grunt) {

    var src = [ "boomerang.js" ];
    var plugins = grunt.file.readJSON("plugins.json");
    src.push(plugins.plugins);

    grunt.initConfig({ 
	pkg: grunt.file.readJSON("package.json"),
	uglify: {
	    options : {},
	    build: {
		src: src,
		dest: 'build/boomerang.min.js'
	    }
	},
	jshint: {
	    all: ['Gruntfile.js','boomerang.js','plugins/*.js']
	},
	clean: {
	    options: {},
	    build: ['build/'],
	    src: ['plugins/*~','*.js~']
	}
    });
		     
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default',['uglify']);
};
