#!/usr/bin/env node
/*
 * This file tests "pipe.js" and the test functions.
 */

const test = require('tape');

const WebSocket = require("ws");
const child_process = require("child_process");

const wss = new WebSocket.Server({ port: 8001 });
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
	cp = child_process.fork(__dirname + "/../pipe.js",
			["ws://localhost:8001"], {
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

	cp.stdout.on("data", function(d) {
		//console.log("[stdout] data", d.toString());
		t.equal(d.toString(), "Hallo Welt\n", "recieve message");
	});

	cp.stdin.write("Hallo Welt\n");
});
test('close test', function (t) {
	t.plan(1);
	setTimeout(function() {
		cp.kill('SIGHUP');
		wss.close();
		t.ok(1, "closed");
	}, 100);
});
