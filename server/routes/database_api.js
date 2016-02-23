
var DB = require('../../database/api');

var ROUTES = function(express) {
  //*************
  //CONTENT
  //*************

  express.post('/db/content', function(req, res, next) {
    DB.createContent(req.body)
      .then(function(r) {
        res.send(r);
      }).catch(function(err) {
        res.send(err);
      });
  });


};

module.exports = ROUTES;