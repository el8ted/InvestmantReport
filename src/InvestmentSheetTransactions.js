/**
 * Created by Tom on 2017-05-01.
 * Class to interact with getting data from active sheet and put report in the same active sheet
 */
"use strict";


var SheetConfig = {
  DataRange: 'A:H',
  DateColumns: {'TRADE_DATE': 0, 'ACCOUNT': 1, 'SECURITY_ID': 2, 'AMOUNT': 3, 'QUANTITY': 4, 'DIVIDEND': 5, 'USD_RATE': 6 }
};


/**
 * @param transaction
 */
var addTransaction = function (investmentSheetReport, transaction) {
  if ((transaction[SheetConfig.DateColumns.AMOUNT] !== '') &&
      (transaction[SheetConfig.DateColumns.QUANTITY] === '') &&
      (transaction[SheetConfig.DateColumns.DIVIDEND]) === '') {

    if (transaction[SheetConfig.DateColumns.AMOUNT] >= 0)
      investmentSheetReport.addTransaction(new InterestTransaction(transaction[SheetConfig.DateColumns.ACCOUNT],
                                                     transaction[SheetConfig.DateColumns.SECURITY_ID],
                                                     transaction[SheetConfig.DateColumns.TRADE_DATE],
                                                     transaction[SheetConfig.DateColumns.AMOUNT],
                                                    transaction[SheetConfig.DateColumns.USD_RATE]));
    else 
      investmentSheetReport.addTransaction(new CarryChargeTransaction(transaction[SheetConfig.DateColumns.ACCOUNT],
                                                        transaction[SheetConfig.DateColumns.SECURITY_ID],
                                                        transaction[SheetConfig.DateColumns.TRADE_DATE],
                                                        transaction[SheetConfig.DateColumns.AMOUNT],
                                                        transaction[SheetConfig.DateColumns.USD_RATE]));
    return;
  }

  if (transaction[SheetConfig.DateColumns.DIVIDEND] !== '')
    investmentSheetReport.addTransaction(new DividendTransaction(transaction[SheetConfig.DateColumns.ACCOUNT],
                                                   transaction[SheetConfig.DateColumns.SECURITY_ID],
                                                   transaction[SheetConfig.DateColumns.TRADE_DATE],
                                                   transaction[SheetConfig.DateColumns.DIVIDEND],
                                                   transaction[SheetConfig.DateColumns.USD_RATE],
                                                   transaction[SheetConfig.DateColumns.QUANTITY]));

  if (transaction[SheetConfig.DateColumns.QUANTITY] !== '') {
    if ((transaction[SheetConfig.DateColumns.SECURITY_ID].slice(5) === 'CALL-') ||
        (transaction[SheetConfig.DateColumns.SECURITY_ID].slice(5) === 'PUT-'))
      // TODO: remove hard coding of multiplier
      investmentSheetReport.addTransaction(new OptionOrderTransaction(transaction[SheetConfig.DateColumns.ACCOUNT],
                                                        transaction[SheetConfig.DateColumns.SECURITY_ID],
                                                        transaction[SheetConfig.DateColumns.TRADE_DATE],
                                                        transaction[SheetConfig.DateColumns.AMOUNT],
                                                        transaction[SheetConfig.DateColumns.USD_RATE],
                                                        transaction[SheetConfig.DateColumns.QUANTITY],
                                                        100));
    else
      investmentSheetReport.addTransaction(new OrderTransaction(transaction[SheetConfig.DateColumns.ACCOUNT],
                                                  transaction[SheetConfig.DateColumns.SECURITY_ID],
                                                  transaction[SheetConfig.DateColumns.TRADE_DATE],
                                                  transaction[SheetConfig.DateColumns.AMOUNT],
                                                  transaction[SheetConfig.DateColumns.USD_RATE],
                                                  transaction[SheetConfig.DateColumns.QUANTITY]));
  }
};


/**
 * @return {Array.<T>} returns sorted list of transactions. sorted from oldest to nearest (i.e. jan - dec)
 */
var loadAllTransactionsFromActiveSheet = function () {
  SpreadsheetApp.setActiveSheet(SpreadsheetApp.getActiveSpreadsheet().getSheetByName("2011 New")); //TODO: For debug mode only
  var sheetTransactions = SpreadsheetApp.getActiveSheet().getRange(SheetConfig.DataRange).getValues();

  // Remove header row
  sheetTransactions.splice(0, 1);

  for (var i = sheetTransactions.length - 1; i >= 0; --i) {
    if ((sheetTransactions[i][SheetConfig.DateColumns.TRADE_DATE] === '') &&
        (sheetTransactions[i][SheetConfig.DateColumns.ACCOUNT] === '') &&
        (sheetTransactions[i][SheetConfig.DateColumns.SECURITY_ID] === '') &&
        (sheetTransactions[i][SheetConfig.DateColumns.AMOUNT] === '') &&
        (sheetTransactions[i][SheetConfig.DateColumns.QUANTITY] === '') &&
        (sheetTransactions[i][SheetConfig.DateColumns.DIVIDEND] === '') &&
        (sheetTransactions[i][SheetConfig.DateColumns.USD_RATE] === '')) {
      // Remove empty rows
      sheetTransactions.splice(i, 1);
    }
    else {
      // Set currency based on account description
      var account = sheetTransactions[i][SheetConfig.DateColumns.ACCOUNT].toString();

      // Account currency column must end with ' USD' or ' US'. Otherwise, it's assumed to be CAD
      if ((account !== null) &&
          ((account.substring(account.length - 4, account.length) === ' USD') ||
           (account.substring(account.length - 3, account.length) === ' US')))
        sheetTransactions[i][SheetConfig.DateColumns.ACCOUNT] = 'USD';
      else
        sheetTransactions[i][SheetConfig.DateColumns.ACCOUNT] = 'CAD';
    }
  }

  sheetTransactions = ArrayLib.sort(sheetTransactions, SheetConfig.DateColumns.TRADE_DATE, true);
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

  investmentSheetReport.getReport();
}


// Configuration to run on node with mock data
global.RUN_ON_NODE = true;
if (global.RUN_ON_NODE) {
  var SpreadSheetAppModule = require('./mock_google_service/SpreadsheetApp.js');
  var SpreadsheetApp = new SpreadSheetAppModule.SpreadsheetApp();
  var ArrayLib = new SpreadSheetAppModule.ArrayLib();

  var Security = require('./Security.js').Security;
  var TransactionModule = require('./Transaction.js');
  var BaseTransaction = TransactionModule.BaseTransaction;
  var DividendTransaction = TransactionModule.DividendTransaction;
  var InterestTransaction = TransactionModule.InterestTransaction;
  var CarryChargeTransaction = TransactionModule.CarryChargeTransaction;
  var OrderTransaction = TransactionModule.OrderTransaction;
  var OptionOrderTransaction = TransactionModule.OptionOrderTransaction;
  
  var InvestmentSheetReport = require('./InvestmentSheetReport.js').InvestmentSheetReport;
  
  function node_init() {
    main();
  }
  
  module.exports = node_init;
}