var express = require('express');
var cors = require('cors');

var EXPRESS = (function() {
  var server;
  var app = express();

  app.use(cors());
	routes = require('./routes')(app);
  server = app.listen(process.env['PORT'] || 3000, '127.0.0.1');

  console.log("Listening 127.0.0.1", process.env['PORT']);

  app.get('/', function(req, res) {
      res.send({status:'OK'});
  });


})();

module.exports = EXPRESS;
