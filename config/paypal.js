'use strict';

var paypal = require('paypal-rest-sdk');

//PayPal sandbox configuration
module.exports = function () {
  paypal.configure({
    'mode': 'sandbox',
    'client_id': 'EBWKjlELKMYqRNQ6sYvFo64FtaRLRR5BdHEESmha49TM',
    'client_secret': 'EO422dn3gQLgDbuwqTjzrFgFtaRLRR5BdHEESmha49TM'
  });
  
  return paypal;
};