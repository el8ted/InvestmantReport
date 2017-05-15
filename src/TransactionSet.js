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
 * @param {Transaction} transaction
 */
TransactionSet.prototype.addTransaction = function(transaction) {
  this.transactionsList[transaction.getInvestmentType()].push(transaction);
};

/**
 * @returns {[CarryChargeTransaction]}
 */
TransactionSet.prototype.getCarryChargeTransactions = function() {
  return this.transactionsList[InvestmentType.CARRY_CHARGE];
};

/**
 * @returns {[DividendTransaction]}
 */
TransactionSet.prototype.getDividendTransactions = function() {
  return this.transactionsList[InvestmentType.DIVIDEND];
};

/**
 * @returns {[InterestTransaction]}
 */
TransactionSet.prototype.getInterestTransactions = function() {
  return this.transactionsList[InvestmentType.INTEREST];
};

/**
 * @param {Security} security - optional
 * @returns {[OrderTransaction]]} if security is specified, returns list matching only security
 */
TransactionSet.prototype.getOrderTransactions = function(security) {
  var orders = [];

  if (typeof security === 'undefined')
    return this.transactionsList[InvestmentType.ORDERS];
  else {
    for (var i = 0; i < this.transactionsList[InvestmentType.ORDERS].length; i++) {
      if (security.getUID() === this.transactionsList[InvestmentType.ORDERS][i].getSecurity().getUID())
        orders.push(this.transactionsList[InvestmentType.ORDERS][i]);
    };
  }

  return orders;
};

/**
 * @param {Security} security - optional
 * @returns {[OptionOrderTransaction]]} if security is specified, returns list matching only security
 */
TransactionSet.prototype.getOptionOrderTransaction = function(security) {
  //TODO: need to implement
  return this.transactionsList[InvestmentType.OPTION_ORDER];
};

/**
 * @param {InvestmentType}
 * @returns {[Security]} unique list matching the investment type
 */
TransactionSet.prototype.getUniqueSecurities = function (type) {
  var list = {UIDs: [], securities = []};
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