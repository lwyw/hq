'use strict';

var Datastore = require('nedb'), winston = require('winston');

exports.config = function () {
  var db = new Datastore({ filename: __dirname + '/../payments.db' });
  db.loadDatabase(function (err) {
    if (err) { winston.error('Error loading NeDB', {error: err}); }
  });

  return db;
};
