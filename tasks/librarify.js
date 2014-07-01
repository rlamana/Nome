/*
 * grunt-contrib-librarify
 *
 * Copyright (c) 2013 Ramon Lamana
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
    grunt.registerMultiTask('librarify', "Export the object in <%= cfg.barename %> as an external library", function() {
        this.files.forEach(function(target) {
            var output = [];
            output.push("(function (root, factory) { \
                        \n    if (typeof define === 'function' && define.amd) { \
                        \n        define([], factory); \
                        \n    } else { \
                        \n        root.<%= namespace %> = factory(); \
                        \n    } \
                        \n}(this, function () {");
            output.push.apply(output, target.src.map(grunt.file.read));
            output.push("\n    return require('<%= barename %>'); \n}));");

            grunt.file.write(target.dest, grunt.template.process(output.join('\n'), {data: target}));
            grunt.log.writeln('File "' + target.dest + '" created.');
        });
    });
}