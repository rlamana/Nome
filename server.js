#!/usr/local/bin/node --debug

var port = 5555;
var monode = require('monode')();

monode.on('device', function(device) {
	var WebSocketServer = require('ws').Server;
	var server = new WebSocketServer({
		port: port
	});

	console.log('Listening to port ' + port);


 	// Server event handlers

	server.on('connection', function(websocket) {
		console.log(' + New client on port ' + port);
	    
	    websocket.on('message', function(data) {
	        data = JSON.parse(data);

	        if(data.method && device[data.method]) {
	        	device[data.method].apply(device, data.args);
	        }
	    });
	
		// Device event handlers
		device.on('key', function(x, y, s) {
			websocket.send(JSON.stringify({
				device: device.id,
				event: 'key',
				args: [x,y,s]
			}));
		});
	});
});