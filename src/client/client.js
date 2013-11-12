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










