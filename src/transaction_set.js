/**
 * @license MIT
 *
 * @fileoverview Class that holds transactions and categories them by investment type
 *
 * @author tomek32@gmail.com Tom Hosiawa
 */
"use strict";

if (typeof process !== 'undefined' && process.release.name === 'node') {
  var InvestmentType = require('./investment_type.js').InvestmentType;

  module.exports.TransactionSet = TransactionSet;
}


/**
 * Class to hold list of transactions, categorized by investment type
 * @constructor
 */
function TransactionSet() {
  this.transactionsList = {'INTEREST': [], 'CARRY_CHARGE': [], 'DIVIDEND': [], 'ORDER': [], 'OPTION_ORDER': []};
}

/**
 * @param {BaseTransaction} transaction
 */
TransactionSet.prototype.addTransaction = function(transaction) {
  this.transactionsList[transaction.getInvestmentType()].push(transaction);
};

/**
 * @param {InvestmentType} type
 * @param {Security} security optional
 * @returns {Array<OrderTransaction>} returns array matching type. if security is specified, returns only type + security
 */
TransactionSet.prototype.getTransactions = function(type, security) {
  if (typeof security === 'undefined') {
    return this.transactionsList[type];
  }
  else {
    var transactions = [];

    for (var i = 0, length = this.transactionsList[type].length; i < length; i++) {
      if (security.getUID() === this.transactionsList[type][i].getSecurity().getUID()) {
        transactions.push(this.transactionsList[type][i]);
      }
    }
  }

  return transactions;
};

/**
 * @param {InvestmentType} type
 * @returns {Array<Security>} unique array of securities matching the investment type
 */
TransactionSet.prototype.getUniqueSecurities = function(type) {
  var list = {'UIDs': [], 'securities': []};

  for (var i = 0, length = this.transactionsList[type].length ; i < length ; i++) {
    var security = this.transactionsList[type][i].getSecurity();
    var UID = security.getUID();

    if (list.UIDs.indexOf(UID) === -1) {
      list.UIDs.push(UID);
      list.securities.push(security);
    }
  }

  return list.securities;
};