'use strict';

var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
var log4js = require('log4js');
var logger = log4js.getLogger('fabricAPI');
var expressJWT = require('express-jwt');
var util = require('util');
var jwt = require('jsonwebtoken');
var bearerToken = require('express-bearer-token');
var bodyParser = require('body-parser');
var cors = require('cors');

require('./config.js');
var hfc = require('fabric-client');

module.exports = app; // for testing

app.options('*', cors());
app.use(cors());

app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({
	extended: false
}));

var config = {
  appRoot: __dirname // required config
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || 8080;
  app.listen(port);

});
