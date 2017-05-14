/**
 * Created by Tom on 2017-05-01.
 * Class to interact with getting data from active sheet and put report in the same active sheet
 */
"use strict";
const InvestmentReport = require('./InvestmentReport.js');


var TransactionRange = "A:H";
var TransactionListColumn = {
  'TRADE_DATE': 0, 'ACCOUNT_CURRENCY': 1, 'SECURITY_ID': 2, 'AMOUNT': 3, 'QUANTITY': 4, 'DIVIDEND': 5, 'USD_RATE': 6
};

var report = new InvestmentReport();
var transactionList = null;


/**
 *
 */
function runReport() {
  report = new InvestmentReport();
  transactionList = loadAllTransactionsFromActiveSheet();

  var k = 0;
  while (k < transactionList.length) {
    addTransaction(transactionList[k]);
    k++;
  }

  report.getSummary();
}


/**
 * @return {Array.<T>} returns sorted list of transactions. sorted from oldest to nearest (i.e. jan - dec)
 */
var loadAllTransactionsFromActiveSheet = function () {
  SpreadsheetApp.setActiveSheet(SpreadsheetApp.getActiveSpreadsheet().getSheetByName("2011 New")); // For debug mode only
  transactionList = SpreadsheetApp.getActiveSheet().getRange(TransactionRange).getValues();

  // Remove header
  transactionList.splice(0, 1);

  // Remove empty rows
  for (i = transactionList.length - 1; i >= 0; --i) {
    if ((transactionList[i][TransactionListColumn.TRADE_DATE] === "") && (transactionList[i][TransactionListColumn.ACCOUNT_CURRENCY] === "") &&
      (transactionList[i][TransactionListColumn.SECURITY_ID] === "") && (transactionList[i][TransactionListColumn.AMOUNT] === "") &&
      (transactionList[i][TransactionListColumn.QUANTITY] === "") && (transactionList[i][TransactionListColumn.DIVIDEND] === "") &&
      (transactionList[i][TransactionListColumn.USD_RATE] === ""))
      transactionList.splice(i, 1);
    else {
      // Set currency based on account description
      var account = transactionList[i][TransactionListColumn.ACCOUNT_CURRENCY].toString();

      if ((account !== null) && (account.substring(account.length - 3, account.length) === 'USD'))
        transactionList[i][TransactionListColumn.ACCOUNT_CURRENCY] = "USD";
      else
        transactionList[i][TransactionListColumn.ACCOUNT_CURRENCY] = "CAD";
    }
  }

  transactionList = ArrayLib.sort(transactionList, TransactionListColumn.TRADE_DATE, true);
  return transactionList;
};


/**
 * @param transaction
 */
var addTransaction = function (transaction) {
  if ((transaction[TransactionListColumn.AMOUNT] !== "") &&
    (transaction[TransactionListColumn.QUANTITY] === "") &&
    (transaction[TransactionListColumn.DIVIDEND]) === "") {

    if (transaction[TransactionListColumn.AMOUNT] >= 0)
      report.addTransaction(new InterestTransaction(transaction[TransactionListColumn.ACCOUNT_CURRENCY],
        transaction[TransactionListColumn.TRADE_DATE],
        transaction[TransactionListColumn.AMOUNT],
        transaction[TransactionListColumn.USD_RATE]));
    else
      report.addTransaction(new CarryChargeTransaction(transaction[TransactionListColumn.ACCOUNT_CURRENCY],
        transaction[TransactionListColumn.TRADE_DATE],
        transaction[TransactionListColumn.AMOUNT],
        transaction[TransactionListColumn.USD_RATE]));
    return;
  }

  if (transaction[TransactionListColumn.DIVIDEND] !== "")
    report.addTransaction(new DividendTransaction(transaction[TransactionListColumn.ACCOUNT_CURRENCY],
      transaction[TransactionListColumn.SECURITYID],
      transaction[TransactionListColumn.TRADE_DATE],
      transaction[TransactionListColumn.AMOUNT],
      transaction[TransactionListColumn.QUANTITY],
      transaction[TransactionListColumn.USD_RATE]));

  if (transaction[TransactionListColumn.QUANTITY] !== "") {
    if ((transaction[TransactionListColumn.SECURITY_ID].slice(5) === 'CALL-') ||
      (transaction[TransactionListColumn.SECURITY_ID].slice(5) === 'PUT-'))
    // TODO: remove hard coding of multiplier
      report.addTransaction(new OptionOrderTransaction(transaction[TransactionListColumn.ACCOUNT_CURRENCY],
        transaction[TransactionListColumn.SECURITYID],
        transaction[TransactionListColumn.TRADE_DATE],
        transaction[TransactionListColumn.AMOUNT],
        transaction[TransactionListColumn.ACCOUNT_CURRENCY],
        transaction[TransactionListColumn.QUANTITY],
        transaction[TransactionListColumn.USD_RATE],
        100));
    else
      report.addTransaction(new OrderTransaction(transaction[TransactionListColumn.ACCOUNT_CURRENCY],
        transaction[TransactionListColumn.SECURITY_ID],
        transaction[TransactionListColumn.TRADE_DATE],
        transaction[TransactionListColumn.AMOUNT],
        transaction[TransactionListColumn.QUANTITY],
        transaction[TransactionListColumn.USD_RATE]));
  }
};