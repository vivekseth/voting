var utility = require('../utility');

exports.registerRoutes = function(app, connection) {
	app.get('/', staticRenderHandler('index', {}));
	app.get('/users', userListRoute);
	app.get('/users/:pid', userValidationRoute);
}

var staticRenderHandler = function(path, data) {
	return function (req, res) {
		res.render(path, data);
	}
}

var userListRoute = function(req, res) {

}

var userValidationRoute = function(req, res) {
	
}