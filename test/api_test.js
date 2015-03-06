'use strict';

var app = require(__dirname + '/../server'),
  request = require('supertest'),
  assert = require('assert'),
  paymentsController = require(__dirname + '/../app/controllers/payment');

describe('Payment api tests', function () {

  it('should choose the right gateway', function () {
    var msg, err, req = {}, res = {};
    req.body = {
      hqPrice: "1000",
      hqCurrency: "SGD",
      hqName: "Joe Black",
      hqCCName: "Joe Shopper",
      hqCCNum: "4111111111111111",
      hqCCExp: "2018-11-01",
      hqCCV: "874"
    };

    //choose Braintree on SGD, THB, HKD
    paymentsController.selectPaymentGateway(req, null, function () {
      assert.equal(req.gateway.type, 'Braintree');
    });
    req.body.hqCurrency = 'THB';
    delete req.gateway;
    paymentsController.selectPaymentGateway(req, null, function () {
      assert.equal(req.gateway.type, 'Braintree');
    });
    req.body.hqCurrency = 'HKD';
    delete req.gateway;
    paymentsController.selectPaymentGateway(req, null, function () {
      assert.equal(req.gateway.type, 'Braintree');
    });

    //choose PayPal gatewy on USD, EUR and AUD
    req.body.hqCurrency = 'USD';
    delete req.gateway;
    paymentsController.selectPaymentGateway(req, null, function () {
      assert.equal(req.gateway.type, 'PayPal');
    });
    req.body.hqCurrency = 'EUR';
    delete req.gateway;
    paymentsController.selectPaymentGateway(req, null, function () {
      assert.equal(req.gateway.type, 'PayPal');
    });
    req.body.hqCurrency = 'AUD';
    delete req.gateway;
    paymentsController.selectPaymentGateway(req, null, function () {
      assert.equal(req.gateway.type, 'PayPal');
    });

    //sends an error on AMEX and non-USD
    req.body.hqCurrency = 'SGD';
    req.body.hqCCNum = '378282246310005';
    res.status = function (e) {
      err = e;
      return this;
    };
    res.json = function (m) {
      msg = m.message;
      return this;
    };
    delete req.gateway;
    paymentsController.selectPaymentGateway(req, res);
    assert.equal(err, 400);
    assert.equal(msg, 'Cannot use AMEX with other currencies besides USD');

    //choose PayPal on AMEX and USD
    req.body.hqCurrency = 'USD';
    paymentsController.selectPaymentGateway(req, null, function () {
      assert.equal(req.gateway.type, 'PayPal');
    });
  });

  it('should return http status of 200 upon valid payment', function (done) {
    var order = {
      hqPrice: "1000",
      hqCurrency: "SGD",
      hqName: "Joe Black",
      hqCCName: "Joe Shopper",
      hqCCNum: "4111111111111111",
      hqCCExp: "2018-11-01",
      hqCCV: "874"
    };

    request(app)
      .post('/api/submit-order')
      .type('form')
      .send(order)
      .end(function (err, res) {
        assert.equal(res.status, 200);
        done();
      });
  });

  it('should return http status of 400 upon invalid CC Num', function (done) {
    var order = {
      hqPrice: "1000",
      hqCurrency: "SGD",
      hqName: "Joe Black",
      hqCCName: "Joe Shopper",
      hqCCNum: "411111111",
      hqCCExp: "2018-11-01",
      hqCCV: "874"
    };

    request(app)
      .post('/api/submit-order')
      .type('form')
      .send(order)
      .end(function (err, res) {
        assert.equal(res.status, 400);
        done();
      });
  });

});