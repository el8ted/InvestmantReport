/**
 * Created by Tom on 2017-05-14.
 * Class to interact with putting data into report of the active sheet
 */
"use strict";


var SheetConfig = {
  DataRange: 'K1',
  DateColumns: {'REPORT_TYPE': 0, 'SECURIT_ID': 1, 'AMOUNT': 2, 'GAIN_LOSS': 3, 'QUANTITY': 4, 'ACB': 5 }
};

var IncomeSecurity = {'SECURITY': null, 'AMOUNT': null};
var CarryChargeSecurity = {'SECURITY': null, 'AMOUNT': null};
var DividendSecurity = {'SECURITY': null, 'AMOUNT': null};


/**
 * Report class 
 */
function InvestmentsReport(accountCurrency, securityID) {
  this.reportList = {'CARRY_CHARGE': [], 'DIVIDEND': [], 'INTEREST': [], 'GAIN_LOSS': [] };

  this.investmentsProcessor = new InvestmentsProcessor();
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


InvestmentsReport.prototype.addTransaction = function() {
  return this.investmentsProcessor.addTransaction;
}


InvestmentsReport.prototype.getReport = function(investmentProcessor) {
  this.processIncomeType(InvestmentType.CARRY_CHARGE, investmentProcessor);
  this.processIncomeType(InvestmentType.DIVIDEND, investmentProcessor);
  this.processIncomeType(InvestmentType.INTEREST, investmentProcessor);
  this.processGainLossType(InvestmentType.GAIN_LOSS, investmentProcessor);
}

/**
 * @return {[{security, totalGainLoss, totalQuantity, totalBookValue}]}
 */
InvestmentsReport.prototype.getRealizedGainLossSecurities = function () {
  var securityIDs = this.investmentsProcessor.getUniqueSecurities(InvestmentType.ORDERS);
  var securityKey;
  var gainLossReport = [];

  // TODO: add option order transaction
  for (securityKey in securityIDs)
    if (securityIDs.hasOwnProperty(securityKey))
      gainLossReport.push(this.getRealizedGainLossBySecurity(securityIDs[securityKey]));
  

  return gainLossReport;
};


// Configuration to run on node with mock data
global.RUN_ON_NODE = true;
if (global.RUN_ON_NODE) {
  var Security = require('./Security.js').Security;
  var InvestmentType = require('./InvestmentType.js').InvestmentType;
  var InvestmentsProcessor = require('./InvestmentsProcessor.js');

  module.exports.InvestmentsReport = InvestmentsReport;
  module.exports.CarryChargeSecurity = CarryChargeSecurity;
  module.exports.DividendSecurity = DividendSecurity;
  module.exports.OrderSecurity = OrderSecurity;
}