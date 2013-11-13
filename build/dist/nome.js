/*! nome - v0.0.1 - 2013-11-13
* Copyright (c) 2013 Ramon Lamana; Licensed MIT */
define("client", 
  ["emitter","extend"],
  function(__dependency1__, __dependency2__) {
    "use strict";
    var Emitter = __dependency1__["default"];
    var extend = __dependency2__["default"];

    var WebSocket = require('ws');

    var Monome = function() {
            Emitter.apply(this);

            this.connected = false;
    };

    Monome.prototype = extend(Emitter.prototype, {
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

                    websocket.on('error', function(){
                            console.error('Could not connected to Monode server @ ' + host + ':' + port);
                    });

                    websocket.on('open', function() {
                            this._connected = true;
                            console.log('Connected to Monode server @ ' + host + ':' + port);
                            this.emit('connected');
                    }.bind(this));

                    websocket.on('message', function(data) {
                            data = JSON.parse(data);

                            // @todo Check if event is in a list of valid events
                            if(data.event) {
                                    this.emit.apply(this, [data.event].concat(data.args));
                            }
                    }.bind(this));

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


    ///////// example

    var monome = new Monome();
    monome.connect().on('connected', function() {

    });

    var grid = {};

    monome.on('key', function(x,y,s) {
            var id = x+''+y;
            if(s) {
                    console.log('KEY: ', x, y);
                    if(!grid[id]) {
                            grid[id] = 0;
                    }

                    grid[id] = !grid[id];
                    monome.led(x, y, grid[id]);
            }
    });
  });
define("emitter", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /**
     * interface Emitter {
     *   void on(String signal, Function handler, [Object scope]);
     *   void off(String signal, Function handler, [Object scope]);
     *   void once(String signal, Function handler, [Object scope]);
     *   void emit(String signal, Object var_args...);
     * }
     *
     * Provides a constructor to listen and emit signals.
     */

    function equals(handler, scope, expected) {
    	return function(item) {
    		return (
    			item.funct === handler &&
    			item.scope === scope
    		) === expected;
    	};
    }

    function hasListener(listeners, signal, handler, scope) {
    	if (!listeners[signal]) {
    		return false;
    	}

    	return listeners[signal].some(equals(handler, scope, true));
    }

    /**
     * Creates an object with methods to add callbacks (listeners)
     *   to specific signals and invoke this callbacks.
     */
    function Emitter() {
    	this._listeners = {};
    }

    Emitter.prototype = {
    	/**
    	 * Returns the count of listeners for a specific signal.
    	 *
    	 * @param signal <String> The signal we want to count listeners from.
    	 * @returns <Number> The count.
    	 */
    	listenersCount: function(signal) {
    		var list = this._listeners[signal];
    		return  list ? list.length : 0;
    	},

    	/**
    	 * Adds a listener to a signal, optionally a scope can be provided.
    	 * NOTE: Calling this method with the same arguments will NOT add a new listener.
    	 *
    	 * @param signal <String> The signal to listen.
    	 * @param handler <Function> The callback function.
    	 * @param scope <Object?> The scope for the callback.
    	 */
    	on: function on(signal, handler, scope) {
    		var list = this._listeners;

    		if (hasListener(list, signal, handler, scope)) {
    			return;
    		}

    		if (!list[signal]) {
    			list[signal] = [];
    		}

    		list[signal].push({
    			funct: handler,
    			scope: scope
    		});
    	},

    	/**
    	 * Removes the listener added with exactly the same arguments.
    	 *
    	 * @param signal <String> The signal from we want to remove the listener.
    	 * @param handler <Function> The callback passed to .on() method.
    	 * @param scope <Object> The scope for the callback.
    	 */
    	off: function off(signal, handler, scope) {
    		var list = this._listeners[signal];
    		if (!list) {
    			return;
    		}

    		this._listeners[signal] = list.filter(equals(handler, scope, false));
    	},

    	/**
    	 * Adds a listener to be fired only the next time the signal is emitted.
    	 *
    	 * @param signal <String> The signal to listen.
    	 * @param handler <Function> The callback function.
    	 * @param scope <Object?> The scope for the callback.
    	 */
    	once: function once(signal, handler, scope) {
    		if (hasListener(this._listeners, signal, handler, scope)) {
    			return;
    		}

    		this.on(signal, function wrapper() {
    			this.off(signal, wrapper, this);
    			handler.apply(scope, arguments);
    		}, this);
    	},

    	/**
    	 * Executes the callbacks for the given signal.
    	 * Any extra argument will be passed to the callback.
    	 *
    	 * @param signal <String> The signal of the listeners we want to invoke.
    	 * @param var_args <object...> Any arguments we want the callbacks to recive.
    	 */
    	emit: function emit(signal/*, var_args*/) {
    		var list = this._listeners[signal];
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