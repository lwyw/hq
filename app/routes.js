'use strict';

var apiRouter = require('express').Router();
var paymentController = require(__dirname + '/controllers/payment');

module.exports = function (app) {
  apiRouter.post('/submit-order', paymentController.checkCreditCard, paymentController.selectPaymentGateway, paymentController.processPayment, paymentController.savePayment);
  //use configured router
  app.use('/api', apiRouter);
};
