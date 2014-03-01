// import needed libraries (installed with npm)
var express = require('express');
var fs = require('fs');
var exphbs = require('express3-handlebars');

var app = express();

var POSTS_FILE = 'posts.json';

// detail, not sure why express does't do this automatically
app.use(express.urlencoded());
// tell express to print requests in the console as they come in
app.use(express.logger());
// tell express to use handlebars as templating engine
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// tell express how to handle requests
app.get('/', function(req, res) {
	fs.readFile(POSTS_FILE, function(err, contents) {
		if(err) throw err;
		var posts = JSON.parse(contents);
		res.render('index', {posts: posts});
	});
});

app.get('/write', function(req, res) {
	res.render('write');
});

app.post('/save', function(req, res) {
	// load posts
	fs.readFile(POSTS_FILE, function(err, contents) {
		if(err) throw err;
		var posts = JSON.parse(contents);
		// construct our new post from data received in request
		var post = {
			title: req.body.title,
			body: req.body.body
		};
		// insert our new post
		posts.push(post);
		// serialize posts back to a string
		var serialized = JSON.stringify(posts, null, 2);
		// save posts with new one added
		fs.writeFile(POSTS_FILE, serialized, function(err) {
			if(err) throw err;
			console.log('posts saved');
			res.redirect('/'); // send user back to index
		});
	});
});

app.listen(3000, function() {
	console.log('listening on http://localhost:3000/');
});
