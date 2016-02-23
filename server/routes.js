
var ROUTES = function(exp) {
	var express = exp;

	require('./routes/database_api')(express);


};

module.exports = ROUTES;