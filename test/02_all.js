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

const test = require('tape');

const WebSocket = require("ws");
const child_process = require("child_process");

const wss = new WebSocket.Server({ port: 8003 });
let cp;

test('wait for connection', function (t) {
	t.plan(1);

	wss.on('connection', function connection(ws) {
		//console.log("[ws] connected");
		ws.on('message', function message(data) {
			//console.log("[ws] data", data.toString());
			ws.send(data);
		});
	});
	cp_c = child_process.fork(__dirname + "/../client.js",
			[8004, "ws://localhost:8003"], {
		timeout: 10*1000,
		stdio: 'pipe'
	});
	cp_c.on("error", function(err) {
		throw err;
	});
	cp_i = child_process.fork(__dirname + "/../index.js",
			[8005, "localhost", 8004], {
		timeout: 10*1000,
		stdio: 'pipe'
	});
	cp_i.on("error", function(err) {
		throw err;
	});
	cp = child_process.fork(__dirname + "/../pipe.js",
			["ws://localhost:8005"], {
		timeout: 10*1000,
		stdio: 'pipe'
	});
	cp.on("error", function(err) {
		throw err;
	});

	setTimeout(function() {
		t.ok(1, "opened");
	}, 100);
});


test('send message', function (t) {
	t.plan(1);

	let tid = setTimeout(function() {
		t.ok(0, "timeout");
	}, 2000);

	cp.stdout.on("data", function(d) {
		clearTimeout(tid);
		//console.log("[stdout] data", d.toString());
		t.equal(d.toString(), "Hallo Welt\n", "recieve message");
	});

	cp.stdin.write("Hallo Welt\n");
});
test('close test', function (t) {
	t.plan(1);
	setTimeout(function() {
		cp.kill('SIGHUP');
		cp_c.kill('SIGHUP');
		cp_i.kill('SIGHUP');
		wss.close();
		t.ok(1, "closed");
	}, 100);
});
