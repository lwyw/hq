'use strict';

var paypalGateway = require(__dirname + '/../gateways/paypal'),
  braintreeGateway = require(__dirname + '/../gateways/braintree'),
  creditCard = require(__dirname + '/../helpers/creditCard'),
  Payment = require(__dirname + '/../models/payment'),
  paypalCurrency = ['USD', 'EUR', 'AUD'];

/**
 * Basic credit card check
 * @param   {Object}   formData input data
 * @param   {Function} callback callback function
 */
exports.checkCreditCard = function (formData, callback) {
  var ccType = creditCard.getCreditCardType(formData.hqCCNum),
    expDate = new Date(formData.hqCCExp);
  
  //check for invalid credit card number
  if (!ccType) {
    return callback({ status: 400, message: 'Invalid credit card number' });
  }

  //check for expired card
  if (expDate.getFullYear() < (new Date()).getFullYear()) {
    return callback({ status: 400, message: 'Overdued expiration date' });

  } else if (expDate.getFullYear() === (new Date()).getFullYear() && expDate.getMonth() < (new Date()).getMonth()) {
    return callback({ status: 400, message: 'Overdued expiration date' });
  }

  return callback();
};

/**
 * Select payment gateway based on rules
 * @param   {Object}   formData input data
 * @param   {Function} callback callback function
 */
exports.selectPaymentGateway = function (formData, callback) {
  var gateway, ccType = creditCard.getCreditCardType(formData.hqCCNum),
    currency = formData.hqCurrency ? formData.hqCurrency.trim() : null;

  if (ccType === 'amex') {
    if (currency === 'USD') {
      gateway = paypalGateway;
    } else {
      return callback({status: 400, message: 'Cannot use AMEX with other currencies besides USD'});
    }
    
  } else if (paypalCurrency.indexOf(currency) !== -1) {
    gateway = paypalGateway;
    
  } else {
    gateway = braintreeGateway;
  }

  return callback(null, gateway);
};

/**
 * Process payment
 * @param   {Object}   formData input data
 * @param   {Object}   gateway  gateway
 * @param   {Function} callback callback function
 */
exports.processPayment = function (formData, gateway, callback) {
  var err;
  
  if (!gateway) {
    err = new Error('No gateway found');
    err.formData = formData;
    return callback(err);
  }
  
  gateway.processPayment(formData, function (err, data) {
    //send bad reqest upon bad data
    if (err) {
      return callback({ status: 400, message: err });

    } else if (!data) {
      return callback({status: 400, message: 'No paymeent response'});
    }
    
    return callback(null, gateway, data);
  });
};

/**
 * [[Description]]
 * @param   {Object}   formData    input data
 * @param   {Object}   gateway     gateway
 * @param   {Object}   transaction transaction data
 * @param   {Function} callback    callback function
 */
exports.savePayment = function (formData, gateway, transaction, callback) {
  //create new data
  var payment = {};
  payment.hqPrice = formData.hqPrice;
  payment.hqCurrency = formData.hqCurrency;
  payment.hqName = formData.hqName;
  payment.hqCCName = formData.hqCCName;
  payment.hqCCNum = formData.hqCCNum;
  payment.hqCCExp = formData.hqCCExp;
  payment.hqCCV = formData.hqCCV;
  payment.paymentType = gateway.type;
  payment.transaction = transaction;

  //save to database
  Payment.insert(payment, function (err, data) {
    if (err) {
      return callback({status: 500, message: 'Error saving'});
    }

    //send transaction data
    return callback(null, data);
  });
};
