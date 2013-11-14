(function(root) {
/*! nome - v0.0.1 - 2013-11-13
 * Copyright (c) 2013 Ramon Lamana; Licensed MIT */
var define, require;

(function() {
	var registry = {}, seen = {};

	define = function(name, deps, callback) {
		registry[name] = { deps: deps, callback: callback };
	};

	require = function(name) {
		if (seen[name]) { return seen[name]; }
		seen[name] = {};

		var mod = registry[name];
		if (!mod) {
			throw new Error("Module '" + name + "' not found.");
		}

		var deps = mod.deps,
				callback = mod.callback,
				reified = [],
				exports;

		for (var i=0, l=deps.length; i<l; i++) {
			if (deps[i] === 'exports') {
				reified.push(exports = {});
			} else {
				reified.push(require(deps[i]));
			}
		}

		var value = callback.apply(this, reified);
		return seen[name] = exports || value;
	};
})();
define("device", 
  ["emitter","extend","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    /*
     * Nome
     *
     * Copyright (c) 2013 Ramon Lamana
     * Licensed under the MIT license.
     */

    /* global WebSocket: false */

    var Emitter = __dependency1__["default"];
    var extend = __dependency2__["default"];

    var Device = function() {
    	Emitter.apply(this);

    	this.connected = false;
    };

    Device.prototype = extend(Emitter.prototype, {
    	get connected() {
    		return this._connected;
    	},

    	set connected(value) {
    		if(typeof this._connected === 'undefined') {
    			this._connected = value;
    		}
    	},
    	
    	connect: function(host, port) {
    		var websocket;
    		port = port || '5555';
    		host = host || '127.0.0.1';

    		websocket = this._websocket = new WebSocket('ws://' + host + ':' + port);

    		websocket.onerror = function(){
    			console.error('Could not connected to Monode server @ ' + host + ':' + port);
    		};

    		websocket.onopen = function() {
    			this._connected = true;
    			console.log('Connected to Monode server @ ' + host + ':' + port);
    			this.emit('connected');
    		}.bind(this);

    		websocket.onmessage = function(data) {
    			data = JSON.parse(data.data);

    			// @todo Check if event is in a list of valid events
    			if(data.event) {
    				this.emit.apply(this, [data.event].concat(data.args));
    			}
    		}.bind(this);

    		return this;
    	},

    	led: function(x, y, s) {
    		if(this.connected) {
    			this._websocket.send(JSON.stringify({
    				method: 'led',
    				args: [x,y,s]
    			}));
    		}
    		else {
    			console.warn('led: Not connected to any Monode server');
    		}
    	},

    	_websocket: null
    });

    __exports__["default"] = Device;
  });
define("emitter", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /*
     * Nome
     *
     * Copyright (c) 2013 Ramon Lamana
     * Licensed under the MIT license.
     */

    function Emitter() {
    	this._listeners = {};
    }

    function equals(handler, scope, expected) {
    	return function(item) {
    		return (
    			item.funct === handler &&
    			item.scope === scope
    		) === expected;
    	};
    }

    function hasListener(listeners, listener, handler, scope) {
    	if (!listeners[listener]) {
    		return false;
    	}

    	return listeners[listener].some(equals(handler, scope, true));
    }

    Emitter.prototype = {
    	on: function on(listener, handler, scope) {
    		var list = this._listeners;

    		if (hasListener(list, listener, handler, scope)) {
    			return;
    		}

    		if (!list[listener]) {
    			list[listener] = [];
    		}

    		list[listener].push({
    			funct: handler,
    			scope: scope
    		});
    	},

    	off: function off(listener, handler, scope) {
    		var list = this._listeners[listener];
    		if (!list) {
    			return;
    		}

    		this._listeners[listener] = list.filter(equals(handler, scope, false));
    	},

    	once: function once(listener, handler, scope) {
    		if (hasListener(this._listeners, listener, handler, scope)) {
    			return;
    		}

    		this.on(listener, function wrapper() {
    			this.off(listener, wrapper, this);
    			handler.apply(scope, arguments);
    		}, this);
    	},

    	emit: function emit(listener/*, var_args*/) {
    		var list = this._listeners[listener];
    		if (!list) {
    			return;
    		}

    		var data = Array.prototype.slice.call(arguments, 1);
    		list.forEach(function(item) {
    			item.funct.apply(item.scope, data);
    		});
    	}
    };

    __exports__["default"] = Emitter;
  });
define("extend", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /*
     * Nome
     *
     * Copyright (c) 2013 Ramon Lamana
     * Licensed under the MIT license.
     */

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

    __exports__["default"] = extend;
  });
define("nome", 
  ["device","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    /* jslint unused: false */

    var Device = __dependency1__["default"];
    __exports__.Device = Device;
  });
    if (typeof define === 'function' && define.amd) {define(nome);}
    else {root.Nome = require("nome");}
}(this));