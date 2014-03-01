// import needed libraries (installed with npm)
var express = require('express');
var exphbs = require('express3-handlebars');
var db = require('./jankydb');

var app = express();
var db = new db.JankyDB('posts.json');

// detail, not sure why express does't do this automatically
app.use(express.urlencoded());
// tell express to print requests in the console as they come in
app.use(express.logger());
// tell express to use handlebars as templating engine
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// serve static files (jankyblog.js)
app.use(express.static(__dirname + '/public'));

// tell express how to handle requests
app.get('/', function(req, res) {
	db.getPosts(function(posts) {
		res.render('index', {posts: posts});
	});
});

app.get('/write', function(req, res) {
	res.render('write');
});

app.post('/save', function(req, res) {
	var post = {
		title: req.body.title,
		body: req.body.body,
		likes: 0
	};
	db.addPost(post, function() {
		console.log('posts saved');
		res.redirect('/'); // send user back to front page
	});
});

app.get('/like/:post_id', function(req, res) {
	var post_id = req.params.post_id;
	db.changePostLikes(post_id, 1, function() {
		res.send(201);
	});
});

app.get('/unlike/:post_id', function(req, res) {
	var post_id = req.params.post_id;
	db.changePostLikes(post_id, -1, function() {
		res.send(201);
	});
});

// start it up
app.listen(3000, function() {
	console.log('listening on http://localhost:3000/');
});
