#!/usr/local/bin/node

var Emitter = require('./emitter');
var extend = require('./extend');

var WebSocket = require('ws');

var Monome = function() {
	Emitter.apply(this);

	this.connected = false;
};

Monome.prototype = extend(Emitter.prototype, {
	get connected() {
		return this._connected;
	},

	set connected() {
		if(typeof this._connected === 'undefined')
			this._connected = false;
	},

	connect: function(host, port) {
		var websocket;
		port = port || '5555';
		host = host || '127.0.0.1';

		websocket = this._websocket = new WebSocket('ws://' + host + ':' + port);
		websocket.on('open', (function() {
			this._connected = true;
			console.log('Connected to Monode server @ ' + host + ':' + port);
			this.emit('connected');
		}).bind(this));

		websocket.on('message', (function(data, flags) {
			this.emit('message', data, flags);
		}).bind(this));

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


/////////

var monome = new Monome();
monome.connect().on('connected', function() {
	monome.led(2,3,1);
});










