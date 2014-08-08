var net = require('net');

if(process.argv.length != 5) {
	console.log('usage: node client.js <host> <port> <username>');
	process.exit(-1);
}

var connect_to = {
	host: process.argv[2],
	port: parseInt(process.argv[3])
};

var username = process.argv[4];

var socket = net.connect(connect_to, function() {
	socket.setEncoding('utf8');
	
	socket.write(JSON.stringify({
		'name': username
	}));

	socket.on('data', function(data) {
		var parsed = JSON.parse(data);
		if(parsed.message) {
			process.stdout.write(parsed.username + ': ' + parsed.message);
		} else if(parsed.joined) {
			console.log(parsed.joined, 'joined');
		} else if(parsed.left) {
			console.log(parsed.left, 'left');
		} else if(parsed.already_here) {
			console.log('Welcome! These lovely people are already here:', parsed.already_here);
		}
		process.stdout.write('> ');
	});

	socket.on('end', function() {
		console.log('server stopped!');
		process.exit(-1);
	});

});

process.stdin.setEncoding('utf8');

process.stdin.on('data', function(data) {
	
	socket.write(JSON.stringify({
		'message': data
	}));

	process.stdout.write('> ');
});
