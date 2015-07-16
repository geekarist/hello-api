var express = require('express');
var app = express();

app.get('/', function (req, res) {
    res.send('Hello!');
});

app.get('/sayhellotome', function (req, res) {
    res.send('Hello, you!');
});

var users = [
    {login: 'cpele', password: 'secret'},
    {login: 'otheruser', password: 'secret2'}
];

var server = app.listen(3000, function () {
    var port = server.address().port;

    console.log('Hello API listening at port %s', port);
});