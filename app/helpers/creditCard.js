'use strict';

/**
 * get credit card type
 * @param   {String} ccNum credit card number
 * @returns {String} credit card type, visa, mastercard, amex or discover, null if cannot identify
*/
exports.getCreditCardType = function (ccNum) {
  if (typeof ccNum === 'string') { ccNum = ccNum.trim(); }

  if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(ccNum)) {
    return 'visa';
  } else if (/^5[1-5][0-9]{14}$/.test(ccNum)) {
    return 'mastercard';
  } else if (/^3[47][0-9]{13}$/.test(ccNum)) {
    return 'amex';
  } else if (/^6(?:011|5[0-9]{2})[0-9]{12}$/.test(ccNum)) {
    return 'discover';
  } else if (/^3(?:0[0-5]|[68][0-9])[0-9]{11}$/.test(ccNum)) {
    return 'diners';
  } else if (/^(?:2131|1800|35\d{3})\d{11}$/.test(ccNum)) {
    return 'jcb';
  } else {
    return null;
  }
};
