'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

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

//hash CC number before saving
paymentSchema.pre('save', function (next) {
  var payment = this;

  // only hash the CC number if it has been modified (or is new)
  if (!payment.isModified('hqCCNum')) { return next(); }

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) { return next(err); }

    // hash the hqCCNum using our new salt
    bcrypt.hash(payment.hqCCNum, salt, function (err, hash) {
      if (err) { return next(err); }

      // override the cleartext hqCCNum with the hashed one
      payment.hqCCNum = hash;
      next();
    });
  });
});

//compare CC number to database
paymentSchema.methods.compareCCNum = function (candidateCCNum, callback) {
  bcrypt.compare(candidateCCNum, this.hqCCNum, function (err, isMatch) {
    if (err) { return callback(err); }
    callback(null, isMatch);
  });
};

module.exports = mongoose.model('Payment', paymentSchema);
