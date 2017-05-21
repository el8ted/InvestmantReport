/**
 * Created by Tom on 2017-05-14.
 * Class to interact with putting data into report of the active sheet
 */
"use strict";


var SheetConfig = {
  DataRange: 'K1',
  DateColumns: {'REPORT_TYPE': 0, 'SECURITY_ID': 1, 'AMOUNT': 2, 'GAIN_LOSS': 3, 'QUANTITY': 4, 'ACB': 5 }
};

/**
 * Report class 
 */
function InvestmentsReport() {
  this.InvestmentsAccount = new InvestmentsAccount();

  /**
   * @param {InvestmentType} type
   * @returns  {{CARRY_CHARGE: [{}], DIVIDEND: [], INTEREST: [], GAIN_LOSS: [] }}
   */
  function getReportByType(type) {
    var securities = this.InvestmentsAccount.getUniqueSecurities(type);
    var securityKey;
    var report = [];

    // TODO: add option order transaction
    for (securityKey in securities)
      if (securities.hasOwnProperty(securityKey))
        switch (securities[securityKey].getInvestmentType()) {
          case InvestmentType.CARRY_CHARGE:
            report.push(this.InvestmentsAccount.getCarryChargeBySecurity(securityIDs[securityKey]));
          case InvestmentType.DIVIDEND:
            report.push(this.InvestmentsAccount.getDividendBySecuirty(securityIDs[securityKey]));
          case InvestmentType.INTEREST:
            report.push(this.InvestmentsAccount.getInterestBySecurity(securityIDs[securityKey]));
          case InvestmentType.GAIN_LOSS:
            report.push(this.InvestmentsAccount.getRealizedGainLossBySecurity(securityIDs[securityKey]));
        }
    
    return report;
  }
}

/**
 * @param  {Parent of BaseTransaction} transaction
 */
InvestmentsReport.prototype.addTransaction = function(transaction) {
  this.InvestmentsAccount.addTransaction(transaction);
}

/**
 * @returns {{CARRY_CHARGE: [{}], DIVIDEND: [], INTEREST: [], GAIN_LOSS: [] }}
 */
InvestmentsReport.prototype.getReport = function() {
  var reportList = {'carryChage': [], 'dividend': [], 'interest': [], 'gainLoss': [] };

  reportList.carryChage = this.getReportByType(InvestmentType.CARRY_CHARGE);
  reportList.dividend = this.getReportByType(InvestmentType.DIVIDEND);
  reportList.interest = this.getReportByType(InvestmentType.INTEREST);
  reportList.gainLoss = this.getReportByType(InvestmentType.ORDERS);

  return reportList;
}

// Configuration to run on node with mock data
global.RUN_ON_NODE = true;
if (global.RUN_ON_NODE) {
  var Security = require('./Security.js').Security;
  var InvestmentType = require('./InvestmentType.js').InvestmentType;
  var InvestmentsAccount = require('./InvestmentsAccount.js');

  module.exports.InvestmentsSheetReport = InvestmentsSheetReport;
  module.exports.CarryChargeSecurity = CarryChargeSecurity;
  module.exports.DividendSecurity = DividendSecurity;
  module.exports.OrderSecurity = OrderSecurity;
}

/**
var IncomeSecurity = {'security': null, 'amount': null};
var CarryChargeSecurity = {'security': null, 'amount': null};;
var DividendSecurity = {'security': null, 'amount': null};;*/