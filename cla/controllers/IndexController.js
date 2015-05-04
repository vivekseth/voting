var utility = require('../../utility');

exports.registerRoutes = function(app, connection) {
	app.get('/', utility.staticRenderHandler('index', {}));
	app.get('/users', utility.handlerGenerator(connection, userListRoute));
	app.get('/users/:pid', utility.handlerGenerator(connection, userValidationFormRoute));
	app.post('/users/:pid', utility.handlerGenerator(connection, userValidationRoute));
}

var userListRoute = function(connection, req, res) {
	connection.query(SQL_SELECT_PEOPLE, function(err, rows){
		res.render('users', {'people': rows});
	});
}

var userValidationFormRoute = function(connection, req, res) {
	console.log(req.param('pid'));
	
	connection.query(
		SQL_SELECT_PERSON_WITH_ID, 
		req.param('pid'), 
		function(err, rows) {
			console.log(err, rows);

			if (!rows || rows.length <= 0) {
				res.send('invalid userid');
				return;
			}

			res.render('valform', rows[0]);
		});
}

/*
pid
validationid
*/
var userValidationRoute = function(connection, req, res) {
	connection.query(
		SQL_VALIDATE_USER, 
		[req.body.pid, req.body.dob, req.body.ssn], 
		function(err, rows){
			console.log(err, rows);

			if (!rows || rows.length <= 0) {
				res.send('user is not eligible to vote, or provided invalid data.');
			}

			var valID = utility.random512();
			var pid = req.body.pid;

			connection.query(SQL_VAL_INSERT, {
				'pid': pid,
				'validationid': valID,
			}, function(err, rows) {
				if (err) {
					res.send('already expressed intent to vote');
				} else {
					var message = 'Success!\n'
					message += 'validation id: \"'+ valID +'\"';
					res.send(message);
				}
			});
		});
}

/** SQL Statements */

var SQL_SELECT_PEOPLE = utility.multiline(function(){/*
	SELECT pid, firstname, lastname, eligible FROM People;
*/})

var SQL_SELECT_PERSON_WITH_ID = utility.multiline(function(){/*
	SELECT pid, firstname, lastname, eligible FROM People WHERE pid = ?;
*/})

var SQL_VAL_INSERT = utility.multiline(function(){/*
	INSERT INTO VotingIntent SET ? ;
*/})

var SQL_VALIDATE_USER = utility.multiline(function(){/*
	SELECT P.pid
	FROM People P
	Where 
		P.pid = ? 
		AND
		P.dob = ?
		AND
  		P.ssn = ? 
  		AND
  		P.eligible = true
  		;
*/})