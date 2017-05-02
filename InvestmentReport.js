/**
 * Created by Tom on 2017-05-01.
 */
/**
 *
 */
function InvestmentReport() {
  this.transactionsDB = new TransactionDB();
}

/**
 * @param transaction
 */
InvestmentReport.prototype.addTransaction = function(transaction) {
  this.transactionsDB.addTransaction(transaction);
};



/**
 *
 */
InvestmentReport.prototype.getInterestReport = function(transaction) {

};



/**
 *
 */
InvestmentReport.prototype.getCarryChargesReport = function(transaction) {
  return this.transactions['CARRY_CHARGE'];
};



/**
 *
 */
InvestmentReport.prototype.getCapitalGainLossReport = function(transaction) {
  return this.transactions['GAIN_LOSS'];
};



/**
 *
 */
InvestmentReport.prototype.getSummary = function(transaction) {
  return {'INTEREST': this.getIncomeReport(),
          'CARRY_CHARGE': this.getCarryChargesReport(),
          'GAIN_LOSS': this.getCapitalGainLossReport()};
};