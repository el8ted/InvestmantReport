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

  var InvestmentSheetReport = require('./investment_sheet_report.js').InvestmentSheetReport;
  var Security = require('./security.js').Security;
  var TransactionModule = require('./transaction.js');
  var BaseTransaction = TransactionModule.BaseTransaction;
  var DividendTransaction = TransactionModule.DividendTransaction;
  var InterestTransaction = TransactionModule.InterestTransaction;
  var CarryChargeTransaction = TransactionModule.CarryChargeTransaction;
  var OrderTransaction = TransactionModule.OrderTransaction;
  var OptionOrderTransaction = TransactionModule.OptionOrderTransaction;

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
          var interest = new InterestTransaction(
              transaction[SheetConfig.DataColumns.ACCOUNT],
              transaction[SheetConfig.DataColumns.SECURITY_ID],
              transaction[SheetConfig.DataColumns.TRADE_DATE],
              transaction[SheetConfig.DataColumns.AMOUNT],
              transaction[SheetConfig.DataColumns.USD_RATE]);
          investmentSheetReport.addTransaction(interest);
        }
        else {
          var carryCharge = new CarryChargeTransaction(
              transaction[SheetConfig.DataColumns.ACCOUNT],
              transaction[SheetConfig.DataColumns.SECURITY_ID],
              transaction[SheetConfig.DataColumns.TRADE_DATE],
              transaction[SheetConfig.DataColumns.AMOUNT],
              transaction[SheetConfig.DataColumns.USD_RATE]);
          investmentSheetReport.addTransaction(carryCharge);
          
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
      var optionOrder = new OptionOrderTransaction(
          transaction[SheetConfig.DataColumns.ACCOUNT],
          transaction[SheetConfig.DataColumns.SECURITY_ID],
          transaction[SheetConfig.DataColumns.TRADE_DATE],
          transaction[SheetConfig.DataColumns.AMOUNT],
          transaction[SheetConfig.DataColumns.USD_RATE],
          transaction[SheetConfig.DataColumns.QUANTITY],
          100);
      investmentSheetReport.addTransaction(optionOrder);
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
  var sheetTransactions = SpreadsheetApp.getActiveSheet()
      .getRange(SheetConfig.DataRange)
      .getValues();

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
  for (var k = 0; k < sheetTransactions.length; k++) {
    addTransaction(investmentSheetReport, sheetTransactions[k]);
  }

  investmentSheetReport.writeReportToActiveSheet(investmentSheetReport);
}