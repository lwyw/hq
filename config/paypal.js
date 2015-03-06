'use strict';

var paypal = require('paypal-rest-sdk');

//PayPal sandbox configuration
module.exports = function () {
  paypal.configure({
    'mode': 'sandbox',
    'client_id': 'AUKRNWoQyHuZgV_U11QB2GgMhFpRMBKc0PB4ojBbBmEkxXgOKCbbTXf_oFSqzMp8Q1ym0btkB8QREwYb',
    'client_secret': 'EJFvLFUuNOJ6z7Fp2RgANfXPoDW480-KBL-iRecU_xoc80uffOJAbFxlBum_DIuF-HBfg9gWfNu-VX4M'
  });
  
  return paypal;
};
