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
 * @param transaction
 */
InvestmentsProcessor.prototype.addTransaction = function (transaction) {
  this.transactionsSet.addTransaction(transaction);
};


/**
 * @return {array}
 */
InvestmentsProcessor.prototype.getCarryChargeSecurities = function () {
  return this.transactionsSet.getCarryChargeTransactions();
};


/**
 * @return {array}
 */
InvestmentsProcessor.prototype.getInterestSecurities = function () {
  return this.transactionsSet.getInterestTransactions();
};


/**
 * @return {Array}
 */
InvestmentsProcessor.prototype.getRealizedGainLossSecurities = function () {
  var securityIDs = this.transactionsSet.getUniqueSecurities(InvestmentType.ORDERS);
  var securityKey;
  var gainLossReport = [], gainLossSecurity = [];

  // TODO: add option order transaction
  for (securityKey in securityIDs)
    if (securityIDs.hasOwnProperty(securityKey)) {
      gainLossSecurity = [];
      gainLossSecurity.push(securityIDs[securityKey]);
      gainLossSecurity.push(this.getRealizedGainLossBySecurity(securityIDs[securityKey]));

      gainLossReport.push(gainLossSecurity);
    }

  return gainLossReport;
};


/**
 * @param security
 * @return {[*,*,*]}
 */
InvestmentsProcessor.prototype.getRealizedGainLossBySecurity = function (security) {
  var orders = this.transactionsSet.getOrderTransactions(security);
  var totalQuantity = 0, totalBookValue = 0, avgCostPerQuantity = 0, totalGainLoss = 0;
  var nextDate, date, amount = 0, quantity = 0, gainLoss = 0, usdRate = null;

  for (var j = 0; j < orders.length; j++) {
    if (j + 1 < orders.length)
      nextDate = orders[j + 1].getTradeDate();
    else
      nextDate = null;

    date = orders[j].getTradeDate();
    amount = Number(orders[j].getAmount());
    quantity = Number(orders[j].getQuantity());
    usdRate = (orders[j].getUSDRate()) ? Number(orders[j].getUSDRate()): null;

    // Convert USD values to CAD
    if (usdRate !== null)
      amount = amount * usdRate;

    // Catch rounding errors
    totalQuantity = totalQuantity + quantity;
    if (Math.abs(totalQuantity) < 0.001)
      totalQuantity = 0;

    // Record gain/loss for closing transactions (sell, or buy to cover)
    if ((quantity < 0 && totalQuantity >= 0) || (quantity > 0 && totalQuantity <= 0)) {
      gainLoss = (quantity * avgCostPerQuantity) + amount;

      if (totalQuantity === 0 || nextDate === null || gainLoss >= 0 || (gainLoss < 0 && isBoughtBackWithin30Days(orders, j) === false))
        totalGainLoss = totalGainLoss + gainLoss;
    }

    totalBookValue = this.getUpdatedTotalBookValue(orders, totalQuantity, totalBookValue, avgCostPerQuantity, date, quantity, amount, nextDate, gainLoss, j);
    if (totalQuantity !== 0)
      avgCostPerQuantity = totalBookValue / totalQuantity;
    else
      avgCostPerQuantity = 0;
  }

  return [totalGainLoss, totalQuantity, totalBookValue];
};


/**
 * @param orders
 * @param totalQuantity
 * @param totalBookValue
 * @param avgCostPerQuantity
 * @param date
 * @param quantity
 * @param amount
 * @param nextDate
 * @param gainLoss
 * @param n
 * @return {*}
 */
InvestmentsProcessor.prototype.getUpdatedTotalBookValue = function (orders, totalQuantity, totalBookValue, avgCostPerQuantity, date, quantity, amount, nextDate, gainLoss, n) {
  // Expiring contract or transaction closes entire position
  if (quantity !== 0 && totalQuantity === 0)
    totalBookValue = 0;
  // Buy action
  else if (quantity > 0 && totalQuantity >= 0)
    totalBookValue = totalBookValue - amount;
  // Cover transaction
  else if (quantity < 0 && totalQuantity < 0)
    totalBookValue = totalBookValue - amount;
  // Sell action
  else {
    // Calculation is based on superfical loss rule
    totalBookValue = totalBookValue + (quantity * avgCostPerQuantity);

    if ((totalQuantity !== 0) && isBoughtBackWithin30Days(orders, n) && (gainLoss < 0))
      totalBookValue = totalBookValue - gainLoss;
  }

  return totalBookValue;
};


/**
 * Performs gain/loss calculation
 * @param totalQuantity
 * @param totalBookValue
 * @param avgCostPerQuantity
 * @param date
 * @param quantity
 * @param amount
 */
function calculateGainLoss(totalQuantity, totalBookValue, avgCostPerQuantity, date, quantity, amount) {
  var gainLoss = 0, totalGainLoss = 0;

  if (quantity < 0) {
    gainLoss = (quantity * avgCostPerQuantity) + amount;
    this.orders[j][6] = gainLoss;
    totalGainLoss = totalGainLoss + gainLoss;
  }

  avgCostPerQuantity = totalBookValue / totalQuantity;
}


/**
 * return true if bought back within 30 calendar days
 * FIXME: check for short covers and buy backs in a future year
 * @param orders
 * @param fromIndex
 * @return {boolean}
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

  module.exports = InvestmentsProcessor;
}