/**
 * Created by Tom on 2017-05-14.
 * Class to interact with putting data into report of the active sheet
 */
"use strict";


// Configuration to run on node with mock data
global.RUN_ON_NODE = true;
if (global.RUN_ON_NODE) {
  var Security = require('./Transaction.js').Security;
  var InvestmentType = require('./InvestmentType.js').InvestmentType;

  module.exports = InvestmentsReport;
}


var SheetConfig = {
  DataRange: 'K1',
  DateColumns: {'REPORT_TYPE': 0, 'SECURIT_ID': 1, 'AMOUNT': 2, 'GAIN_LOSS': 3, 'QUANTITY': 4, 'ACB': 5 }
};


/**
 * Report class 
 */
function InvestmentsReport(accountCurrency, securityID) {
  this.reportList = {'CARRY_CHARGE': [], 'DIVIDEND': [], 'INTEREST': [], 'GAIN_LOSS': [] };
}


InvestmentsReport.prototype.addCarryChargeSecurity = function(security, amount) {
  return this.reportList[InvestmentType.CARRY_CHARGE] = { security, amount};
}


InvestmentsReport.prototype.addDividendSecurity = function(security, amount) {
  return this.reportList[InvestmentType.DIVIDEND] = { security, amount};
}


InvestmentsReport.prototype.addGainLossSecurity = function(security, amount, quantity, ACB) {
  return this.reportList[InvestmentType.GAIN_LOSS] = { security, amount, quantity, ACB };
}


InvestmentsReport.prototype.addInterestSecurity = function(security, amount) {
  return this.reportList[InvestmentType.INTEREST] = { security, amount};
}


InvestmentsReport.prototype.getReport = function(investmentProcessor) {
  this.processIncomeType(InvestmentType.CARRY_CHARGE, investmentProcessor);
  this.processIncomeType(InvestmentType.DIVIDEND, investmentProcessor);
  this.processIncomeType(InvestmentType.INTEREST, investmentProcessor);
  this.processGainLossType(InvestmentType.GAIN_LOSS, investmentProcessor);
}


InvestmentsReport.prototype.processIncomeType = function(type, investmentProcessor) {

}

InvestmentsReport.prototype.processGainLossType = function(type, investmentProcessor) {

}