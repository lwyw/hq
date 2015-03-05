'use strict';

var apiRouter = require('express').Router();
var paymentController = require(__dirname + '/../app/controllers/payment');

module.exports = function (app) {
  apiRouter.post('/submit-order', paymentController.selectPaymentGateway, paymentController.processPayment);
  //use configured router
  app.use('/api', apiRouter);
};