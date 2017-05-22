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
  totalsSection : {
    topLeftCell: 'K1',
    headerLabels: {},
  },
  securitiesSection: {
    topLeftCell: 'K9',
    headerLabels: {}
  }
};
headerLabels: ['Investment Type', 'CAD', 'USD', 'Total'],

SheetConfig.rowLabels[InvestmentType.CARRY_CHARGE] = 'Carry Charge';
SheetConfig.rowLabels[InvestmentType.DIVIDEND] = 'Dividend';
SheetConfig.rowLabels[InvestmentType.INTEREST] = 'Interest';
SheetConfig.rowLabels[InvestmentType.ORDER] = 'Realized Gain / Loss';


columnHeaders: ['Security', 'Amount', 'Gain / Loss', 'Quantity', 'ACB'],
var ReportTotalColumn = {
  'INVESTMENT_TYPE': 'INVESTMENT_TYPE',
  'TOTAL_CAD': 'TOTAL_CAD', 
  'TOTAL_USD': 'TOTAL_USD',
  'TOTAL': 'TOTAL'
};
var ReportSecuritiesColumn = {
  'SECURITY': 'SECURITY',
  'AMOUNT': 'AMOUNT', 
  'REALIZED_GAIN_LOSSD': 'REALIZED_GAIN_LOSSD',
  'REMAINING_QUANTITY': 'REMAINING_QUANTITY',
  'ACB': 'ACB'
};

/**
 * Report class 
 */
function InvestmentSheetReport() {
  this.investmentsAccount = new InvestmentsAccount();
  this.report = {'totals': null, 'securities': null};
}

/**
 * @param {BaseTransaction} transaction
 */
InvestmentSheetReport.prototype.addTransaction = function(transaction) {
  this.investmentsAccount.addTransaction(transaction);
};

/**
 * Writes report to active sheet using configuration in SheetConfig
 * @param {InvestmentSheetReport} investmentSheetReport
 */
InvestmentSheetReport.prototype.writeReportToActiveSheet = function(investmentSheetReport) {
  refreshReport();

  writeTotalsSectionToActiveSheet();
  //writeSecuritiesSection();
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
function writeTotalsSectionToActiveSheet() {
  // Build array
  var arrayTotals = SheetConfig.totalsSection.headerLabels;
  for (var j = 0, length = report.totals.length; j < length; j++) {
    total = [
      SheetConfig.totalsSection.rowLabels[report.totals[j]],
      report.totals[j].CAD,
      report.totals[j].USD,
      report.totals[j].Total
    ]
  }

  var range = SpreadsheetApp.getActiveSheet()
      .getRange(SheetConfig.totalsSection.topLeftCell)
      .offset(report.totals.length, SheetConfig.totalsSection.headerLabels.length);
  SpreadsheetApp.getActiveSheet()
      .getRange(range)
      .setValues(arrayTotals);
};

/**
 * @param {InvestmentType} type
 * @returns  {{CARRY_CHARGE: [{}], DIVIDEND: [], INTEREST: [], GAIN_LOSS: [] }}
 */
function getSecurityListByType(type)  {
  var securities = this.investmentsAccount.getUniqueSecurities(type);
  var securityKey;
  var report = [];

  // TODO: add option order transaction
  for (securityKey in securities) {
    if (securities.hasOwnProperty(securityKey)) {
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
        default:
      }
    }
  }

  return report;
};

/**
 * @returns {{CARRY_CHARGE: [{}], DIVIDEND: [], INTEREST: [], GAIN_LOSS: [] }}
 */
function refreshReport() {
  // TODO: refactor this function
  this.report.totals = {'carryCharge': {'CAD': 0, 'USD': 0},
                        'dividend':   {'CAD': 0, 'USD': 0},
                        'interest':   {'CAD': 0, 'USD': 0},
                        'gainLoss':   {'CAD': 0, 'USD': 0}};
  this.report.securities = {'carryCharge': [], 'dividend': [], 'interest': [], 'gainLoss': [] };

  // refresh list of securities
  this.report.securities.carryCharge = this.getSecurityListByType(InvestmentType.CARRY_CHARGE);
  this.report.securities.dividend = this.getSecurityListByType(InvestmentType.DIVIDEND);
  this.report.securities.interest = this.getSecurityListByType(InvestmentType.INTEREST);
  this.report.securities.gainLoss = this.getSecurityListByType(InvestmentType.ORDER);

  // refresh totals
  var investmentTypes = ['carryCharge', 'dividend', 'interest', 'gainLoss'];
  for (var type in investmentTypes) {
    if (investmentTypes.hasOwnProperty(type)) {
      var typeValue = investmentTypes[type];

      for (var j = 0; j < this.report.securities[typeValue].length; j++) {
        var currency = this.report.securities[typeValue][j].security.getAccountCurrency();
        var amount;

        if (type === 'gainLoss')
          amount = this.report.securities[typeValue][j].totalGainLoss;
        else
          amount = this.report.securities[typeValue][j].amount;

        this.report.totals[typeValue][currency] += amount;
      }
    }
  }

  return this.report;
};