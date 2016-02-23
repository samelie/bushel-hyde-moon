var _ = require('lodash');
var express = require('express');
var fs = require('fs-extra');
var dir = require('node-dir');
var cors = require('cors'); // "Request" library
var ECT = require('ect');
var busboi = require('connect-busboy');
var passport = require('passport');
var flash = require('connect-flash');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

require('./passport')(passport);

var Q = require('q');
var ip = require("ip");
var PORT = process.env.EXPRESS_PORT;
var HOST = process.env.EXPRESS_HOST;

var ectRenderer = ECT({
	watch: true,
	root: __dirname + '/views',
	ext: '.ect'
});

var EXPRESS = (function() {
	var server;
	var app = express();
	var io, routes;

	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(morgan('dev')); // log every request to the console
	app.use(cookieParser()); // read cookies (needed for auth)
	app.use(bodyParser.json());

	// required for passport
	app.use(session({
		secret: 'samrad'
	})); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session

	app.use(cors({
		allowedOrigins: [
			'http://' + ip.address() + ':4000',
			'localhost',
			'app://',
			'app'
		]
	}));


	app.use(busboi());

	app.set('view engine', 'ect');
	app.engine('ect', ectRenderer.render);

	server = app.listen(PORT, HOST);
	//start socket
	io = require('./socket')(server);
	//routes
	routes = require('./routes')(app, io);

	console.log(HOST, ' on port ', PORT);

	return{
		io:io,
		emit:io.emit
	}

})();

module.exports = EXPRESS;