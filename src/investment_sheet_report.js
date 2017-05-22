/**
 * @license MIT
 *
 * @fileoverview Class to interact with putting data into report of the active sheet
 *
 * @author tomek32@gmail.com Tom Hosiawa
 */
"use strict";

// Configuration to run on node with mock data
if (typeof process !== 'undefined' && process.release.name === 'node') {
  var Security = require('./security.js').Security;
  var InvestmentType = require('./investment_type.js').InvestmentType;
  var InvestmentsAccount = require('./investments_account.js');

  module.exports.InvestmentSheetReport = InvestmentSheetReport;
}

var SheetConfig = {
  totalsStartCell: 'K1',
  securityListByTypeStartCell: 'K9',
  securityListByTypeColumns: {'REPORT_TYPE': 0, 'SECURITY_ID': 1, 'AMOUNT': 2, 'GAIN_LOSS': 3, 'QUANTITY': 4, 'ACB': 5 }
};

/**
 * Report class 
 */
function InvestmentSheetReport() {
  this.investmentsAccount = new InvestmentsAccount();
  this.report = {'totals': null, 'securityListByType': null};
}

/**
 * @param  {BaseTransaction} transaction
 */
InvestmentSheetReport.prototype.addTransaction = function(transaction) {
  this.investmentsAccount.addTransaction(transaction);
};

/**
 * @returns { totals: {carryChage: {CAD: 0, USD: 0},
 *                     dividend:   {CAD: 0, USD: 0},
 *                     interest:   {CAD: 0, USD: 0},
 *                     gainLoss:   {CAD: 0, USD: 0}},
 *            securityList: {carryCharge: [{Security}, amount: {Number}],
 *                           dividend:    [{Security}, amount: {Number}],
 *                           interest:    [{Security}, amount: {Number}],
 *                           gainLoss:    [{Security}, gainLoss: {Number}, quantity: {Number}, ACB: {Number}]}}
 */
InvestmentSheetReport.prototype.getReport = function() {
  this.refreshReport();
  return this.report;
};

/**
 * @param {InvestmentType} type
 * @returns  {{CARRY_CHARGE: [{}], DIVIDEND: [], INTEREST: [], GAIN_LOSS: [] }}
 */
InvestmentSheetReport.prototype.getSecurityListByType = function (type) {
  var securities = this.investmentsAccount.getUniqueSecurities(type);
  var securityKey;
  var report = [];

  // TODO: add option order transaction
  for (securityKey in securities)
    if (securities.hasOwnProperty(securityKey))
      switch (type) {
        case InvestmentType.CARRY_CHARGE:
          report.push(this.investmentsAccount.getTotalCarryChargeBySecurity(securities[securityKey]));
          break;
        case InvestmentType.DIVIDEND:
          report.push(this.investmentsAccount.getTotalDividendBySecurity(securities[securityKey]));
          break;
        case InvestmentType.INTEREST:
          report.push(this.investmentsAccount.getTotalInterestBySecurity(securities[securityKey]));
          break;
        case InvestmentType.ORDERS:
          report.push(this.investmentsAccount.getTotalRealizedGainLossBySecurity(securities[securityKey]));
      }

  return report;
};

/**
 * @returns {{CARRY_CHARGE: [{}], DIVIDEND: [], INTEREST: [], GAIN_LOSS: [] }}
 */
InvestmentSheetReport.prototype.refreshReport = function() {
  // TODO: refactor this function
  this.report.totals = {'carryCharge': {'CAD': 0, 'USD': 0},
                        'dividend':   {'CAD': 0, 'USD': 0},
                        'interest':   {'CAD': 0, 'USD': 0},
                        'gainLoss':   {'CAD': 0, 'USD': 0}};
  this.report.securityListByType = {'carryCharge': [], 'dividend': [], 'interest': [], 'gainLoss': [] };

  // refresh list of securities
  this.report.securityListByType.carryCharge = this.getSecurityListByType(InvestmentType.CARRY_CHARGE);
  this.report.securityListByType.dividend = this.getSecurityListByType(InvestmentType.DIVIDEND);
  this.report.securityListByType.interest = this.getSecurityListByType(InvestmentType.INTEREST);
  this.report.securityListByType.gainLoss = this.getSecurityListByType(InvestmentType.ORDER);

  // refresh totals
  var investmentTypes = ['carryCharge', 'dividend', 'interest', 'gainLoss'];
  for (var type in investmentTypes) {
    if (investmentTypes.hasOwnProperty(type)) {
      var typeValue = investmentTypes[type];

      for (var j = 0; j < this.report.securityListByType[typeValue].length; j++) {
        var currency = this.report.securityListByType[typeValue][j].security.getAccountCurrency();
        var amount;

        if (type === 'gainLoss')
          amount = this.report.securityListByType[typeValue][j].totalGainLoss;
        else
          amount = this.report.securityListByType[typeValue][j].amount;

        this.report.totals[typeValue][currency] += amount;
      }
    }
  }

  return this.report;
};

/**
 * Writes report to active sheet
 * @param {InvestmentSheetReport} investmentSheetReport
 */
var writeReportToActiveSheet = function (investmentSheetReport) {
  var report = investmentSheetReport.getReport();
  var arrayTotals = [['Investment Type',      'CAD',                         'USD'],
                     ['Carry Charge',         report.totals.carryCharge.CAD, report.totals.carryCharge.USD],
                     ['Interest',             report.totals.interest.CAD,    report.totals.interest.USD],
                     ['Dividends',            report.totals.dividend.CAD,    report.totals.dividend.USD],
                     ['Realized Gain & Loss', report.totals.gainLoss.CAD,    report.totals.gainLoss.USD]];

  SpreadsheetApp.setActiveSheet(SpreadsheetApp.getActiveSpreadsheet().getSheetByName("2011 New")); //TODO: For debug mode only
  var sheet = SpreadsheetApp.getActiveSheet().getRange("K2:M6").setValues(arrayTotals);
};