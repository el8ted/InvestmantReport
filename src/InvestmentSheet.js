/**
 * Created by Tom on 2017-05-01.
 * Class to interact with getting data from active sheet and put report in the same active sheet
 */
"use strict";
global.RUN_ON_NODE = true;

if (global.RUN_ON_NODE)
  var InvestmentReport = require('./InvestmentReport.js');

var SheetConfig = {
  DataRange: 'A:H',
  DateColumns: {'TRADE_DATE': 0, 'ACCOUNT': 1, 'SECURITY_ID': 2, 'AMOUNT': 3, 'QUANTITY': 4, 'DIVIDEND': 5, 'USD_RATE': 6 }
};


/**
 * @param transaction
 */
var addTransaction = function (transaction) {
  if ((transaction[sheetTransactionsColumn.AMOUNT] !== '') &&  (transaction[sheetTransactionsColumn.QUANTITY] === '') &&
      (transaction[sheetTransactionsColumn.DIVIDEND]) === '') {

    if (transaction[sheetTransactionsColumn.AMOUNT] >= 0)
      report.addTransaction(new InterestTransaction(transaction[sheetTransactionsColumn.ACCOUNT], transaction[sheetTransactionsColumn.TRADE_DATE],
                                                    transaction[sheetTransactionsColumn.AMOUNT], transaction[sheetTransactionsColumn.USD_RATE]));
    else
      report.addTransaction(new CarryChargeTransaction(transaction[sheetTransactionsColumn.ACCOUNT], transaction[sheetTransactionsColumn.TRADE_DATE],
                                                       transaction[sheetTransactionsColumn.AMOUNT], transaction[sheetTransactionsColumn.USD_RATE]));
    return;
  }

  if (transaction[sheetTransactionsColumn.DIVIDEND] !== '')
    report.addTransaction(new DividendTransaction(transaction[sheetTransactionsColumn.ACCOUNT], transaction[sheetTransactionsColumn.SECURITYID],
                                                  transaction[sheetTransactionsColumn.TRADE_DATE], transaction[sheetTransactionsColumn.AMOUNT],
                                                  transaction[sheetTransactionsColumn.QUANTITY], transaction[sheetTransactionsColumn.USD_RATE]));

  if (transaction[sheetTransactionsColumn.QUANTITY] !== '') {
    if ((transaction[sheetTransactionsColumn.SECURITY_ID].slice(5) === 'CALL-') ||
        (transaction[sheetTransactionsColumn.SECURITY_ID].slice(5) === 'PUT-'))
      // TODO: remove hard coding of multiplier
      report.addTransaction(new OptionOrderTransaction(transaction[sheetTransactionsColumn.ACCOUNT], transaction[sheetTransactionsColumn.SECURITYID],
                                                       transaction[sheetTransactionsColumn.TRADE_DATE], transaction[sheetTransactionsColumn.AMOUNT],
                                                       transaction[sheetTransactionsColumn.ACCOUNT], transaction[sheetTransactionsColumn.QUANTITY],
                                                       transaction[sheetTransactionsColumn.USD_RATE], 100));
    else
      report.addTransaction(new OrderTransaction(transaction[sheetTransactionsColumn.ACCOUNT], transaction[sheetTransactionsColumn.SECURITY_ID],
                                                 transaction[sheetTransactionsColumn.TRADE_DATE], transaction[sheetTransactionsColumn.AMOUNT],
                                                 transaction[sheetTransactionsColumn.QUANTITY], transaction[sheetTransactionsColumn.USD_RATE]));
  }
};


/**
 * @return {Array.<T>} returns sorted list of transactions. sorted from oldest to nearest (i.e. jan - dec)
 */
var loadAllTransactionsFromActiveSheet = function () {
  SpreadsheetApp.setActiveSheet(SpreadsheetApp.getActiveSpreadsheet().getSheetByName("2011 New")); //TODO: For debug mode only
  var sheetTransactions = SpreadsheetApp.getActiveSheet().getRange(TransactionRange).getValues();

  // Remove header row
  sheetTransactions.splice(0, 1);

  for (i = sheetTransactions.length - 1; i >= 0; --i) {
    if ((sheetTransactions[i][sheetTransactionsColumn.TRADE_DATE] === '') && (sheetTransactions[i][sheetTransactionsColumn.ACCOUNT] === '') &&
        (sheetTransactions[i][sheetTransactionsColumn.SECURITY_ID] === '') && (sheetTransactions[i][sheetTransactionsColumn.AMOUNT] === '') &&
        (sheetTransactions[i][sheetTransactionsColumn.QUANTITY] === '') && (sheetTransactions[i][sheetTransactionsColumn.DIVIDEND] === '') &&
        (sheetTransactions[i][sheetTransactionsColumn.USD_RATE] === '')) {
      // Remove empty rows
      sheetTransactions.splice(i, 1);
    }
    else {
      // Set currency based on account description
      var account = sheetTransactions[i][sheetTransactionsColumn.ACCOUNT].toString();

      // Account currency column must end with ' USD' or ' US'. Otherwise, it's assumed to be CAD
      if ((account !== null) &&
          ((account.substring(account.length - 4, account.length) === ' USD') || (account.substring(account.length - 3, account.length) === ' US')))
        sheetTransactions[i][sheetTransactionsColumn.ACCOUNT] = 'USD';
      else
        sheetTransactions[i][sheetTransactionsColumn.ACCOUNT] = 'CAD';
    }
  }

  sheetTransactions = ArrayLib.sort(sheetTransactions, sheetTransactionsColumn.TRADE_DATE, true);
  return sheetTransactions;
};


/**
 * Main app function
 */
function main() {
  var report = new InvestmentReport();
  var sheetTransactions = loadAllTransactionsFromActiveSheet();

  for (var k = 0; k < sheetTransactions.length; k++)
    addTransaction(sheetTransactions[k]);

  report.getSummary();
}