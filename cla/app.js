
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
var mysql = require('mysql');

/** User Includes */
var routes = require('./routes');
var user = require('./routes/user');
var CONSTANTS = require('../constants').constants;
var IndexController = require('./controllers/IndexController');

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

/** MySQL Setup*/
var connection = mysql.createConnection({
	host: CONSTANTS.host,
	user: CONSTANTS.user,
	password: CONSTANTS.password,
	database: CONSTANTS.cla_database
});
connection.connect();

/** Routes */
IndexController.registerRoutes(app, connection);


