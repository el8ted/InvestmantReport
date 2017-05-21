/**
 * Created by Tom on 2017-05-20.
 */
"use strict";
global.RUN_ON_NODE = true;

/**
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


// Configuration to run on node with mock data
if (global.RUN_ON_NODE) {
  module.exports.Security = Security;
}