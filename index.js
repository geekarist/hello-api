var express = require('express');
var app = express();
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var expressSession = require('express-session');

app.use(expressSession({secret: 'keyboard cat', resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());

// User repository
var users = ['cpele', 'otheruser'];

// Use local strategy to authenticate user by name
passport.use(new GoogleStrategy({
    clientID: '381577767512-5h4kaf2umdc3i9818ventljihlhmpavo.apps.googleusercontent.com',
    clientSecret: 'bg9RPRO8mvleUTxbl8nPk-XS',
    callbackURL: 'http://localhost:3000/auth/google/callback'
}, function (accessToken, refreshToken, profile, done) {
   return done(null, profile);
}));

// Serialize user into session when authenticating
passport.serializeUser(function (user, done) {
    done(null, user);
});

// Deserialize user from session
passport.deserializeUser(function (obj, done) {
    done(null, obj);
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
    res.send('Hello ' + req.user.id + '!');
});

app.get('/login',
    passport.authenticate('google', {scope: ['https://www.googleapis.com/auth/plus.login']}),
    function (req, res) {});

app.get('/unauthorized', function (req, res) {res.sendStatus(401)});

// User authentication endpoint
app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/unauthorized',
        successRedirect: '/'
    }));

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