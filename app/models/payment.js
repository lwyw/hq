'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto'),
  algorithm = 'aes-256-ctr',
  password = 'd6F3Efeq';

var paymentSchema = new Schema({
  'hqPrice': Number,
  'hqCurrency': String,
  'hqName': String,
  'hqCCName': String,
  'hqCCNum': String,
  'hqCCExp': Date,
  'hqCCV': String,
  'paymentType': { 'type': String, 'enum': ['PayPal', 'Braintree']},
  'transaction': Schema.Types.Mixed,
  
  'created' : { 'type' : Date, 'default': Date.now() }
});

//encrypt CC number before saving
paymentSchema.pre('save', function (next) {
  var cipher, crypted, payment = this;

  //only encrypt the CC number if it has been modified (or is new)
  if (!payment.isModified('hqCCNum')) { return next(); }

  //encrypt
  cipher = crypto.createCipher(algorithm, password);
  crypted = cipher.update(this.hqCCNum, 'utf8', 'hex');
  crypted += cipher.final('hex');
  this.hqCCNum = crypted;
  next();
});

//decrypt CC number
paymentSchema.methods.decryptCCNum = function (candidateCCNum) {
  var dec, decipher = crypto.createDecipher(algorithm, password);
  dec = decipher.update(candidateCCNum, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
};

module.exports = mongoose.model('Payment', paymentSchema);
