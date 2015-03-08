'use strict';

var async = require('async'),
  winston = require('winston'),
  pkg = require(__dirname + '/../../package.json'),
  paymentController = require(__dirname + '/../controllers/payment');

exports.register = function (server, options, next) {
  server.route({
    method: 'POST',
    path: '/submit-order',
    handler: function (request, reply) {
      async.waterfall([
        function (callback) {
          paymentController.checkCreditCard(request.payload, callback);
        },
        function (callback) {
          paymentController.selectPaymentGateway(request.payload, callback);
        },
        function (gateway, callback) {
          paymentController.processPayment(request.payload, gateway, callback);
        },
        function (gateway, transaction, callback) {
          paymentController.savePayment(request.payload, gateway, transaction, callback);
        }
      ], function (err, data) {
        if (err) {
          winston.error('Error processing payment', { formData: request.payload, error: err });
          reply(err).statusCode = err.statusCode || 500;
          return;
        }

        return reply(data);
      });
    }
  });

  return next();
};

exports.register.attributes = {
  pkg: pkg
};
