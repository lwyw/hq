'use strict';

var express = require('express');
var app = express();
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var mongoConfig = require(__dirname + '/config/mongo');
var routerConfig = require(__dirname + '/config/routes');
var paypalConfig = require(__dirname + '/config/paypal');
var paypalGateway = require(__dirname + '/app/helpers/paypal');
var braintreeConfig = require(__dirname + '/config/braintree');
var braintreeGateway = require(__dirname + '/app/helpers/braintree');
var port = process.env.PORT || 8080;

//configure mongo database
mongoConfig();

//configure paypal and set gateway for helper
paypalGateway.setGateway(paypalConfig());

//configure braintree and set gateway for helper
braintreeGateway.setGateway(braintreeConfig());

//logging
app.use(morgan('dev'));

//use body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//configure routes
app.use(express.static(__dirname + '/public'));
app.use('/components', express.static(__dirname + '/bower_components'));
routerConfig(app);

//catch unanticipated error
app.use(function (err, req, res, next) {
  if (err) {
    console.log(err);
    return res.status(500).send('Internal Server Error');
  }
});

//start server
app.listen(port, function () {
  console.log('Listening on port ' + port);
});

//expose app
module.exports = app;