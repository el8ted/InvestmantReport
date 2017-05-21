/**
 * Created by Tom on 2017-05-01.
 */
"use strict";
global.RUN_ON_NODE = true;


/**
 * InvestmentsAccount class
 */
function InvestmentsAccount() {
  this.transactionsSet = new TransactionSet();
}

/**
 * @param {Parent of BaseTransaction} transaction
 */
InvestmentsAccount.prototype.addTransaction = function (transaction) {
  this.transactionsSet.addTransaction(transaction);
};

/**
 * @param {Security} security
 * @return {{security, amount}}
 */
InvestmentsAccount.prototype.getCarryChargeBySecurity = function (security) {
  var amount = this.getIncomeOrCarryAmountByBySecurity(InvestmentType.CARRY_CHARGE, security);
  return {'security': security, 'amount': amount};
};

/**
 * @param {Security} security
 * @return {{security, amount}}
 */
InvestmentsAccount.prototype.getDividendBySecurity = function (security) {
  var amount = this.getIncomeOrCarryAmountByBySecurity(InvestmentType.DIVIDEND, security);
  return {'security': security, 'amount': amount};
};

/**
 * @param {Security} security
 * @return {{security, amount}}
 */
InvestmentsAccount.prototype.getInterestBySecurity = function (security) {
  var amount = this.getIncomeOrCarryAmountByBySecurity(InvestmentType.INTEREST, security);
  return {'security': security, 'amount': amount};
};

/**
 * @param {InvestmentType} type must be CARRY_CHARGE, DIVIDEND, or INTEREST
 * @param {Security} security
 * @returns {Number} returns sum amount of transactions matching type and security
 */
InvestmentsAccount.prototype.getIncomeOrCarryAmountByBySecurity = function(type, security) {
  if ((type !== InvestmentType.CARRY_CHARGE) && (type !== InvestmentType.DIVIDEND) && (type !== InvestmentType.INTEREST))
    throw "InvestmentsAccount.getIncomeOrCarryAmountByBySecurity: invalid type"

  var transactions = this.transactionsSet.getTransactions(type, security);
  var totalAmount = 0

  for (var j = 0; j < transactions.length; j++) {
    totalAmount += Number(transactions[j].getAmount());
    if (type === InvestmentType.DIVIDEND)
      totalAmount += Number(transactions[j].getAmountWithheld());
  }

  return totalAmount;
}

/**
 * @param {Security} security
 * @returns {{security, totalGainLoss, totalQuantity, totalBookValue}}
 */
InvestmentsAccount.prototype.getRealizedGainLossBySecurity = function (security) {
  var orders = this.transactionsSet.getTransactions(InvestmentType.ORDERS, security);
  var total = {bookValue: 0, gainLoss: 0, quantity: 0, ACB: 0};
  var order = {date: null, amount: 0, quantity: 0, usdRate: null};
  var avgCostPerQuantity = 0, nextDate = null, gainLoss = 0; 

  for (var j = 0; j < orders.length; j++) {
    if ((j + 1) < orders.length)
      nextDate = orders[j + 1].getTradeDate();
    else
      nextDate = null;

    order.amount = Number(orders[j].getAmount());
    order.quantity = Number(orders[j].getQuantity());
    order.usdRate = (orders[j].getUSDRate()) ? Number(orders[j].getUSDRate()): null;

    // Convert USD values to CAD
    if (order.usdRate !== null)
      order.amount *= order.usdRate;

    // Catch rounding errors
    total.quantity = total.quantity + order.quantity;
    if (Math.abs(total.quantity) < 0.001)
      total.quantity = 0;

    // Record gain/loss for closing transactions (sell, or buy to cover)
    if (((order.quantity < 0) && (total.quantity >= 0)) ||
        ((order.quantity > 0) && (total.quantity <= 0))) {
      gainLoss = (order.quantity * total.ACB ) + order.amount;

      if ((total.quantity === 0) || (nextDate === null) || (gainLoss >= 0) ||
          ((gainLoss < 0) && (isBoughtBackWithin30Days(orders, j) === false)))
        total.gainLoss += gainLoss;
    }

    total.bookValue = getUpdatedTotalBookValue(orders, total, order, nextDate, gainLoss, j);
    if (total.quantity !== 0)
      total.ACB = total.bookValue / total.quantity;
    else
      total.ACB  = 0;
  }

  return {'security': security, 'totalGainLoss': total.gainLoss, 'totalQuantity': total.quantity, 'totalBookValue': total.ACB};
};

/**
 * @param {InvestmentType} type
 * @returns {[Security]} of unique securities matching investment type
 */
InvestmentsAccount.prototype.getUniqueSecurities = function(type) {
  return this.transactionsSet.getUniqueSecurities(type);
}

/**
 * @param  {[OrderTransactions]} orders
 * @param  {{number, number, number}} total {quantity, bookValue, ACB}
 * @param  {{string, number}} order {date, quantity, amount}
 * @param  {string} nextDate
 * @param  {number} gainLoss
 * @param  {number} n
 * @returns  {number} new book value after processing transactions
 */
function getUpdatedTotalBookValue (orders, total, order, nextDate, gainLoss, n) {
  // Expiring contract or transaction closes entire position
  if (order.quantity !== 0 && total.quantity === 0)
    total.bookValue = 0;
  // Buy action
  else if (order.quantity > 0 && total.quantity >= 0)
    total.bookValue -= order.amount;
  // Cover transaction
  else if (order.quantity < 0 && total.quantity < 0)
    total.bookValue -= order.amount;
  // Sell action
  else {
    // Calculation is based on superfical loss rule
    total.bookValue += (order.quantity * total.ACB);

    if ((total.quantity !== 0) && isBoughtBackWithin30Days(orders, n) && (gainLoss < 0))
      total.bookValue -= gainLoss;
  }

  return total.bookValue;
};

/**
 * FIXME: check for short covers and buy backs in a future year
 * @param {[OrderTransaction]} orders
 * @param {number} fromIndex
 * @returns {boolean} true if bought back within 30 calendar days fromIndex in orders
 */
function isBoughtBackWithin30Days(orders, fromIndex) {
  var fromDate = new Date(orders[fromIndex][0]), toDate = null;
  var quantity = 0;
  var one_day = 1000 * 60 * 60 * 24; // seconds in an hour

  for (var m = fromIndex + 1; m < orders.length; m++) {
    toDate = new Date(orders[m][0]);
    quantity = orders[m][4];

    //FIXME: check if quantity > than previous sold amount
    if (toDate === null)
      return false;
    else if ((quantity > 0) && ((toDate.getTime() - fromDate.getTime()) / one_day <= 30))
      return true;
    else if (quantity > 0)
      return false;
  }

  return false;
}

// Configuration to run on node with mock data
if (global.RUN_ON_NODE) {
  var TransactionSet = require('./transaction_set.js').TransactionSet;
  var InvestmentType = require('./investment_type.js').InvestmentType;

  module.exports = InvestmentsAccount;
}

/**
 * Performs gain/loss calculation
 * @param totalQuantity
 * @param totalBookValue
 * @param avgCostPerQuantity
 * @param date
 * @param quantity
 * @param amount
 *
function calculateGainLoss(totalQuantity, totalBookValue, avgCostPerQuantity, date, quantity, amount) {
  var gainLoss = 0, totalGainLoss = 0;

  if (quantity < 0) {
    gainLoss = (quantity * avgCostPerQuantity) + amount;
    this.orders[j][6] = gainLoss;
    totalGainLoss = totalGainLoss + gainLoss;
  }

  avgCostPerQuantity = totalBookValue / totalQuantity;
}*/