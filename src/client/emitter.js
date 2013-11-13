
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

function hasListener(listeners, signal, handler, scope) {
	if (!listeners[signal]) {
		return false;
	}

	return listeners[signal].some(equals(handler, scope, true));
}

Emitter.prototype = {
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

	off: function off(signal, handler, scope) {
		var list = this._listeners[signal];
		if (!list) {
			return;
		}

		this._listeners[signal] = list.filter(equals(handler, scope, false));
	},

	once: function once(signal, handler, scope) {
		if (hasListener(this._listeners, signal, handler, scope)) {
			return;
		}

		this.on(signal, function wrapper() {
			this.off(signal, wrapper, this);
			handler.apply(scope, arguments);
		}, this);
	},

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

export default Emitter;
