#!/usr/bin/env node

const net = require("net");
const WebSocket = require("ws");

//var tcp_HOST = "localhost";
var tcp_HOST = "nerdbox.de";
//var tcp_PORT = 8024;
var tcp_PORT = 22;

var wss = new WebSocket.Server({
	port: 8023
});

wss.on("connection", function(ws, req) {
	var tcpClient = new net.Socket();
	//tcpClient.setEncoding("ascii");
	tcpClient.setKeepAlive(true);

	var buffer = [];
	tcpClient.connect(tcp_PORT, tcp_HOST, function() {
		console.info('CONNECTED TO : ' + tcp_HOST + ':' + tcp_PORT);
		buffer.forEach(function(b) {
			if (tcpClient.readyState === "open")
				tcpClient.write(b);
		});
		buffer = null;

		tcpClient.on('data', function(data) {
			if (ws.readyState === WebSocket.OPEN)
				ws.send(data);
		});
		tcpClient.on("error", function(err) {
			console.log("tcp error", err);
		});

		tcpClient.on('end', function(data) {
			console.log("TCP closed.");
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
	});
});
