/*
 * User Routes
 */

 var User = require('../data/models/user'),
 	notLoggedIn = require('./middleware/not_logged_in'),
 	loadUser = require('./middleware/load_user'),
 	restrictUserToSelf = require('./middleware/restrict_user_to_self'),
 	maxUsersPerPage = 5,
 	async = require('async');

 module.exports = function(app) {
 	

 	app.get('/users', function(req, res, next) {

 		var page = req.query.page && parseInt(req.query.page, 10) || 0;
 		async.parallel([
 			function(next) {
 				User.count(next);
 			},
 			function(next) {
 				User.find({}, {_id: 0})
 					.sort({'name': 1})
		 			.skip(page * maxUsersPerPage)
		 			.limit(maxUsersPerPage)
		 			.exec(next);
 			}
		], function(err, results){
			if (err) {
				return next(err);
			}

			var count = results[0],
				users = results[1],
				lastPage = (page + 1) * maxUsersPerPage >= count;

			res.render('users/index', {
 				title: "New User",  
 				users: users,
 				page: page,
 				lastPage: lastPage
 			});

		});


 	});

 	app.get('/users/new', notLoggedIn, function(req, res) {
 		res.render('users/new', {title: "New User"});
 	});

 	app.get('/users/:name', loadUser,  function(req, res, next) {

		res.render('users/profile', {title: 'User profile', user: req.user});
 		
 	});

 	app.post('/users', notLoggedIn, function(req, res, next) {

		User.create(req.body, function(err) {
			if(err) {
				if(err.code === 11000) {
					res.send('Conflict', 409);
				} else {
					next(err);
				}
				return;
			}
			res.redirect('/users');
		});

 	});

 	app.del('/users/:name', loadUser, restrictUserToSelf, function(req, res, next) {
 		req.user.remove(function(err) {
 			if(err) {
 				return next(err);
 			}
 			
 			req.session.destroy();
 			res.redirect('/users');
 		})
 	});
 }

