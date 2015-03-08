'use strict';

var async = require('async'),
  pkg = require(__dirname + '/../../package.json'),
  paymentController = require(__dirname + '/../controllers/payment');

exports.register = function (server, options, next) {
  server.route({
    method: 'POST',
    path: '/submit-order',
    handler: function (request, reply) {



    }
  });

  return next();
};

exports.register.attributes = {
  pkg: pkg
};
