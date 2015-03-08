'use strict';

//server
var winston = require('winston');
//app
var Hapi = require('hapi');
var server = new Hapi.Server();
var good = require('good');
var routeConfig = require(__dirname + '/app/routes');
var port = process.env.PORT || 8080;
//console logging option
var options = {
  opsInterval: 1000,
  reporters: [{
    reporter: require('good-console'),
    args: [{ log: '*', response: '*' }]
  }]
};
//database
var nedbConfig = require(__dirname + '/config/nedb');
var Payment = require(__dirname + '/app/models/payment');
//gatways
var paypalConfig = require(__dirname + '/config/paypal');
var paypalGateway = require(__dirname + '/app/gateways/paypal');
var braintreeConfig = require(__dirname + '/config/braintree');
var braintreeGateway = require(__dirname + '/app/gateways/braintree');

//file logging
winston.add(winston.transports.File, { filename: 'server.log' });
winston.remove(winston.transports.Console);

//configure neDB database
Payment.setDB(nedbConfig.config());

//configure paypal and set gateway for helper
paypalGateway.setGateway(paypalConfig());

//configure braintree and set gateway for helper
braintreeGateway.setGateway(braintreeConfig());

//configure app
server.connection({ port: port });

//console logging
server.register({ register: good, options: options }, function (err) {
  if (err) {
    winston.error('Error starting good loggin', { error: err });
    throw err;
  }
});

//configure routes and plugins
routeConfig(server);

//start server
server.start(function (err) {
  if (err) {
    winston.error('Error starting Hapi server', { error: err });
    throw err;
  } else {
    console.log("Listening on port " + port);
  }
});

//expose app
module.exports = server;
