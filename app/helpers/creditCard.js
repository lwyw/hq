'use strict';

/**
 * get credit card type
 * @param   {String} ccNum credit card number
 * @returns {String} credit card type, visa, mastercard, amex or discover, null if cannot identify
*/
exports.getCreditCardType = function (ccNum) {
  if (/^4[0-9]{6,}$/.test(ccNum)) {
    return 'visa';
  } else if (/^5[1-5][0-9]{5,}$/.test(ccNum)) {
    return 'mastercard';
  } else if (/^3[47][0-9]{5,}$/.test(ccNum)) {
    return 'amex';
  } else if (/^6(?:011|5[0-9]{2})[0-9]{3,}$/.test(ccNum)) {
    return 'discover';
  } else {
    return null;
  }
};