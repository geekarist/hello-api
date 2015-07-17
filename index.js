var express = require('express');
var app = express();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var expressSession = require('express-session');

var users = [
    {username: 'cpele', password: 'secret'},
    {username: 'otheruser', password: 'secret2'}
];

// TODO body parser? app.router?
app.use(expressSession({secret: 'keyboard cat', resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new LocalStrategy(
        function (username, password, done) {
            console.log('Checking %s: %s', username, password);
            for (var i = 0; i < users.length; i++) {
                if (users[i].username === username) {
                    if (password === users[i].password) {
                        console.log('Password Ok for %s: %s', username, password);
                        return done(null, users[i]);
                    } else {
                        console.log('Wrong password for %s: %s', username, password);
                        return done(null, false);
                    }
                }
            }
            console.log('User not found: %s', JSON.stringify(username));
            return done(null, false);
        }));

passport.serializeUser(function (user, done) {
    console.log('Serializing %s', JSON.stringify(user));
    done(null, user.username);
});

passport.deserializeUser(function (username, done) {
    var matchingUsers = users.filter(function (item) {
        return item.username === username;
    });
    var u = matchingUsers[0];
    console.log('Deserializing %s', JSON.stringify(u));
    done(null, u);
});

app.get('/', function (req, res) {
    res.send('Hello!');
});

app.get('/sayhellotome', function (req, res, next) {
    passport.authenticate('local', function (err, user) {
        if (err) {
            console.log('Error');
            return next(err);
        }
        if (!user) {
            console.log('No user:', user);
            return res.sendStatus(401);
        }
        req.logIn(user, function (err) {
            if (err) {
                console.log('Error in logIn');
                return next(err);
            }
            console.log('Auth Ok');
            return res.send('Hello, ' + req.user.username + '!');
        })
    })(req, res, next);
});

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

var server = app.listen(3000, function () {
    var port = server.address().port;

    console.log('Hello API listening at port %s', port);
});