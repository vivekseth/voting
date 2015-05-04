
/**
 * Module dependencies.
 */

var routes = require('./routes');
var user = require('./routes/user');

var fs = require('fs');
var path = require('path');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('ssl/server.key', 'utf8');
var certificate = fs.readFileSync('ssl/server.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};
var express = require('express');

var app = express();


// all environments
app.set('port', 4430);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var httpsServer = https.createServer(credentials, app).listen(4430);
