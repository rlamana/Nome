/*
 * Nome
 *
 * Copyright (c) 2013 Ramon Lamana
 * Licensed under the MIT license.
 */

function extend() {
	var descriptors = {};
	
	Array.prototype.slice.call(arguments, 0).forEach(function(source) {
		if(typeof source === 'function') {
			source = source.prototype;
		}
		
		Object.keys(source).forEach(function(key) {
			descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
		});
	});
	
	return Object.create(Object.prototype, descriptors);
}

export default extend;
