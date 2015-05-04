
/** Constants */
var SSL_PORT = 4430;
var SSL_KEY = '../ssl/server.key';
var SSL_CERT = '../ssl/server.crt';

/** Node Modules*/
var fs = require('fs');
var path = require('path');
var http = require('http');
var https = require('https');
var express = require('express');

/** User Includes */
var routes = require('./routes');
var user = require('./routes/user');

/** App Setup */
var app = express();
app.set('port', SSL_PORT);
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

/** HTTPS Server */
var privateKey  = fs.readFileSync(SSL_KEY, 'utf8');
var certificate = fs.readFileSync(SSL_CERT, 'utf8');
var credentials = {key: privateKey, cert: certificate};
var httpsServer = https.createServer(credentials, app).listen(SSL_PORT);

/** Routes */
app.get('/', routes.index);
app.get('/users', user.list);
