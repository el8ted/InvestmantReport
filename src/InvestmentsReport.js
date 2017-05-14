/**
 * Created by Tom on 2017-05-14.
 * Class to interact with putting data into report of the active sheet
 */
"use strict";


// Configuration to run on node with mock data
gobal.RUN_ON_NODE = true;
if (global.RUN_ON_NODE) {
  var Security = require('./Transaction.js').Security;
  var InvestmentType = require('./InvestmentType.js').InvestmentType;
}


var SheetConfig = {
  DataRange: 'K1',
  DateColumns: {'REPORT_TYPE': 0, 'SECURIT_ID': 1, 'AMOUNT': 2, 'GAIN_LOSS': 3, 'QUANTITY': 4, 'ACB': 5 }
};


/**
 * Report class 
 */
function InvestmentRepoort(accountCurrency, securityID) {
  this.reportList = {'CARRY_CHARGE': [], 'DIVIDEND': [], 'INTEREST': [], 'GAIN_LOSS': [] };
}


Security.prototype.addCarryChargeSecurity = function(security, amount) {
  return this.reportList[InvestmentType.CARRY_CHARGE] = { security, amount};
}


Security.prototype.addDividendSecurity = function(security, amount) {
  return tthis.reportList[InvestmentType.DIVIDEND] = { security, amount};
}


Security.prototype.addInterestSecurity = function(security, amount) {
  return this.reportList[InvestmentType.INTEREST] = { security, amount};
}


Security.prototype.addGainLossSecurity = function(security, amount, quantity, ACB) {
  return this.reportList[InvestmentType.GAIN_LOSS] = { security, amount, quantity, ACB };
}