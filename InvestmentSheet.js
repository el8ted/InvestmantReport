/**
 * Created by Tom on 2017-05-01.
 */

var TransactionRange = "A:H";
var TransactionListColumn = {'TRADE_DATE': 0, 'ACCOUNT': 1, 'SECURITY_ID': 2, 'AMOUNT': 3,
                             'QUANTITY': 4, 'DIVIDEND': 5, 'USD_RATE': 6};



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
}


/**
 * @return {Array.<T>} returns sorted list of transactions. sorted from oldest to nearest (i.e. jan - dec)
 */
var loadAllTransactionsFromActiveSheet = function() {
  SpreadsheetApp.setActiveSheet( SpreadsheetApp.getActiveSpreadsheet().getSheetByName("2011 New")); // For debug mode only
  transactionList = SpreadsheetApp.getActiveSheet().getRange(TransactionRange).getValues();

  // Remove header and empty rows
  transactionList.splice(0, 1);

  for (i = transactionList.length - 1; i >= 0; --i) {
    if ((transactionList[i][0] === "") && (transactionList[i][1] === "") && (transactionList[i][2] === "") && (transactionList[i][3] === "") &&
        (transactionList[i][4] === "") && (transactionList[i][5] === "") && (transactionList[i][6] === ""))
      transactionList.splice(i, 1);
  }

  transactionList = ArrayLib.sort(transactionList, TransactionListColumn.TRADE_DATE, true);
  return transactionList;
};


/**
 * @param transaction
 */
var addTransaction = function(transaction) {
  if ((transaction[TransactionListColumn.AMOUNT !== null]) &&
    (transaction[TransactionListColumn.QUANTITY === null]) &&
    (transaction[TransactionListColumn.DIVIDEND !== null])) {

    if (transaction[TransactionListColumn.AMOUNT] >= 0)
      report.addTransaction(new InterestTransaction(transaction));
    else
      report.addTransaction(new CarryChargeTransaction(transaction));
    return;
  }

  if (transaction[TransactionListColumn.DIVIDEND] !== null)
    report.addTransaction(new DividendTransaction(transaction));

  if (transaction[TransactionListColumn.QUANTITY] !== null) {
    if ((transaction[TransactionListColumn.SECURITY_ID].slice(5) === 'CALL-') ||
      (transaction[TransactionListColumn.SECURITY_ID].slice(5) === 'PUT-'))
      report.addTransaction(new OptionOrderTransaction(transaction));
    else
      report.addTransaction(new OrderTransaction(transaction));
  }
};