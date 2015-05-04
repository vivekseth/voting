var utility = require('../utility');
var Interests = require('../models/Interests');
var InterestedIn = require('../models/InterestedIn');
var Posts = require('../models/Posts');
var CuratorPrivileges = require('../models/CuratorPrivileges');

exports.registerRoutes = function(app, connection){
	app.get('/interest/all', 
		utility.authenticatedEndpoint, 
		utility.handlerGenerator(connection, allInterestsRoute));

	app.get('/interest/new', 
		utility.authenticatedEndpointWithType('curator'), 
		utility.handlerGenerator(connection, newInterestFormRoute));

	app.post('/interest/new', 
		utility.authenticatedEndpointWithType('curator'), 
		utility.handlerGenerator(connection, newInterestRoute));

	app.get('/interest/:interestname', 
		utility.authenticatedEndpoint, 
		utility.handlerGenerator(connection, detailsInterestRoute));

	app.get('/interest/:interestname/delete', 
		utility.authenticatedEndpointWithType('curator'), 
		utility.handlerGenerator(connection, deleteInterestRoute));

	app.get('/interest/:interestname/follow', 
		utility.authenticatedEndpointWithType('user'), 
		utility.handlerGenerator(connection, followInterestRoute));

	app.get('/interest/:interestname/unfollow', 
		utility.authenticatedEndpointWithType('user'), 
		utility.handlerGenerator(connection, unfollowInterestRoute));
};

var allInterestsRoute = function(connection, req, res) {
	Interests.all(connection, function(err, rows){
		var data = {};
		data['username'] = req.user['username'];
		data['type'] = req.user['type'];

		if (rows && rows.length > 0) {
			data['interest_list'] = rows;
		} else {
			data['interest_list'] = [];
		}

		res.render('interest/all', data);
	});	
}

var detailsInterestRoute = function(connection, req, res) {
	var username = req.user.username;
	var interestname = req.param("interestname");
	Interests.details(connection, interestname, function(err, rows) {
		var interest = null;
		if (rows && rows.length > 0) {
			interest = rows[0];
		}
		Posts.allForInterest(connection, interestname, function(err, rows){
			InterestedIn.checkFollowing(connection, username, interestname, function(err, rows) {
				var isFollowing = (rows && (rows.length > 0));
				console.log(isFollowing);
				res.render('interest/details', {
					'interest' : interest,
					'posts': rows,
					'isFollowing': isFollowing,
				});
			});
		})
	});
}

// TODO(vivek): use curator permssions
var deleteInterestRoute = function(connection, req, res) {
	var username = req.user.username;
	var interestname = req.param('interestname');
	CuratorPrivileges.checkPrivilege(connection, username, interestname, function(err, rows) {
		if (rows && (rows.length > 0)) {
			Interests.delete(connection, interestname, function(err2, rows2) {
				if (err || err2) {
					res.render('message', {
						'message': 'ERROR. unable to delete interest'
					});
				} else {
					res.render('message', {
						'message': 'successfully deleted interest: \"' + interestname + '\"'
					});
				}
			});
		} else {
			res.render('message', {
				'message': 'ERROR you do not have permission to delete this interest.'
			});
		}
	});
}

var newInterestFormRoute = function(connection, req, res) {
	res.render('interest/new');
}

var newInterestRoute = function(connection, req, res) {
	var username = req.user.username;
	var interestname = req.body.interestname;
	var description = req.body.description;
	Interests.insert(connection, {
		'interestname': interestname,
		'description': description,
	}, function(err, rows) {
		CuratorPrivileges.insert(connection, {
			'username': username,
			'interestname': interestname,
		}, function(err2, rows2) {
			if (err || err2) {
				res.render('message', {
					'message': 'ERROR. unable to create interest'
				});
			} else {
				res.render('message', {
					'message': 'successfully created interest: \"' + interestname + '\"'
				});
			}
		});
	});
}

var followInterestRoute = function(connection, req, res) {
	var interestname = req.param('interestname');
	var username = req.user.username;

	InterestedIn.insert(connection, {
		'username': username,
		'interestname': interestname,
	}, function(err, rows) {
		if (err) {
			res.render('message', {
				'message': 'ERROR. unable to follow interest'
			});
		} else {
			res.render('message', {
				'message': 'successfully followed interest: \"' + interestname + '\"'
			});
		}
	});
};

var unfollowInterestRoute = function(connection, req, res) {
	var interestname = req.param('interestname');
	var username = req.user.username;

	InterestedIn.delete(connection, {
		'username': username,
		'interestname': interestname,
	}, function(err, rows) {
		if (err) {
			res.render('message', {
				'message': 'ERROR. unable to unfollow interest'
			});
		} else {
			res.render('message', {
				'message': 'successfully unfollowed interest: \"' + interestname + '\"'
			});
		}
	});
};
