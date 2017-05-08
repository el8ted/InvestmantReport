/**
 * Created by Tom on 2017-05-01.
 */

/**
 *
 */
//var InvestmentReport = (function() {
  function InvestmentReport() {
    this.transactionsSet = new TransactionSet();
  }

  /**
   * @param transaction
   */
  InvestmentReport.prototype.addTransaction = function(transaction) {
    this.transactionsSet.addTransaction(transaction);
  };

  /**
   *
   */
  InvestmentReport.prototype.getCarryChargesReport = function(transaction) {
    return this.transactionsSet.getCarryChargeTransactions();
  };

  /**
   *
   */
  InvestmentReport.prototype.getInterestReport = function(transaction) {
    return this.transactionsSet.getInterestTransactions();
  };

  /**
   *
   */
  InvestmentReport.prototype.getRealizedGainLossReport = function(transaction) {
    this.getRealizedGainLossOnSecurityID(symbol);
    return this.transactions['GAIN_LOSS'];
  };

  /**
   *
   */
  InvestmentReport.prototype.getSummary = function(transaction) {
    return {'INTEREST': this.getInterestReport(),
            'CARRY_CHARGE': this.getCarryChargesReport(),
            'GAIN_LOSS': this.getRealizedGainLossReport()};
  };


  /**
   *
   */
  InvestmentReport.prototype.getRealizedGainLossOnSecurityID = function(symbol) {
    var transactionList = getBuySellTransactions(symbol);
    var totalQuantity = 0, totalBookValue = 0, avgCostPerQuantity = 0, totalGainLoss = 0;
    var nextDate, date, amount = 0, quantity = 0, gainLoss = 0, fxRate = 0;

    for (j = 0; j < transactionList.length; j++) {
      if (j+1 < transactionList.length)
        nextDate = transactionList[j+1][0];
      else
        nextDate = null;

      date = transactionList[j][0];
      amount = Number(transactionList[j][3]);
      quantity = Number(transactionList[j][4]);
      fxRate = Number(transactionList[j][6]);

      // Convert USD values to CAD
      if (fxRate != "")
        amount = amount * fxRate;

      // Catch rounding errors
      totalQuantity = totalQuantity + quantity;
      if (Math.abs(totalQuantity) < 0.001)
        totalQuantity = 0;

      // Record gain/loss for closing transactions (sell, or buy to cover)
      if ((quantity < 0 && totalQuantity >= 0)  || (quantity > 0 && totalQuantity <= 0)) {
        gainLoss = (quantity * avgCostPerQuantity) + amount;

        if (totalQuantity == 0 || nextDate == null || gainLoss >= 0 || (gainLoss < 0 && isBoughtBackWithin30Days(transactionList, j) == false)) {
          transactionList[j][6] = gainLoss;
          totalGainLoss = totalGainLoss + gainLoss;
        }
      }

      totalBookValue = getUpdatedTotalBookValue(transactionList, totalQuantity, totalBookValue, avgCostPerQuantity, date, quantity, amount, nextDate, gainLoss, j);
      if (totalQuantity != 0)
        avgCostPerQuantity = totalBookValue / totalQuantity;
      else
        avgCostPerQuantity = 0;
    }

    return [totalGainLoss, totalQuantity, totalBookValue];
  };


  /**
   *
   */
  InvestmentReport.prototype.getUpdatedTotalBookValue = function(transactionList, totalQuantity, totalBookValue, avgCostPerQuantity, date, quantity, amount, nextDate, gainLoss, n) {
    // Expiring contract
    if (quantity != 0 && totalQuantity == 0)
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

      if (totalQuantity !=0 && isBoughtBackWithin30Days(transactionList, n) && gainLoss < 0)
        totalBookValue = totalBookValue - gainLoss;
    }

    return totalBookValue;
  };
//})();

/**
 * Performs gain/loss calculation
 */
function calculateGainLoss (totalQuantity, totalBookValue, avgCostPerQuantity, date, quantity, amount) {
  if (quantity < 0) {
    gainLoss = (quantity * avgCostPerQuantity) + amount;
    transactionList[j][6] = gainLoss;
    totalGainLoss = totalGainLoss + gainLoss;
  }

  avgCostPerQuantity = totalBookValue / totalQuantity;
}


/**
 * return true if bought back within 30 calendar days
 * FIXME: check for short covers and buy backs in a future year
 */
function isBoughtBackWithin30Days (transactionList, fromIndex) {
  var fromDate = new Date (transactionList[fromIndex][0]);
  var toDate = null, quantity = 0;
  var one_day = 1000*60*60*24; // seconds in an hour

  for (m = fromIndex+1; m < transactionList.length; m++) {
    toDate = new Date (transactionList[m][0]);
    quantity = transactionList[m][4];

    //FIXME: check if quantity > than previous sold amount
    if (toDate == null)
      return false;
    else if (quantity > 0 && (toDate.getTime() - fromDate.getTime())/one_day <= 30)
      return true;
    else if (quantity > 0)
      return false;
  }

  return false;
}