'use strict';

var app = require(__dirname + '/../server'),
  request = require('superagent'),
  should = require('should'),
  paymentsController = require(__dirname + '/../app/controllers/payment'),
  url = 'http://localhost:8080';

describe('Payment api tests', function () {

  it('should choose the right gateway', function () {
    var formData = {
      hqPrice: "1000",
      hqCurrency: "SGD",
      hqName: "Joe Black",
      hqCCName: "Joe Shopper",
      hqCCNum: "4111111111111111",
      hqCCExp: "2018-11-01",
      hqCCV: "874"
    };

    //choose Braintree on SGD, THB, HKD
    paymentsController.selectPaymentGateway(formData, function (err, gateway) {
      should(gateway.type).be.equal('Braintree');
    });
    formData.hqCurrency = 'THB';
    paymentsController.selectPaymentGateway(formData, function (err, gateway) {
      should(gateway.type).be.equal('Braintree');
    });
    formData.hqCurrency = 'HKD';
    paymentsController.selectPaymentGateway(formData, function (err, gateway) {
      should(gateway.type).be.equal('Braintree');
    });

    //choose PayPal gatewy on USD, EUR and AUD
    formData.hqCurrency = 'USD';
    paymentsController.selectPaymentGateway(formData, function (err, gateway) {
      should(gateway.type).be.equal('PayPal');
    });
    formData.hqCurrency = 'EUR';
    paymentsController.selectPaymentGateway(formData, function (err, gateway) {
      should(gateway.type).be.equal('PayPal');
    });
    formData.hqCurrency = 'AUD';
    paymentsController.selectPaymentGateway(formData, function (err, gateway) {
      should(gateway.type).be.equal('PayPal');
    });

    //sends an error on AMEX and non-USD
    formData.hqCurrency = 'SGD';
    formData.hqCCNum = '378282246310005';
    paymentsController.selectPaymentGateway(formData, function (err, gateway) {
      should(err).be.eql({statusCode: 400, message: 'Cannot use AMEX with other currencies besides USD'});
    });

    //choose PayPal on AMEX and USD
    formData.hqCurrency = 'USD';
    paymentsController.selectPaymentGateway(formData, function (err, gateway) {
      should(gateway.type).be.equal('PayPal');
    });
  });

  it('should return http status of 200 upon valid payment (Braintree)', function (done) {
    var dt = new Date(), order = {
      hqPrice: (Math.random() * 1000 + 1).toFixed(2),
      hqCurrency: "SGD",
      hqName: "Joe Black",
      hqCCName: "Joe Shopper",
      hqCCNum: "4111111111111111",
      hqCCExp: dt.setMonth(dt.getMonth() + 1),
      hqCCV: "874"
    };

    request
      .post(url + '/api/submit-order')
      .send(order)
      .end(function (res) {
        should(res.status).be.equal(200);
        done();
      });
  });

  it('should return http status of 200 upon valid payment (PayPal)', function (done) {
    var dt = new Date(), order = {
      hqPrice: (Math.random() * 1000 + 1).toFixed(2),
      hqCurrency: "USD",
      hqName: "Joe Black",
      hqCCName: "Joe Shopper",
      hqCCNum: "4417119669820331",
      hqCCExp: dt.setMonth(dt.getMonth() + 1),
      hqCCV: "874"
    };

    request
      .post(url + '/api/submit-order')
      .send(order)
      .end(function (res) {
        should(res.status).be.equal(200);
        done();
      });
  });

  it('should return http status of 400 upon invalid CC Num (Braintree)', function (done) {
    var dt = new Date(), order = {
      hqPrice: (Math.random() * 1000 + 1).toFixed(2),
      hqCurrency: "SGD",
      hqName: "Joe Black",
      hqCCName: "Joe Shopper",
      hqCCNum: "9820331",
      hqCCExp: dt.setMonth(dt.getMonth() + 1),
      hqCCV: "874"
    };

    request
      .post(url + '/api/submit-order')
      .send(order)
      .end(function (res) {
        should(res.status).be.equal(400);
        should(res.body.message).be.equal('Invalid credit card number');
        done();
      });
  });

  it('should return http status of 400 upon invalid CC Num (PayPal)', function (done) {
    var dt = new Date(), order = {
      hqPrice: (Math.random() * 1000 + 1).toFixed(2),
      hqCurrency: "USD",
      hqName: "Joe Black",
      hqCCName: "Joe Shopper",
      hqCCNum: "9820331",
      hqCCExp: dt.setMonth(dt.getMonth() + 1),
      hqCCV: "874"
    };

    request
      .post(url + '/api/submit-order')
      .send(order)
      .end(function (res) {
        should(res.status).be.equal(400);
        should(res.body.message).be.equal('Invalid credit card number');
        done();
      });
  });

  it('should return http status of 400 upon expired credit card', function (done) {
    var dt = new Date(), order = {
      hqPrice: (Math.random() * 1000 + 1).toFixed(2),
      hqCurrency: "USD",
      hqName: "Joe Black",
      hqCCName: "Joe Shopper",
      hqCCNum: "4417119669820331",
      hqCCExp: dt.setMonth(dt.getMonth() - 1),
      hqCCV: "874"
    };

    request
      .post(url + '/api/submit-order')
      .send(order)
      .end(function (res) {
        should(res.status).be.equal(400);
        should(res.body.message).be.equal('Overdued expiration date');
        done();
      });
  });

  it('should return http status of 200 upon AMEX credit card with USD currency', function (done) {
    var dt = new Date(), order = {
      hqPrice: (Math.random() * 1000 + 1).toFixed(2),
      hqCurrency: "USD",
      hqName: "Joe Black",
      hqCCName: "Joe Shopper",
      hqCCNum: "347693095942474",
      hqCCExp: dt.setMonth(dt.getMonth() + 1),
      hqCCV: "8743"
    };

    request
      .post(url + '/api/submit-order')
      .send(order)
      .end(function (res) {
        should(res.status).be.equal(200);
        done();
      });
  });

  it('should return http status of 400 upon AMEX credit card with non-USD currency', function (done) {
    var dt = new Date(), order = {
      hqPrice: (Math.random() * 1000 + 1).toFixed(2),
      hqCurrency: "SGD",
      hqName: "Joe Black",
      hqCCName: "Joe Shopper",
      hqCCNum: "347693095942474",
      hqCCExp: dt.setMonth(dt.getMonth() + 1),
      hqCCV: "8743"
    };

    request
      .post(url + '/api/submit-order')
      .send(order)
      .end(function (res) {
        should(res.status).be.equal(400);
        should(res.body.message).be.equal('Cannot use AMEX with other currencies besides USD');
        done();
      });
  });

});
