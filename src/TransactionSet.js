/**
 * Created by Tom on 2017-05-01.
 */
"use strict";

/**
 * Class to hold list of transactions, categorized by investment type
 */
function TransactionSet() {
  this.transactionsList = {'INTEREST': [], 'CARRY_CHARGE': [], 'DIVIDEND': [], 'ORDER': [], 'OPTION_ORDER': []};
}

/**
 * @param {Parent of BaseTransaction} transaction
 */
TransactionSet.prototype.addTransaction = function(transaction) {
  this.transactionsList[transaction.getInvestmentType()].push(transaction);
};

/**
 * @param {InvestmentType} type
 * @param {Security} security - optional
 * @returns {[OrderTransaction]]} returns array matching type. if security is specified, returns only type + security
 */
TransactionSet.prototype.getTransactions = function(type, security) {
  var transactions = [];

  if (typeof security === 'undefined')
    return this.transactionsList[type];
  else {
    for (var i = 0; i < this.transactionsList[type].length; i++) {
      if (security.getUID() === this.transactionsList[type][i].getSecurity().getUID())
        transactions.push(this.transactionsList[type][i]);
    };
  }

  return transactions;
};

/**
 * @param {InvestmentType}
 * @returns {[Security]} unique list matching the investment type
 */
TransactionSet.prototype.getUniqueSecurities = function (type) {
  var list = {'UIDs': [], 'securities': []};
  var UID;

  for (var i = 0; i < this.transactionsList[type].length; i++) {
    var security = this.transactionsList[type][i].getSecurity();
    //UID = null;
    UID = security.getUID();

    if (list.UIDs.indexOf(UID) === -1) {
      list.UIDs.push(UID);
      list.securities.push(security);
    }
  }

  return list.securities;
};


// Configuration to run on node with mock data
global.RUN_ON_NODE = true;
if (global.RUN_ON_NODE) {
  var InvestmentType = require('./InvestmentType.js').InvestmentType;

  module.exports.TransactionSet = TransactionSet;
}