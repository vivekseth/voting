var utility = require('../utility');
var Posts = require('../models/Posts');
var Interests = require('../models/Interests');
var Comments = require('../models/Comments');

// TODO(vivek): allow user to delete his own posts and comments.

exports.registerRoutes = function(app, connection){
	app.get('/post/all', 
		utility.authenticatedEndpoint, 
		utility.handlerGenerator(connection, allPostsRoute));

	app.get('/post/new', 
		utility.authenticatedEndpointWithType('user'), 
		utility.handlerGenerator(connection, newPostFormRoute));

	app.post('/post/new', 
		utility.authenticatedEndpointWithType('user'), 
		utility.handlerGenerator(connection, newPostRoute));

	app.get('/post/:postid', 
		utility.authenticatedEndpoint, 
		utility.handlerGenerator(connection, postDetailsRoute));

	app.get('/post/:postid/delete', 
		utility.authenticatedEndpointWithType('curator'), 
		utility.handlerGenerator(connection, deletePostRoute));

	app.post('/post/:postid/comment/new', 
		utility.authenticatedEndpointWithType('user'),
		utility.handlerGenerator(connection, newCommentRoute));

	app.get('/post/:postid/comment/:commentid/delete', 
		utility.authenticatedEndpointWithType('curator'), 
		utility.handlerGenerator(connection, deleteCommentRoute));
};

var allPostsRoute = function(connection, req, res) {
	Posts.all(connection, function(err, rows){
		res.render('post/all', {'posts': rows});
	});	
}

var newPostFormRoute = function(connection, req, res) {
	Interests.all(connection, function(err, rows) {
		if (rows && rows.length > 0) {
			res.render('post/new', {
				'interests': rows
			});
		} else {
			res.render('message', {
				'message': 'Unable to create post because no interests exist. Please have a curator create an interest.'
			});
		}
	});
}

var newPostRoute = function(connection, req, res) {
	var title = req.body.title;
	var body = req.body.body;
	var interestname = req.body.interestname;
	var username = req.user.username;

	if (title && body && interestname && username) {
		Posts.createNew(connection, {
			'title': title,
			'body': body,
			'interestname': interestname,
			'username': username,
		}, function(err, rows) {
			if (err) {
				res.render('message', {
					'message': 'ERROR. unable to create post'
				});
			} else {
				res.render('message', {
					'message': 'successfully created post: \"' + title + '\"'
				});
			}
		});
	} else {
		res.render('message', {
			'message': 'ERROR. Please do not leave any part of form blank.'
		});
	}
}

var postDetailsRoute = function(connection, req, res) {
	var postid = req.param('postid');
	Posts.details(connection, postid, function(err, rows){
		if (rows && rows.length > 0) {
			var post = rows[0];
			Comments.allForPost(connection, postid, function(err, rows) {
				var comments = [];
				if (rows && rows.length > 0) {
					comments = rows;
				}
				res.render('post/details', {'post': post, 'comments': comments});
			});
		} else {
			res.render('message', {'message': 'Post with this ID does not exist'});
		}
	});	
}

var deletePostRoute = function(connection, req, res) {
	var username = req.user.username;
	var postid = req.param('postid');
	Posts.details(connection, postid, function(err, rows) {
		if (rows && (rows.length > 0)) {
			var post = rows[0];
			var interestname = post['interestname'];
			CuratorPrivileges.checkPrivilege(connection, username, interestname, function(err, rows) {
				if (rows && (rows.length > 0)) {
					Posts.delete(connection, postid, function(err, rows) {
						if (err) {
							res.render('message', {'message': 'ERROR unable to delete post.'});
						} else {
							res.render('message', {'message': 'Post ('+ postid +') successfully deleted.'});
						}
					});
				} else {
					res.render('message', {'message': 'ERROR you dont have permission to delete this post'});
				}
			});
		} else {
			res.render('message', {'message': 'Post with this ID does not exist.'});
		}
	});
}

var newCommentRoute = function(connection, req, res) {
	var username = req.user.username;
	var postid = req.param('postid');
	var body = req.body.body;

	Comments.insert(connection, {
		'username': username,
		'postid': postid,
		'body': body,
	}, function(err, rows) {
		if (err) {
			res.render('message', {
				'message': 'ERROR unable to create post.'
			});
		} else {
			res.redirect('/post/' + postid);
		}
	});
}

var deleteCommentRoute = function(connection, req, res) {
	var username = req.user.username;
	var postid = req.param('postid');
	var commentid = req.param('commentid');
	Posts.details(connection, postid, function(err, rows) {
		if (rows && (rows.length > 0)) {
			var post = rows[0];
			var interestname = post['interestname'];
			CuratorPrivileges.checkPrivilege(connection, username, interestname, function(err, rows) {
				if (rows && (rows.length > 0)) {
					Comments.delete(connection, commentid, function(err2, rows2) {
						if (err || err2) {
							res.render('message', {'message': 'ERROR deleting comment.'});
						} else {
							res.redirect('/post/' + postid);
						}
					});
				} else {
					res.render('message', {'message': 'ERROR you dont have permission to delete this comment'});
				}
			});
		} else {
			res.render('message', {'message': 'Comment with this ID does not exist.'});
		}
	});
}


// DONE ----
// app.get('/post/:id/comment/:commentid/delete', homeController.render_post);
	// delete comment
	// only user
	// message once done
// app.get('/post/:id/comment/new', homeController.render_post);
	// create new comment
	// only user
	// message once done
// app.post('/post/new', homeController.new_post);
	// Only users
	// Accepts form input
	// Displays message
// app.get('/post/:id/', homeController.render_post);
	// Displays title and body of post and comments
	// Anyone can access
// app.get('/post/:id/delete', homeController.render_post);
	// Only authorized user, or curator can access
	// Displays message
// app.get('/post/all', homeController.new_post);
	// Anyone can access
// app.get('/post/new', homeController.new_post);
	// Only users
	// Form to create new post