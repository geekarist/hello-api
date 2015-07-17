var express = require('express');
var app = express();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');

var users = [
    {login: 'cpele', password: 'secret'},
    {login: 'otheruser', password: 'secret2'}
];

// TODO use cookie parser, body parser? app.router?
app.use(session({secret: 'keyboard cat', resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new LocalStrategy(
        function (username, password, done) {
            console.log('Checking %s: %s', username, password);
            for (var i = 0; i < users.length; i++) {
                if (users[i].login === username) {
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
    done(null, user.login);
});

passport.deserializeUser(function (login, done) {
    var matchingUsers = users.filter(function (item) {
        return item.login === login;
    });
    var u = matchingUsers[0];
    console.log('Deserializing %s', JSON.stringify(u));
    done(null, u);
});

app.get('/', function (req, res) {
    res.send('Hello!');
});

app.get('/sayhellotome',
    passport.authenticate('local', {failureRedirect: '/'}),
    function (req, res) {
        res.send('Hello, ' + req.user.login + '!');
    });

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

var server = app.listen(3000, function () {
    var port = server.address().port;

    console.log('Hello API listening at port %s', port);
});