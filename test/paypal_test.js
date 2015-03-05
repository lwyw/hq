'use strict';

var request = require('superagent'), assert = require('assert');
var url = 'http://localhost:8080';

describe('PayPal tests', function () {
  
  it('should return http status of 200 upon valid payment', function (done) {
    var order = {
      hqPrice: "1000",
      hqCurrency: "USD",
      hqName: "Joe Black",
      hqCCName: "Joe Shopper",
      hqCCNum: "4417119669820331",
      hqCCExp: "2018-11-01",
      hqCCV: "874"
    };
    
    request
      .post(url + '/api/submit-order')
      .type('form')
      .send(order)
      .end(function (res) {
        assert.equal(200, res.status);
        done();
      });
  });
  
});