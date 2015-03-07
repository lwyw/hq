'use strict';

var db, crypto = require('crypto'),
  algorithm = 'aes-256-ctr',
  password = 'd6F3Efeq';

//encrypt CC number before saving
function encryptCCNum(CCNum) {
  var cipher, crypted;

  //encrypt
  cipher = crypto.createCipher(algorithm, password);
  crypted = cipher.update(CCNum, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}

//decrypt CC number
function decryptCCNum(candidateCCNum) {
  var dec, decipher = crypto.createDecipher(algorithm, password);
  dec = decipher.update(candidateCCNum, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

exports.setDB = function (configuredDB) {
  db = configuredDB;
};

exports.insert = function (data, callback) {
  //encrypt CC number before saving
  if (data.hqCCNum) {
    data.hqCCNum = encryptCCNum(data.hqCCNum);
  }
  db.insert(data, callback);
};
