'use strict';

var braintreeGateway;

/**
 * parse form data and return Braintree JSON object
 * @param   {Object} form data JSON object
 * @returns {Object} Braintree JSON object generated from form data
 */
function createBraintreeJSON(formData) {
  var braintreeJSON,
    name = formData.hqName.split(" "),  //split name into first and last name by space
    expDate = new Date(formData.hqCCExp);  //split date into year, month and day array
  
  //generate Braintree JSON object
  braintreeJSON = {
    amount: formData.hqPrice,
    creditCard: {
      number: formData.hqCCNum,
      expirationMonth: expDate.getMonth() + 1,
      expirationYear: expDate.getFullYear(),
      cardholderName: formData.hqCCName ? formData.hqCCName.trim() : "",
      cvv: formData.hqCCV
    },
    customer: {
      firstName: name[0] ? name[0].trim() : "",
      lastName: name[1] ? name[1].trim() : ""
    }
  };
  
  return braintreeJSON;
}

exports.type = 'Braintree';

/**
 * Set configured gateway to use
 * @param {Object} paypal configured PayPal gateway
 */
exports.setGateway = function (braintree) {
  braintreeGateway = braintree;
};

/**
 * Process payments
 * @param   {Object}   formData form data JSON object
 * @param   {Function} callback callback function
 */
exports.processPayment = function (formData, callback) {
  //throw error if Braintree object is not set
  if (!braintreeGateway) { return callback(new Error('Braintree object not set')); }
  
  var braintreeJSON = createBraintreeJSON(formData);
  
  braintreeGateway.transaction.sale(braintreeJSON, function (err, res) {
    if (err) {
      return callback(err);
    } else if (!res) {
      return callback(new Error('No response'));
    }
    
    //check if transaction was a success, if not return error response
    if (res.success) {
      return callback(null, res);
    } else {
      return callback(res);
    }
  });
};