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

        traceur: {
            options: {
                modules: 'amd'
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src/client/',
                    src: ['**/*.js'],
                    dest: 'tmp/amd/',
                    ext: '.amd.js'
                }]
            },
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

        watch: {
            dist: {
                files: ['<%= jshint.gruntfile.src %>', 'src/client/**/*.js', 'Gruntfile.js'],
                tasks: ['default']
            }
        },

        clean: {
            build: ['build'],
            tmp: 'tmp'
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-traceur');

    grunt.registerTask('build', ['clean', 'jshint', 'traceur', 'concat', 'librarify', 'uglify']);
    grunt.registerTask('default', ['build', 'clean:tmp']);
};
