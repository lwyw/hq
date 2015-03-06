'use strict';

var app = require(__dirname + '/../server'),
  request = require('supertest'),
  assert = require('assert'),
  creditCard = require(__dirname + '/../app/helpers/creditCard');

describe('App server tests', function () {

  it('should return http status of 200 upon url root query', function (done) {
    request(app)
      .get('/')
      .expect(200, done);
  });

  it('should return http status of 404 upon unknown url', function (done) {
    request(app)
      .get('/notfound')
      .expect(404, done);
  });

  it('should select the correct credit card type', function () {
    var tests = [
      {ccNum: 378282246310005, type: 'amex'},
      {ccNum: 371449635398431, type: 'amex'},
      {ccNum: 378734493671000, type: 'amex'},
      {ccNum: 6011111111111117, type: 'discover'},
      {ccNum: 6011000990139424, type: 'discover'},
      {ccNum: 5555555555554444, type: 'mastercard'},
      {ccNum: 5105105105105100, type: 'mastercard'},
      {ccNum: 4111111111111111, type: 'visa'},
      {ccNum: 4012888888881881, type: 'visa'},
      {ccNum: 4417119669820331, type: 'visa'},
      {ccNum: 30569309025904, type: 'diners'},
      {ccNum: 38520000023237, type: 'diners'},
      {ccNum: 3530111333300000, type: 'jcb'},
      {ccNum: 3566002020360505, type: 'jcb'},
      {ccNum: 707070709700741, type: null},
      {ccNum: 65050420, type: null},
      {ccNum: 43214321, type: null}
    ];
    tests.forEach(function (t) {
      assert.equal(creditCard.getCreditCardType(t.ccNum), t.type);
    });
  });

});
