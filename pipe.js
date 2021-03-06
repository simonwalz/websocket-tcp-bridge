#!/usr/bin/env node

const process = require("process");
const WebSocket = require("ws");

console.error = ()=>{};

if (process.argv.length < 3) {
	console.log("Usage: prog wpath");
	process.exit(2);
}

var wpath = process.argv[2];

var buffer = [];
var ws = new WebSocket(wpath);
ws.on("open", function() {
	console.error("SENDING BUFFER");
	buffer.forEach(function(b) {
		ws.send(b);
	});
	buffer = null;
});
ws.on("message", function(message) {
	process.stdout.write(message);
});
ws.on("close", function() {
	console.error("WebSocket closed.");
	process.exit();
});
ws.on("error", function(err) {
	console.error("ws error", err);
});

var first = true;
process.stdin.on('data', function(chunk) {
	if (first) {
		console.error(chunk.toString());
		first = false;
	}
	//console.error('Data received from client.');
	if (buffer !== null) {
		buffer.push(chunk);
	} else {
		if (ws.readyState === WebSocket.OPEN)
			ws.send(chunk);
	}
});
process.stdin.on('end', function() {
	console.error('stdin closed.');
	setTimeout(function() {
		ws.close();
	}, 2000);
});
