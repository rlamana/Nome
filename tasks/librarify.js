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
			output.push('(function(root) {');
			output.push.apply(output, target.src.map(grunt.file.read));
			output.push('    if (typeof define === \'function\' && define.amd) {define(<%= barename %>);}');
			output.push('    else {root.<%= namespace %> = require("<%= barename %>");}');
			output.push('}(this));');

			grunt.file.write(target.dest, grunt.template.process(output.join('\n'), {data: target}));

			grunt.log.writeln('File "' + target.dest + '" created.');
		});
	});
}