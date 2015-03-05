'use strict';

var braintree = require('braintree');

//braintree sandbox configuration
module.exports = function () {
  var gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: 'srx56xxcrx86wwm8',
    publicKey: 'sr39xdvjz37qhwhs',
    privateKey: '8f395645b9115f5096a871bf728c84c6'
  });
  
  return gateway;
};