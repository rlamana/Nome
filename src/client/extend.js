
(function(root) {
    'use strict';

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

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = extend;
    }
    else if (typeof define !== 'undefined' && define.amd) {
        define(function() { return extend; });
    }
    else {
        root.extend = extend;
    }

})(this);