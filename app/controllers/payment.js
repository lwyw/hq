'use strict';

var paypalGateway = require(__dirname + '/../helpers/paypal'),
  braintreeGateway = require(__dirname + '/../helpers/braintree'),
  creditCard = require(__dirname + '/../helpers/creditCard'),
  Payment = require(__dirname + '/../models/payment'),
  paypalCurrency = ['USD', 'EUR', 'AUD'];

/**
 * Select appropriate payment gateway and append it to req.gateway
 * @param   {Object}   req  http request
 * @param   {Object}   res  http respond
 * @param   {Function} next callback function
 */
exports.selectPaymentGateway = function (req, res, next) {
  var err, formData = req.body,
    ccType = creditCard.getCreditCardType(formData.hqCCNum),
    currency = formData.hqCurrency.trim();
  
  if (ccType === 'amex') {
    if (currency === 'USD') {
      req.gateway = paypalGateway;
      return next();
    } else {
      return res.status(400).send('Cannot use AMEX with other currencies besides USD');
    }
    
  } else if (currency.length === 3) {
    if (paypalCurrency.indexOf(currency) === -1) {
      req.gateway = braintreeGateway;
    } else {
      req.gateway = paypalGateway;
    }
    return next();
    
  } else {
    err = new Error('No suitable gateway found');
    err.formData = req.body;
    return next(err);
  }
};

/**
 * Process payment gateway and save to database
 * @param   {Object}   req  http request
 * @param   {Object}   res  http respond
 * @param   {Function} next callback function
 */
exports.processPayment = function (req, res, next) {
  var gateway, err;
  
  if (!req.gateway) {
    err = new Error('No suitable gateway found');
    err.formData = req.body;
    return next(err);
  }
  
  gateway = req.gateway;
  gateway.processPayment(req.body, function (err, data) {
    //send bad reqest upon bad data
    if (err || !data) {
      console.log(err || 'error: empty data');
      return res.status(400).send(err || 'Bad Request');
    }
    
    //create new data
    var payment = new Payment();
    payment.hqPrice = req.body.hqPrice;
    payment.hqCurrency = req.body.hqCurrency;
    payment.hqName = req.body.hqName;
    payment.hqCCName = req.body.hqCCName;
    payment.hqCCNum = req.body.hqCCNum;
    payment.hqCCExp = req.body.hqCCExp;
    payment.hqCCV = req.body.hqCCV;
    payment.paymentType = req.gateway.type;
    payment.transaction = data;
    
    //save to database
    payment.save(function (err) {
      if (err || !data) {
        console.log(err || 'error: empty data');
        return res.status(500).send('Error saving');
      }
      //send transaction data
      return res.json(data);
    });
  });
};