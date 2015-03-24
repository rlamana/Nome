/**
 * Nome
 *
 * Copyright (c) 2013 Ramon Lamana
 * Licensed under the MIT license.
 */

var port = 5555;
var monode = require('monode')();

var WebSocketServer = require('ws').Server;
var server = new WebSocketServer({
	port: port
});

var clients = [];
clients.broadcast = function(data) {
	for(var i=this.length;i--;) {
		this[i].send(data);
	}
};

console.log('Listening on port ' + port);

// Device connected
var currentDevice = null; // @todoShould handle multple devices
monode.on('device', function(device) {
	currentDevice = device;
	// Device event handlers
	device.on('key', function(x, y, s) {
		clients.broadcast(JSON.stringify({
			device: device.id,
			event: 'key',
			args: [x,y,s]
		}));
	});
});

monode.on('disconnect', function(device){
	console.log('A device was disconnected:', device);
	currentDevice = null;
});


// Server event handlers

server.on('connection', function(websocket) {
	clients.push(websocket);

	console.log(' + New client on port ' + port);

	websocket.on('message', function(data) {
		if (!currentDevice) {
			return;
		}

		data = JSON.parse(data);

		if(data.method && currentDevice[data.method]) {
			currentDevice[data.method].apply(currentDevice, data.args);
		}
	});
});
