/*
 * Nome
 *
 * Copyright (c) 2013 Ramon Lamana
 * Licensed under the MIT license.
 */

/* global WebSocket: false */

import Emitter from 'emitter';
import extend from 'extend';

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

export default Device;

