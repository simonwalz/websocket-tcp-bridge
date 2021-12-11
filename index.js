#!/usr/bin/env node

const net = require("net");
const WebSocket = require("ws");

if (process.argv.length < 5) {
	console.log("Usage: prog localport remotehost remoteport");
	process.exit(2);
}

var localport = +process.argv[2];
var tcp_HOST =  process.argv[3];
var tcp_PORT =  +process.argv[4];

//console.log(localport, tcp_HOST, tcp_PORT);

var wss = new WebSocket.Server({
	port: localport
});

wss.on("connection", function(ws, req) {
	var tcpClient = new net.Socket();
	tcpClient.setKeepAlive(true);

	var buffer = [];
	tcpClient.connect(tcp_PORT, tcp_HOST, function() {
		console.log("CONNECTED TO:", tcp_HOST + ':' + tcp_PORT);
		buffer.forEach(function(b) {
			if (tcpClient.readyState === "open")
				tcpClient.write(b);
		});
		buffer = null;

		tcpClient.on("data", function(data) {
			if (ws.readyState === WebSocket.OPEN)
				ws.send(data);
		});
		tcpClient.on("error", function(err) {
			console.log("tcp error", err);
		});

		tcpClient.on("end", function(data) {
			console.log("TCP closed.");
			if (ws.readyState === WebSocket.OPEN)
				ws.close();
		});
	});

	var first = true;
	ws.on("message", function(message) {
		if (first) {
			console.log(message.toString());
			first = false;
		}
		if (buffer !== null) {
			buffer.push(message);
		} else {
			if (tcpClient.readyState === "open")
				tcpClient.write(message);
		}
	});
	ws.on("error", function(err) {
		console.log("ws error", err);
	});
	ws.on("close", function(err) {
		console.log("WebSocket closed.");
		if (tcpClient.readyState === "open")
			tcpClient.end();
	});
});
