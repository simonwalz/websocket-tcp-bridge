#!/usr/bin/env node

const net = require("net");
const WebSocket = require("ws");

//var wpath = "wss://sw.nerdbox.de/ds/8254jzm9s5nh.socket";

if (process.argv.length < 4) {
	console.log("Usage: prog localport wpath");
	process.exit(2);
}

var port = +process.argv[2];
var wpath = process.argv[3];

const server = new net.Server();

server.listen(port, function() {
	console.log('The server is listening for connection requests');
});

server.on('connection', function(socket) {
	//socket.setEncoding("ascii");
	socket.setKeepAlive(true);

	console.log("New Connection");
	var buffer = [];
	var ws = new WebSocket(wpath);
	ws.on("open", function() {
		console.log("SENDING BUFFER");
		buffer.forEach(function(b) {
			ws.send(b);
		});
		buffer = null;
	});
	ws.on("message", function(message) {
		socket.write(message);
	});
	ws.on("close", function() {
		console.log("WebSocket closed.");
		if (socket.readyState === "open") {
			console.log("end socket");
			socket.end();
		} else {
			ws.on("open", function() {
				console.log("end socket");
				socket.end();
			});
		}
	});
	ws.on("error", function(err) {
		console.log("ws error", err);
	});

	var first = true;
	socket.on('data', function(chunk) {
		if (first) {
			console.log(chunk.toString());
			first = false;
		}
		//console.log('Data received from client.');
		if (buffer !== null) {
			buffer.push(chunk);
		} else {
			if (ws.readyState === WebSocket.OPEN)
				ws.send(chunk);
		}
	});
	socket.on('end', function() {
		console.log('tcp closed.');
		setTimeout(function() {
			ws.close();
		}, 2000);
	});
	socket.on('error', function(err) {
		console.log("tcp error", err);
	});
});
