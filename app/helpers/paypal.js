'use strict';

var paypalGateway, creditCard = require(__dirname + '/../helpers/creditCard');

/**
 * Parse form data and return PayPal JSON object
 * @param   {Object} formData JSON object
 * @returns {Object} PayPal JSON object generated from form data
 */
function createPayPalJSON(formData) {
  var payPalJSON,
    expDate = new Date(formData.hqCCExp),  //split date into year, month and day array
    name = formData.hqCCName.split(" "),  //split CC name into first and last name by space
    ccType = creditCard.getCreditCardType(formData.hqCCNum);

  //generate PayPal JSON object
  payPalJSON = {
    "intent": "sale",
    "payer": {
      "payment_method": "credit_card",
      "funding_instruments": [{
        "credit_card": {
          "type": ccType,
          "number": formData.hqCCNum,
          "expire_month": expDate.getMonth() + 1,
          "expire_year": expDate.getFullYear(),
          "cvv2": formData.hqCCV,
          "first_name": name[0] ? name[0].trim() : "",
          "last_name": name[1] ? name[1].trim() : ""
        }
      }]
    },
    "transactions": [{
      "amount": {
        "total": formData.hqPrice,
        "currency": formData.hqCurrency
      },
      "description": "Supercalifragilisticexpialidocious"
    }]
  };

  return payPalJSON;
}

exports.type = 'PayPal';

/**
 * Set configured gateway to use
 * @param {Object} paypal configured PayPal gateway
 */
exports.setGateway = function (paypal) {
  paypalGateway = paypal;
};

/**
 * Process payments
 * @param   {Object}   formData form data JSON object
 * @param   {Function} callback callback function
 */
exports.processPayment = function (formData, callback) {
  //throw error if PayPal object is not set
  if (!paypalGateway) { return callback(new Error('PayPal object not set')); }
  
  var payPalJSON = createPayPalJSON(formData);
  
  //create PayPal payment
  paypalGateway.payment.create(payPalJSON, function (err, res) {
    //return callback with error for PayPal
    if (err) {
      return callback(err);
    } else if (!res) {
      return callback(new Error('No response'));
    }

    //return successful callback with payment data from PayPal
    return callback(null, res);
  });
};