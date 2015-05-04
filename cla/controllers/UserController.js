var utility = require('../utility');
var Users = require('../models/Users');
var Posts = require('../models/Posts');
var InterestedIn = require('../models/InterestedIn');
var passport = require('passport');

/** Routes */

exports.registerRoutes = function(app, connection) {
	app.get('/home', 
		utility.handlerGenerator(connection, userHomeRoute));
	
	app.post('/user/validate', 
		validateUserRoute);
	
	app.get('/user/new', 
		utility.authenticatedEndpointWithType('moderator'),
		utility.handlerGenerator(connection, newUserFormRoute));
	
	app.post('/user/new', 
		utility.handlerGenerator(connection, newUserRoute));
	
	app.get('/user/all', 
		utility.authenticatedEndpointWithType('moderator'), 
		utility.handlerGenerator(connection, allUserRoute));
	
	app.get('/user/:username', 
		utility.authenticatedEndpointWithType('moderator'), 
		utility.handlerGenerator(connection, userDetailsRoute));
	
	app.get('/user/:username/delete', 
		utility.authenticatedEndpointWithType('moderator'), 
		utility.handlerGenerator(connection, deleteUserRoute));
}

var validateUserRoute = passport.authenticate('local', { 
	successRedirect: '/home',
	failureRedirect: '/login',
	failureFlash: false 
});

/**
  "code": "ER_DUP_ENTRY",
 */
var newUserRoute = function(connection, req, res) {
	var username = req.body.username;
	var password = req.body.password;
	var type = 'user';
	if (req.user && req.user.type == 'moderator' && req.body.type) {
		type = req.body.type;
	}

	Users.registerUser(connection, {
		'username': username, 
		'password': password, 
		'type': type, 
	}, function(err, rows){
		if (err) {
			res.render('message', {
				'message': 'ERROR ('+err+')'
			});
		} else {
			res.render('message', {
				'message': 'created user ('+username+')'
			});
		}
	});
}

var newUserFormRoute = function(connection, req, res) {
	res.render('user/new');
}

var userHomeRoute = function(connection, req, res) {
	if (!req.isAuthenticated()) {
		res.redirect('/')
	} else {
		InterestedIn.allForUser(connection, req.user['username'], function(err, rows){
			var data = {};
			data['username'] = req.user['username'];
			data['type'] = req.user['type'];

			if (rows && rows.length > 0) {
				console.log(rows);

				data['interest_list'] = rows;
			} else {
				data['interest_list'] = [];
			}

			res.render('home', data);
		})	
	}
}

var allUserRoute = function(connection, req, res) {
	Users.all(connection, function(err, rows){
		res.render('user/all', {
			'users': rows
		});
	});
}

var userDetailsRoute = function(connection, req, res) {
	var username = req.param('username');
	Posts.allForUser(connection, username, function(err, rows){
		res.render('user/username', {
			'username': username, 
			'posts': rows,
		});
	});
}

var deleteUserRoute = function(connection, req, res) {
	var username = req.param('username');
	Users.delete(connection, username, function(err, rows){
		if (err) {
			res.render('message', {
				'message': 'ERROR ('+err+')'
			});
		} else {
			res.render('message', {
				'message': 'deleted user ('+username+')'
			});
		}
	});
}



// -- DONE -- 

// * app.get('/user/validate', homeController.render_user);
// app.post('/user/new', homeController.render_user);
	// grab data from form, 
	// only moderators
	// shows a new user created view
// app.get('/user/all', homeController.render_user);
	// list of all users 
	// only visible to moderators
// app.get('/user/:username/delete', homeController.render_user);
	// Deletes users, shows a user deleted view
	// only moderators
// app.get('/user/:username/', homeController.render_user);
	// View details about user, 
	// All can see, only moderators, can delete
// app.get('/user/new', homeController.render_user);
	// form for creating a new user
	// only visible to moderators