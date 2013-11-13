
function extend() {
	var obj = {};
	Array.prototype.slice.call(arguments, 0).forEach(function(source) {
		if(typeof source === 'function') {
			source = source.prototype;
		}

		Object.keys(source).forEach(function(key) {
			var descriptor = Object.getOwnPropertyDescriptor(source, key);
			Object.defineProperty(obj, key, descriptor);
		});
	});
	return obj;
}

export default extend;