#!/usr/local/bin/node

var monode = require('monode')();
monode.on('device', function(device) {

	var Monome = function(device) {
		this.device = device;
	};

	Monome.prototype = {
		clear: function() {
			for(var i=0, row, column; i<64; i++) {
				row = i%8;
				column = Math.floor(i/8);

				this.device.led(row,column,0);
			}
		},

		all: function() {
			for(var i=0, row, column; i<64; i++) {
				row = i%8;
				column = Math.floor(i/8);

				device.led(row,column,1);
			}
		},

		disconnect: function() {
			this.clear();
			this.device.close();
		}
	};

	var queue = Monome.queue = function(callback, delay) {
		setTimeout(callback, delay||0);
	};

	var monome = new Monome(device);
	monome.clear();

	function tail(x, y) {
		x = x||0;
		y = y||0;

		var init = y*8 + x;

		var interval = 50;
		for(var i=init, row, column, loop=0; i<64; i++,loop++) {
			row = i%8;
			column = Math.floor(i/8);

			queue((function(row, column){
				return function() {
					monome.device.led(row,column,1);
					queue(function(){
						monome.device.led(row,column,0);
					}, interval);
				};
			})(row, column), interval*loop);
		}
	}

	monome.device.on('key', function(x,y,s) {
		// on press
		if(s === 1) {
			tail(x,y);
		}
	});
});
