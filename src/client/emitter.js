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

export default Emitter;
