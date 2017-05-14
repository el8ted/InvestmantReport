/**
 * Created by Tom on 2017-05-01.
 */
"use strict";
const TransactionSet = require('./TransactionSet.js');


function InvestmentReport() {
  this.transactionsSet = new TransactionSet();
}


/**
 * @param transaction
 */
InvestmentReport.prototype.addTransaction = function (transaction) {
  this.transactionsSet.addTransaction(transaction);
};


/**
 * @return {array}
 */
InvestmentReport.prototype.getCarryChargesReport = function () {
  return this.transactionsSet.getCarryChargeTransactions();
};


/**
 * @return {array}
 */
InvestmentReport.prototype.getInterestReport = function () {
  return this.transactionsSet.getInterestTransactions();
};


/**
 * @return {Array}
 */
InvestmentReport.prototype.getRealizedGainLossReport = function () {
  var securityIDs = this.transactionsSet.getUniqueSecurities(TransactionType.ORDERS);
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
 * @return {{INTEREST: array, CARRY_CHARGE: array, GAIN_LOSS: Array}}
 */
InvestmentReport.prototype.getSummary = function () {
  return {
    'INTEREST': this.getInterestReport(),
    'CARRY_CHARGE': this.getCarryChargesReport(),
    'GAIN_LOSS': this.getRealizedGainLossReport()
  };
};


/**
 * @param security
 * @return {[*,*,*]}
 */
InvestmentReport.prototype.getRealizedGainLossBySecurity = function (security) {
  var orders = this.transactionsSet.getOrderTransactions(security);
  var totalQuantity = 0, totalBookValue = 0, avgCostPerQuantity = 0, totalGainLoss = 0;
  var nextDate, date, amount = 0, quantity = 0, gainLoss = 0, usdRate = 0;

  for (var j = 0; j < orders.length; j++) {
    if (j + 1 < orders.length)
      nextDate = orders[j + 1].getTradeDate();
    else
      nextDate = null;

    date = orders[j].getTradeDate();
    amount = Number(orders[j].getAmount());
    quantity = Number(orders[j].getQuantity());
    usdRate = Number(orders[j].getUSDRate());

    // Convert USD values to CAD
    if (usdRate !== '')
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
InvestmentReport.prototype.getUpdatedTotalBookValue = function (orders, totalQuantity, totalBookValue, avgCostPerQuantity, date, quantity, amount, nextDate, gainLoss, n) {
  // Expiring contract
  if (quantity !== 0 && totalQuantity === 0)
    totalBookValue = 0;
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

module.exports = InvestmentReport;