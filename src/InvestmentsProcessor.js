/**
 * Created by Tom on 2017-05-01.
 */
"use strict";

/**
 * InvestmentsProcessor class
 */
function InvestmentsProcessor() {
  this.transactionsSet = new TransactionSet();
}

/**
 * @param {Parent of BaseTransaction} transaction
 */
InvestmentsProcessor.prototype.addTransaction = function (transaction) {
  this.transactionsSet.addTransaction(transaction);
};

/**
 * @param {Security} security
 * @return {array} of CarryChargeTransactions
 */
InvestmentsProcessor.prototype.getCarryChargeBySecurity = function (security) {
  return this.transactionsSet.getCarryChargeTransactions();
};

/**
 * @param {Security} security
 * @return {array} of InterestTransactions
 */
InvestmentsProcessor.prototype.getInterestBySecurity = function (security) {
  return this.transactionsSet.getInterestTransactions();
};

/**
 * @param {Security} security
 * @returns {{totalGainLoss, totalQuantity, totalBookValue}}
 */
InvestmentsProcessor.prototype.getRealizedGainLossBySecurity = function (security) {
  var orders = this.transactionsSet.getOrderTransactions(security);
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
    if (usdRate !== null)
      amount = amount * usdRate;

    // Catch rounding errors
    total.quantity = total.quantity + order.quantity;
    if (Math.abs(total.quantity) < 0.001)
      total.quantity = 0;

    // Record gain/loss for closing transactions (sell, or buy to cover)
    if (((order.quantity < 0) && (total.Quantity >= 0)) || ((order.quantity > 0) && (total.quantity <= 0))) {
      gainLoss = (order.quantity * total.ACB ) + order.amount;

      if ((total.quantity === 0) || (nextDate === null) || (gainLoss >= 0) ||
          ((gainLoss < 0) && (isBoughtBackWithin30Days(orders, j) === false)))
        total.gainLoss = total.gainLoss + gainLoss;
    }

    total.bookValue = this.getUpdatedTotalBookValue(orders, total, order, nextDate, gainLoss, j);
    if (total.quantity !== 0)
      total.ACB = total.bookValue / total.quantity;
    else
      total.ACB  = 0;
  }

  return {'totalGainLoss': totalGainLoss, 'totalQuantity': totalQuantity, 'totalBookValue': totalBookValue};
};

/**
 * @returns {array} of unique securities of type Security
 */
InvestmentsProcessor.prototype.getUniqueSecurities = function() {
  return this.transactionsSet.getUniqueSecurities();
}

/**
 * @param  {[OrderTransaction]} orders
 * @param  {{number, number, number}} total {quantity, bookValue, avgCostPerQuantity}
 * @param  {{string, number}} {date, quantity, amount}
 * @param  {string} nextDate
 * @param  {number} gainLoss
 * @param  {number} n
 * @returns  {number} new book value after processing transactions
 */
InvestmentsProcessor.prototype.getUpdatedTotalBookValue = function (orders, total, order, nextDate, gainLoss, n) {
  // Expiring contract or transaction closes entire position
  if (quantity !== 0 && total.quantity === 0)
    total.bookValue = 0;
  // Buy action
  else if (quantity > 0 && total.quantity >= 0)
    totalBookValue = totalBookValue - amount;
  // Cover transaction
  else if (quantity < 0 && total.quantity < 0)
    total.bookValue = total.bookValue - amount;
  // Sell action
  else {
    // Calculation is based on superfical loss rule
    total.bookValue = total.bookValue + (quantity * this.ACB);

    if ((total.quantity !== 0) && isBoughtBackWithin30Days(orders, n) && (gainLoss < 0))
      total.bookValue = total.bookValue - gainLoss;
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
  var fromDate = new Date(orders[fromIndex][0]);
  var toDate = null, quantity = 0;
  var one_day = 1000 * 60 * 60 * 24; // seconds in an hour

  for (var m = fromIndex + 1; m < orders.length; m++) {
    toDate = new Date(orders[m][0]);
    quantity = orders[m][4];

    //FIXME: check if quantity > than previous sold amount
    if (toDate === null)
      return false;
    else if (quantity > 0 && (toDate.getTime() - fromDate.getTime()) / one_day <= 30)
      return true;
    else if (quantity > 0)
      return false;
  }

  return false;
}


// Configuration to run on node with mock data
global.RUN_ON_NODE = true;
if (global.RUN_ON_NODE) {
  var TransactionSet = require('./TransactionSet.js').TransactionSet;
  var InvestmentType = require('./InvestmentType.js').InvestmentType;

  var InvestmentsReportModule = require('./InvestmentsReport.js');
  InvestmentsReport = InvestmentsReportModule.InvestmentsReport;
  CarryChargeSecurity = InvestmentsReportModule.CarryChargeSecurity;
  DividendSecurity = InvestmentsReportModule.DividendSecurity;
  OrderSecurity = InvestmentsReportModule.OrderSecurity;

  module.exports = InvestmentsProcessor;
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