'use strict';

var mongoose = require('mongoose');
var dbUrl = 'mongodb://localhost/hq';

module.exports = function () {
  mongoose.connect(dbUrl);

  return mongoose;
};
