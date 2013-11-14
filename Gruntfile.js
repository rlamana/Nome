/*global module:false*/
module.exports = function(grunt) {

	grunt.loadTasks('tasks/');

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON('package.json'),

		banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
			' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
			' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

		// Transpiler of nome client code 
		transpile: {
			amd: {
				type: "amd",
				files: [{
					expand: true,
					cwd: 'src/client/',
					src: ['**/*.js'],
					dest: 'tmp/amd/',
					ext: '.amd.js'
				}]
			}
		},

		concat: {
			options: {
				stripBanners: true
			},
			bin: {
				options: {
					banner: '#!/usr/bin/env node\n'
				},
				src: ['src/server/**/*.js'],
				dest: 'build/bin/<%= pkg.name %>.js'
			},
			dist: {
				options: {
					banner: '<%= banner %>'
				},
				src: ['vendor/amd.js', 'tmp/amd/**/*.js'],
				dest: 'tmp/dist/<%= pkg.name %>.js'
			}
		},

		librarify: {
			dist: {
				barename: '<%= pkg.name %>',
				namespace: '<%= pkg.namespace %>',
				src: '<%= concat.dist.dest %>',
				dest: 'build/dist/<%= pkg.name %>.js'
			}
		},

		uglify: {
			options: {
				banner: '<%= banner %>'
			},
			dist: {
				src: '<%= librarify.dist.dest %>',
				dest: 'build/dist/<%= pkg.name %>.min.js'
			}
		},

		jshint: {
			options: {
				esnext: true,
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				unused: true,
				boss: true,
				eqnull: true,
				globals: {
					'require': false,
					'define': false,
					'module': false,
					'exports': false,
					'console': false
				}
			},

			gruntfile: {
				src: 'Gruntfile.js'
			},

			lib_test: {
				src: ['src/**/*.js', 'test/**/*.js']
			}
		},

		nodeunit: {
			files: ['test/**/*_test.js']
		},

		watch: {
			dist: {
				files: ['<%= jshint.gruntfile.src %>', 'src/client/**/*.js'],
				tasks: ['default']
			},

			/*
			lib_test: {
				files: '<%= jshint.lib_test.src %>',
				tasks: ['default']
			},

			lib_test: {
				files: '<%= jshint.lib_test.src %>',
				tasks: ['jshint:lib_test', 'nodeunit']
			}*/
		},

		clean: {
			amd: ['build','tmp']
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-es6-module-transpiler');

	// Default task.
	grunt.registerTask('default', ['clean', 'jshint', /*'nodeunit',*/ 'transpile', 'concat', 'librarify', 'uglify']);

};
