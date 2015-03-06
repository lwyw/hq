'use strict';

var winston = require('winston'),
  paypalGateway = require(__dirname + '/../helpers/paypal'),
  braintreeGateway = require(__dirname + '/../helpers/braintree'),
  creditCard = require(__dirname + '/../helpers/creditCard'),
  Payment = require(__dirname + '/../models/payment'),
  paypalCurrency = ['USD', 'EUR', 'AUD'];

/**
 * Check if credit card is valid
 * @param   {Object}   req  http request
 * @param   {Object}   res  http response
 * @param   {Function} next callback function
 */
exports.checkCreditCard = function (req, res, next) {
  var formData = req.body,
    ccType = creditCard.getCreditCardType(formData.hqCCNum),
    expDate = new Date(formData.hqCCExp);
  
  //check for invalid credit card number
  if (!ccType) { return res.status(400).json({ status: 400, message: 'Invalid credit card number' }); }

  //check for expired card
  if (expDate.getFullYear() < (new Date()).getFullYear()) {
    return res.status(400).json({ status: 400, message: 'Overdued expiration date' });

  } else if (expDate.getFullYear() === (new Date()).getFullYear() && expDate.getMonth() < (new Date()).getMonth()) {
    return res.status(400).json({ status: 400, message: 'Overdued expiration date' });
  }

  return next();
};

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
      return res.status(400).json({status: 400, message: 'Cannot use AMEX with other currencies besides USD'});
    }
    
  } else if (currency.length === 3) {
    if (paypalCurrency.indexOf(currency) === -1) {
      req.gateway = braintreeGateway;
    } else {
      req.gateway = paypalGateway;
    }
    return next();
    
  } else {
    winston.error('No suitable gateway found', { formData: req.body });
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
    winston.error('No suitable gateway found', { formData: req.body });
    err = new Error('No suitable gateway found');
    err.formData = req.body;
    return next(err);
  }
  
  gateway = req.gateway;
  gateway.processPayment(req.body, function (err, data) {
    //send bad reqest upon bad data
    if (err) {
      winston.error('Error from processing payment', { formData: req.body, error: err });
      return res.status(400).json({ status: 400, message: err });

    } else if (!data) {
      winston.error('No response from processing payment', { formData: req.body, error: 'No response' });
      return res.status(400).json({status: 400, message: 'Bad Request'});
    }
    
    req.transaction = data;
    return next();
  });
};

/**
 * Save processed payment
 * @param   {Object}   req  http request
 * @param   {Object}   res  http response
 * @param   {Function} next callback function
 */
exports.savePayment = function (req, res, next) {
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
  payment.transaction = req.transaction;

  //save to database
  payment.save(function (err, data) {
    if (err) {
      winston.error('Error from saving payment data', { formData: req.body, error: err });
      return res.status(500).json({status: 500, message: 'Error saving'});
    }

    //send transaction data
    return res.json(data);
  });
};
