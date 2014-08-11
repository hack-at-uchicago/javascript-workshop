var net = require('net');

var usernames = {}; // host:port => username
var sockets = {}; // username => conn

var server = net.createServer(function(socket) {
	socket.setEncoding('utf8');

	var host_port = socket.remoteAddress + ':' + socket.remotePort;
	console.log('someone connected from', host_port);

	socket.on('data', function(data) {

		var parsed = JSON.parse(data);

		if(parsed.name) {
			var new_un = parsed.name;
			// keep track
			usernames[host_port] = new_un;
			sockets[new_un] = socket;
			// already here
			sendAlreadyHereTo(socket, new_un);
			// joined
			sendToAllFrom(new_un, {
				'joined': new_un
			});
		} else if(parsed.message) {
			var what_they_said = parsed.message;
			var from_un = usernames[host_port];
			sendToAllFrom(from_un, {
				'message': what_they_said,
				'username': from_un
			});
		}

	});

	socket.on('error', function(err) {
		console.log('error:', err);
	});

	socket.on('end', function() {
		var left_un = usernames[host_port];
		delete usernames[host_port];
		delete sockets[left_un];
		sendToAllFrom(left_un, {
			'left': left_un
		});
	});

});

function sendAlreadyHereTo(socket, new_un) {
	var usernames = [];
	for(var un in sockets) {
		if(un != new_un) {
			usernames.push(un);
		}
	}
	socket.write(JSON.stringify({
		'already_here': usernames
	}));
}

function sendToAllFrom(from_un, message) {
	for(var to_un in sockets) {
		if(to_un != from_un) {
			var socket = sockets[to_un];
			socket.write(JSON.stringify(message));
		}
	}
}

var LISTEN_PORT = 8123;

server.listen(LISTEN_PORT, function() {
	console.log('jankychat listening on', LISTEN_PORT);
});
