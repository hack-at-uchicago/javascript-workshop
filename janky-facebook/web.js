// import needed libraries (installed with npm)
var express = require('express');
var session = require('express-session')
var exphbs = require('express-handlebars');

var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('database.sqlite3');

var app = express();

// detail, not sure why express doesn't do this automatically
app.use(express.urlencoded());
// tell express to print requests in the console as they come in
app.use(express.logger('tiny'));
app.use(session({secret: 'some_secret'}));
// tell express to use handlebars as templating engine
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// serve static files (jankyblog.js)
app.use(express.static(__dirname + '/public'));

// tell express how to handle requests
app.get('/', function(req, res) {
	res.render('home');
});

app.post('/login', function(req, res) {
    var sql = 'select * from people where email = ?';
    console.log(sql);
    db.get(sql, [req.body.email], function(err, row) {
        if(!row) {
            res.render('error', {message: "no such user"});
        } else if(req.body.password != row.password) {
            res.render('error', {message: "wrong password"});
        } else {
            req.session.person_id = row.id;
            res.redirect('/feed');
        }
    });
});

app.get('/logout', function(req, res) {
   req.session.person_id = null;
   res.redirect('/');
});

app.post('/signup', function(req, res) {
    var sql = "insert into people (name, email, password) values (?, ?, ?)";
    console.log(sql);
    db.run(sql, [req.body.name, req.body.email, req.body.password], function() {
        // just go home, you now have to log in
        res.redirect('/');
    });
});

app.get('/profile/:person_id', checkAuth, function(req, res) {
    var our_id = req.session.person_id;
    var other_id = req.params.person_id;
    var already_friends = false;
    db.get('select * from friendships where person_a_id = ? and person_b_id = ?',
        [our_id, other_id], function(err, result) {
        if(result) {
            already_friends = true;
        }
    });
    db.get('select * from friendships where person_b_id = ? and person_a_id = ?',
        [our_id, other_id], function(err, result) {
        if(result) {
            already_friends = true;
        }
    });
    db.get('select * from people where id = ?', req.params.person_id, function(err, person_info) {
        if(!person_info) {
            res.render('error', {message: 'no such person'});
        } else {
            res.render('profile', {
                person_name: person_info.name,
                already_friends: already_friends,
                person_id: person_info.id,
                posts: []
            });
        }
    });
});

app.get('/friend/:person_id', checkAuth, function(req, res) {
    var our_id = req.session.person_id;
    var their_id = req.params.person_id;
    console.log('person ' + our_id + ' friended person ' + their_id);
    db.run('insert into friendships (person_a_id, person_b_id) values (?, ?)',
        [our_id, their_id], function() {
        res.redirect('/profile/' + their_id);
    });
});

app.post('/friend_request', checkAuth, function(req, res) {
    var them_id = req.body.to_friend_id;
    var you_id = 1;
    // TODO: write friendship
    res.redirect('/profile/' + them_id);
});

app.get('/feed', checkAuth, function(req, res) {
    console.log(req.session.person_id);
    db.get('select * from people where id = ?', req.session.person_id, function(err, person_info) {
        console.log(person_info);
        res.render('feed', {
            person_name: person_info.name,
            posts: []
        });
    });
});

app.post('/post_to_wall', checkAuth, function(req, res) {
    
    res.redirect('/profile/');
});

function checkAuth(req, res, next) {
  if (!req.session.person_id) {
    res.render('error', {message: 'you gotta log in first'});
  } else {
    next();
  }
}

// start it up
app.listen(3000, function() {
	console.log('jankyfacebook listening on http://localhost:3000/');
});
