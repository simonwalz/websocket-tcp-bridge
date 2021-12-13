#!/usr/bin/env node

/*
 * This file tests "pipe.js", "client.js" and "index.js" in one overall test
 *
 * All programs are bind to each other:
 * (stdio*) > pipe.js > (WS server) > index.js > (TCP server) >
 * client.js > (WS echo server*)
 *
 * (* = internal)
 */

var name = "02 all: ";
var port = Math.floor(Math.random() * 40000)+8000;
var port_ws1 = port;
var port_tcp = port+1;
var port_ws2 = port+2;

const test = require('tape');

const WebSocket = require("ws");
const child_process = require("child_process");

const wss = new WebSocket.Server({ port: port_ws1 });
let cp;

test(name + 'wait for connection', function (t) {
	t.plan(1);

	wss.on('connection', function connection(ws) {
		//console.log("[ws] connected");
		ws.on("error", function(err) {
			throw err;
		});
		ws.on('message', function message(data) {
			//console.log("[ws] data", data.toString());
			ws.send(data);
		});
		ws.on("close", function(err) {
			console.log("ws closed");
		});
	});
	wss.on("error", function(err) {
		throw err;
	});
	cp_c = child_process.execFile(__dirname + "/../client.js",
			[port_tcp, "ws://localhost:" + port_ws1], {
		timeout: 10*1000,
		stdio: ['pipe', 'pipe', 'inherit']
	});
	cp_c.on("error", function(err) {
		throw err;
	});
	cp_c.on("close", function(err) {
		console.log("C closed");
	});
	cp_i = child_process.execFile(__dirname + "/../index.js",
			[port_ws2, "localhost", port_tcp], {
		timeout: 10*1000,
		stdio: ['pipe', 'pipe', 'inherit']
	});
	cp_i.on("error", function(err) {
		throw err;
	});
	cp_i.on("close", function(err) {
		console.log("I closed");
	});
	cp = child_process.execFile(__dirname + "/../pipe.js",
			["ws://localhost:"+port_ws2], {
		timeout: 10*1000,
		stdio: ['pipe', 'pipe', 'inherit']
	});
	cp.on("error", function(err) {
		throw err;
	});
	cp.on("close", function(err) {
		console.log("CP closed");
	});

	setTimeout(function() {
		t.ok(1, "opened");
	}, 100);
});


test(name + 'send message', function (t) {
	t.plan(1);

	let tid = setTimeout(function() {
		t.ok(0, "timeout");
	}, 5000);

	cp.stdout.on("data", function(d) {
		clearTimeout(tid);
		//console.log("[stdout] data", d.toString());
		t.equal(d.toString(), "Hallo Welt\n", "recieve message");
	});

	cp.stdin.write("Hallo Welt\n");
});
test(name + 'close test', function (t) {
	t.plan(1);
	setTimeout(function() {
		cp.kill('SIGHUP');
		cp_c.kill('SIGHUP');
		cp_i.kill('SIGHUP');
		wss.close();
		t.ok(1, "closed");
	}, 100);
});
