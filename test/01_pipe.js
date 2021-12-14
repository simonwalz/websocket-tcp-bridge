#!/usr/bin/env node
/*
 * This file tests "pipe.js" and the test functions.
 */

var name = "01 pipe: ";

const test = require('tape');

const WebSocket = require("ws");
const child_process = require("child_process");

var port = Math.floor(Math.random() * 40000)+8000;

const wss = new WebSocket.Server({ port: port });
let cp;

test(name + 'wait for connection', function (t) {
	t.plan(1);

	wss.on('connection', function connection(ws) {
		//console.log("[ws] connected");
		ws.on('message', function message(data) {
			//console.log("[ws] data", data.toString());
			ws.send(data);
		});
	});
	setTimeout(function() {
		cp = child_process.execFile(__dirname + "/../pipe.js",
				["ws://localhost:" + port], {
			timeout: 10*1000,
			stdio: ['pipe', 'pipe', 'inherit']
		});
		cp.on("error", function(err) {
			throw err;
		});
	}, 100);

	setTimeout(function() {
		t.ok(1, "opened");
	}, 200);
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
		wss.close();
		t.ok(1, "closed");
	}, 100);
});
