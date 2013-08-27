
/**
 * Module dependencies.
 */

var express = require('express')
	, routes = require('./routes')
	, http = require('http')
	, path = require('path')
	, db = require('mongoose').connect('mongodb://localhost:27017/express');

var app = express();

// all environments
app.set('port', process.env.PORT || 9999);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(express.cookieParser('the secretest string in all the land'));
app.use(express.session({
	secret: 'the secretest string in all the land',
	maxAge: 3600000
}));

app.use(function(req, res, next) {
	res.locals.session = req.session;
	next();
});

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

require('./routes/session')(app);
require('./routes/index')(app);
require('./routes/users')(app);

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
