var express = require('express');
var app = express();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var users = [
    {login: 'cpele', password: 'secret'},
    {login: 'otheruser', password: 'secret2'}
];

app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new LocalStrategy(
        {session: true},
        function (username, password, done) {
            for (var i = 0; i < users.length; i++) {
                if (users[i].login === username) {
                    if (password === users[i].password) {
                        return done(null, users[i]);
                    } else {
                        return done(null, false);
                    }
                }
            }
            return done(null, false);
        }));

passport.serializeUser(function (user, done) {
    done(null, user.login);
});

passport.deserializeUser(function (login, done) {
    done(null, users.filter(function (item) {
        return item.login === login;
    }));
});

app.get('/', function (req, res) {
    res.send('Hello!');
});

app.get('/sayhellotome',
    passport.authenticate('local', {failureRedirect: '/'}),
    function (req, res) {
        res.send('Hello, ' + req.user.login + '!');
    });

var server = app.listen(3000, function () {
    var port = server.address().port;

    console.log('Hello API listening at port %s', port);
});