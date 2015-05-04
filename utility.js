var multiline = require('multiline').stripIndent;
var crypto = require('crypto');

exports.staticRenderHandler = function(path, data) {
	return function (req, res) {
		res.render(path, data);
	}
}

// connection: mysql connection
// controllerHandler: function(connection, req, res);
exports.handlerGenerator = function(connection, controllerHandler) {
	return function(req, res) {
		controllerHandler(connection, req, res);
	}
}

exports.multiline = multiline;

exports.random512 = function() {
	return crypto.randomBytes(64).toString('base64');
}