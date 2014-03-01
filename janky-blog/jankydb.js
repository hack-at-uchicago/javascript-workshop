var fs = require('fs');

function JankyDB(path) {
	this.path = path;
	if(!this.exists()) {
		this.initialize();
		console.log('initialized db');
	}
}

JankyDB.prototype.exists = function() {
	return fs.existsSync(this.path);
}

JankyDB.prototype.initialize = function() {
	var initial = {
		next_post_id: 0,
		posts: []
	};
	fs.writeFileSync(this.path, JSON.stringify(initial, undefined, 2));
}

JankyDB.prototype.getPosts = function(callback) {
	fs.readFile(this.path, function(err, res) {
		if(err) throw err;
		callback(JSON.parse(res).posts);
	});
}

JankyDB.prototype.addPost = function(post, callback) {
	var _this = this;
	fs.readFile(this.path, function(err, res) {
		if(err) throw err;
		var db = JSON.parse(res);
		post.id = db.next_post_id++;
		db.posts.push(post);
		fs.writeFile(_this.path, JSON.stringify(db, undefined, 2), function(err, res) {
			if(err) throw err;
			if(callback) callback(post.id);
		});
	});
}

JankyDB.prototype.changePostLikes = function(post_id, delta, callback) {
	var _this = this;
	fs.readFile(this.path, function(err, res) {
		if(err) throw err;
		var db = JSON.parse(res);
		for(var i=0; i < db.posts.length; i++) {
			var post = db.posts[i];
			if(post.id == post_id) {
				post.likes += delta;
				fs.writeFile(_this.path, JSON.stringify(db, undefined, 2), function(err, res) {
					if(err) throw err;
					if(callback) callback();
				});
			}
		}
	});
}

exports.JankyDB = JankyDB;
