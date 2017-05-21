/**
 * Created by Tom on 2017-05-14.
 * Class to interact with putting data into report of the active sheet
 */
"use strict";
global.RUN_ON_NODE = true;

var SheetConfig = {
  DataRange: 'K1',
  DateColumns: {'REPORT_TYPE': 0, 'SECURITY_ID': 1, 'AMOUNT': 2, 'GAIN_LOSS': 3, 'QUANTITY': 4, 'ACB': 5 }
};

/**
 * Report class 
 */
function InvestmentSheetReport() {
  this.investmentsAccount = new InvestmentsAccount();
}

/**
 * @param  {Parent of BaseTransaction} transaction
 */
InvestmentSheetReport.prototype.addTransaction = function(transaction) {
  this.investmentsAccount.addTransaction(transaction);
}

/**
 * @returns {{CARRY_CHARGE: [{}], DIVIDEND: [], INTEREST: [], GAIN_LOSS: [] }}
 */
InvestmentSheetReport.prototype.getReport = function() {
  var reportList = {'carryChage': [], 'dividend': [], 'interest': [], 'gainLoss': [] };

  reportList.carryChage = this.getReportByType(InvestmentType.CARRY_CHARGE);
  reportList.dividend = this.getReportByType(InvestmentType.DIVIDEND);
  reportList.interest = this.getReportByType(InvestmentType.INTEREST);
  reportList.gainLoss = this.getReportByType(InvestmentType.ORDERS);

  return reportList;
}

/**
 * @param {InvestmentType} type
 * @returns  {{CARRY_CHARGE: [{}], DIVIDEND: [], INTEREST: [], GAIN_LOSS: [] }}
 */
InvestmentSheetReport.prototype.getReportByType = function (type) {
  var securities = this.investmentsAccount.getUniqueSecurities(type);
  var securityKey;
  var report = [];

  // TODO: add option order transaction
  for (securityKey in securities)
    if (securities.hasOwnProperty(securityKey))
      switch (type) {
        case InvestmentType.CARRY_CHARGE:
          report.push(this.investmentsAccount.getCarryChargeBySecurity(securities[securityKey]));
        case InvestmentType.DIVIDEND:
          report.push(this.investmentsAccount.getDividendBySecurity(securities[securityKey]));
        case InvestmentType.INTEREST:
          report.push(this.investmentsAccount.getInterestBySecurity(securities[securityKey]));
        case InvestmentType.ORDERS:
          report.push(this.investmentsAccount.getRealizedGainLossBySecurity(securities[securityKey]));
      }
  
  return report;
}

// Configuration to run on node with mock data
if (global.RUN_ON_NODE) {
  var Security = require('./Security.js').Security;
  var InvestmentType = require('./InvestmentType.js').InvestmentType;
  var InvestmentsAccount = require('./InvestmentsAccount.js');

  module.exports.InvestmentSheetReport = InvestmentSheetReport;
}