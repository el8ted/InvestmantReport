/**
 * @license MIT
 *
 * @fileoverview Security class for all transactions. A security is made up of the securityID + account currency
 *
 * @author tomek32@gmail.com Tom Hosiawa
 */
"use strict";

// Configuration to run on node with mock data
if (typeof process !== 'undefined' && process.release.name === 'node') {
  module.exports.Security = Security;
}

/**
 * Security class for all transactions. A security is made up of the securityID + account currency
 * @constructor
 * @param {string} accountCurrency, 
 * @param {string} securityID
 */
function Security(accountCurrency, securityID) {
  this.accountCurrency = accountCurrency;
  this.securityID = securityID;
}

Security.prototype.getAccountCurrency = function() { return this.accountCurrency; };
Security.prototype.getSecurityID = function() { return this.securityID; };

/**
 * @returns {string} unique representation of security
 */
Security.prototype.getUID = function() {
  return this.accountCurrency + "_" + this.securityID;
};


