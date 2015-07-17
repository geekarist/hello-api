var express = require('express');
var app = express();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var expressSession = require('express-session');

app.use(expressSession({secret: 'keyboard cat', resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());

// User repository
var users = [
    {username: 'cpele', password: 'secret'},
    {username: 'otheruser', password: 'secret2'}
];

// Find user by name and launch done callback
var findUserByName = function (username, password, done) {
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
};

// Use local strategy to authenticate user by name
passport.use(new LocalStrategy(findUserByName));

// Serialize user into session when authenticating
passport.serializeUser(function (user, done) {
    console.log('Serializing %s', JSON.stringify(user));
    done(null, user.username);
});

// Deserialize user from session
passport.deserializeUser(function (username, done) {
    var matchingUsers = users.filter(function (item) {
        return item.username === username;
    });
    var u = matchingUsers[0];
    console.log('Deserializing %s', JSON.stringify(u));
    done(null, u);
});

// Check if user is authenticated or send Unauthorized status
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.sendStatus(401);
}

// Say hello to user if she is authenticated
app.get('/', ensureAuthenticated, function (req, res) {
    res.send('Hello ' + req.user.username + '!');
});

// User authentication endpoint
app.get('/login',
    passport.authenticate('local', {failureRedirect: '/'}),
    function (req, res) {
        res.send('Ok ' + req.user.username + ', you\'re in!');
    });

// User logout endpoint
app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

// Launch server
var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Hello API listening at port %s', port);
});