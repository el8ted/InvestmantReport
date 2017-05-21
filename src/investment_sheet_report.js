/**
 * Created by Tom on 2017-05-14.
 * Class to interact with putting data into report of the active sheet
 */
"use strict";
if (global === undefined)
  var global = {};
global.RUN_ON_NODE = true;

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
 * @param  {Parent of BaseTransaction} transaction
 */
InvestmentSheetReport.prototype.addTransaction = function(transaction) {
  this.investmentsAccount.addTransaction(transaction);
}

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
}

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
          report.push(this.investmentsAccount.getCarryChargeBySecurity(securities[securityKey]));
          break;
        case InvestmentType.DIVIDEND:
          report.push(this.investmentsAccount.getDividendBySecurity(securities[securityKey]));
          break;
        case InvestmentType.INTEREST:
          report.push(this.investmentsAccount.getInterestBySecurity(securities[securityKey]));
          break;
        case InvestmentType.ORDERS:
          report.push(this.investmentsAccount.getRealizedGainLossBySecurity(securities[securityKey]));
      }

  return report;
}

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
  this.report.securityListByType.gainLoss = this.getSecurityListByType(InvestmentType.ORDERS);

  // refresh totals
  var investmentTypes = ['carryCharge', 'dividend', 'interest', 'gainLoss'];
  for (var type in investmentTypes) {
    type = investmentTypes[type];

    for (var j = 0; j < this.report.securityListByType[type].length; j++) {  
      var currency = this.report.securityListByType[type][j].security.getAccountCurrency();
      var amount;

      if (type === 'gainLoss')
        amount = this.report.securityListByType[type][j].totalGainLoss;
      else
        amount = this.report.securityListByType[type][j].amount;
      
      this.report.totals[type][currency] += amount;
    }
  }

  return this.report;
}

// Configuration to run on node with mock data
if (global.RUN_ON_NODE) {
  var Security = require('./security.js').Security;
  var InvestmentType = require('./investment_type.js').InvestmentType;
  var InvestmentsAccount = require('./investments_account.js');

  module.exports.InvestmentSheetReport = InvestmentSheetReport;
}