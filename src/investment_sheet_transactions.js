/**
 * @license MIT
 *
 * @fileoverview Utility to interact with getting data from active sheet and put report in the same active sheet
 *
 * @author tomek32@gmail.com Tom Hosiawa
 */

// Configuration to run on node with mock data
if (typeof process !== 'undefined' && process.release.name === 'node') {
  var SpreadSheetAppModule = require('./mock_google_service/spreadsheet_app.js');
  var SpreadsheetApp = new SpreadSheetAppModule.SpreadsheetApp();
  var ArrayLib = new SpreadSheetAppModule.ArrayLib();

  var Security = require('./security.js').Security;
  var TransactionModule = require('./transaction.js');
  var BaseTransaction = TransactionModule.BaseTransaction;
  var DividendTransaction = TransactionModule.DividendTransaction;
  var InterestTransaction = TransactionModule.InterestTransaction;
  var CarryChargeTransaction = TransactionModule.CarryChargeTransaction;
  var OrderTransaction = TransactionModule.OrderTransaction;
  var OptionOrderTransaction = TransactionModule.OptionOrderTransaction;

  var InvestmentSheetReport = require('./investment_sheet_report.js').InvestmentSheetReport;

  function node_init() {
    main();
  }

  module.exports = node_init;
}


var SheetConfig = {
  DataRange: 'A:H',
  DataColumns: {'TRADE_DATE': 0, 'ACCOUNT': 1, 'SECURITY_ID': 2, 'AMOUNT': 3, 'QUANTITY': 4, 'DIVIDEND': 5, 'USD_RATE': 6 }
};

/**
 * Creates a Transaction object from transaction array values and adds it to investmentSheetReport
 * @param {InvestmentSheetReport} investmentSheetReport
 * @param {SheetConfig.DataColumns} transaction
 */
var addTransaction = function (investmentSheetReport, transaction) {
  if ((transaction[SheetConfig.DataColumns.AMOUNT] !== '') &&
      (transaction[SheetConfig.DataColumns.QUANTITY] === '') &&
      (transaction[SheetConfig.DataColumns.DIVIDEND]) === '') {

        if (transaction[SheetConfig.DataColumns.AMOUNT] >= 0) {
          var transaction = new InterestTransaction(
              transaction[SheetConfig.DataColumns.ACCOUNT],
              transaction[SheetConfig.DataColumns.SECURITY_ID],
              transaction[SheetConfig.DataColumns.TRADE_DATE],
              transaction[SheetConfig.DataColumns.AMOUNT],
              transaction[SheetConfig.DataColumns.USD_RATE]);
          investmentSheetReport.addTransaction(transaction);
        }
        else {
          var transaction = new CarryChargeTransaction(
              transaction[SheetConfig.DataColumns.ACCOUNT],
              transaction[SheetConfig.DataColumns.SECURITY_ID],
              transaction[SheetConfig.DataColumns.TRADE_DATE],
              transaction[SheetConfig.DataColumns.AMOUNT],
              transaction[SheetConfig.DataColumns.USD_RATE]);
          investmentSheetReport.addTransaction(transaction);
          
          return;
        }
  }

  if (transaction[SheetConfig.DataColumns.DIVIDEND] !== '') {
    var dividend = new DividendTransaction(
        transaction[SheetConfig.DataColumns.ACCOUNT],
        transaction[SheetConfig.DataColumns.SECURITY_ID],
        transaction[SheetConfig.DataColumns.TRADE_DATE],
        transaction[SheetConfig.DataColumns.DIVIDEND],
        transaction[SheetConfig.DataColumns.USD_RATE],
        transaction[SheetConfig.DataColumns.QUANTITY]);
    investmentSheetReport.addTransaction(dividend);
  }

  if (transaction[SheetConfig.DataColumns.QUANTITY] !== '') {
    if ((transaction[SheetConfig.DataColumns.SECURITY_ID].slice(5) === 'CALL-') ||
        (transaction[SheetConfig.DataColumns.SECURITY_ID].slice(5) === 'PUT-')) {
      // TODO: remove hard coding of multiplier
      var order = new OptionOrderTransaction(
          transaction[SheetConfig.DataColumns.ACCOUNT],
          transaction[SheetConfig.DataColumns.SECURITY_ID],
          transaction[SheetConfig.DataColumns.TRADE_DATE],
          transaction[SheetConfig.DataColumns.AMOUNT],
          transaction[SheetConfig.DataColumns.USD_RATE],
          transaction[SheetConfig.DataColumns.QUANTITY],
          100);
      investmentSheetReport.addTransaction(order);
    }
    else {
      var order = new OrderTransaction(
          transaction[SheetConfig.DataColumns.ACCOUNT],
          transaction[SheetConfig.DataColumns.SECURITY_ID],
          transaction[SheetConfig.DataColumns.TRADE_DATE],
          transaction[SheetConfig.DataColumns.AMOUNT],
          transaction[SheetConfig.DataColumns.USD_RATE],
          transaction[SheetConfig.DataColumns.QUANTITY]);
      investmentSheetReport.addTransaction(order);
    }
  }
};

/**
 * @return {SheetConfig.DataColumns[]} returns list of transactions. sorted from oldest to nearest (i.e. jan - dec)
 */
var loadAllTransactionsFromActiveSheet = function () {
  var sheetTransactions = SpreadsheetApp.getActiveSheet().getRange(SheetConfig.DataRange).getValues();

  // Remove header row
  sheetTransactions.splice(0, 1);

  for (var i = sheetTransactions.length - 1; i >= 0; --i) {
    if ((sheetTransactions[i][SheetConfig.DataColumns.TRADE_DATE] === '') &&
        (sheetTransactions[i][SheetConfig.DataColumns.ACCOUNT] === '') &&
        (sheetTransactions[i][SheetConfig.DataColumns.SECURITY_ID] === '') &&
        (sheetTransactions[i][SheetConfig.DataColumns.AMOUNT] === '') &&
        (sheetTransactions[i][SheetConfig.DataColumns.QUANTITY] === '') &&
        (sheetTransactions[i][SheetConfig.DataColumns.DIVIDEND] === '') &&
        (sheetTransactions[i][SheetConfig.DataColumns.USD_RATE] === '')) {
      // Remove empty rows
      sheetTransactions.splice(i, 1);
    }
    else {
      // Set currency based on account description
      var account = sheetTransactions[i][SheetConfig.DataColumns.ACCOUNT].toString();

      // Account currency column must end with ' USD' or ' US'. Otherwise, it's assumed to be CAD
      if ((account !== null) &&
          ((account.substring(account.length - 4, account.length) === ' USD') ||
           (account.substring(account.length - 3, account.length) === ' US'))) {
             sheetTransactions[i][SheetConfig.DataColumns.ACCOUNT] = 'USD';
      }
      else {
        sheetTransactions[i][SheetConfig.DataColumns.ACCOUNT] = 'CAD';
      }
    }
  }

  sheetTransactions = ArrayLib.sort(sheetTransactions, SheetConfig.DataColumns.TRADE_DATE, true);
  return sheetTransactions;
};

/**
 * Main app function
 */
function main() {
  var investmentSheetReport = new InvestmentSheetReport();

  var sheetTransactions = loadAllTransactionsFromActiveSheet();
  for (var k = 0; k < sheetTransactions.length; k++)
    addTransaction(investmentSheetReport, sheetTransactions[k]);

  writeReportToActiveSheet(investmentSheetReport);
}

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