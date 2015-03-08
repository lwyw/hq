'use strict';

var winston = require('winston'),
  paymentPlugin = require(__dirname + '/plugins/payment');

module.exports = function (server) {
  //static route
  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: 'public'
      }
    }
  });
  //bower components static route
  server.route({
    method: 'GET',
    path: '/components/{param*}',
    handler: {
      directory: {
        path: 'bower_components',
        listing: true
      }
    }
  });

  //payment plugin
  server.register({
    register: paymentPlugin
  }, { routes: { prefix: '/api' } }, function (err) {
    if (err) {
      winston.error('Error registering payment plugin', { error: err });
      throw err;
    }
  });
};
