'use strict';
module.exports = function (grunt) {

    

    grunt.initConfig({ 
	pkg: grunt.file.readJSON("package.json"),
	uglify: {
	    options : {},
	    build: {
		src: [
		    'boomerang.js',
		    'plugins/bw.js',
		    'plugins/rt.js',
		    'plugins/navtiming.js',
		    'plugins/dns.js'
		],
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
