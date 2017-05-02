/**
 * Created by Tom on 2017-05-01.
 */

var TransactionRange = "A:H";
var TransactionListColumn = {'TRADE_DATE': 0, 'ACCOUNT': 1, 'SECURITY_ID': 2, 'AMOUNT': 3,
                             'QUANTITY': 4, 'DIVIDEND': 5, 'USD_RATE': 6};



var report = new InvestmentReport();

/**
 *
 */
var runReport = function() {
    var report = new InvestmentReport();
    processAllTransactionsOnSheet();

    var k = 0;
    while (k < transactionList.length) {
        addTransactionFromSheet(transactionList[k]);
        k++;
    }
};


/**
 * @return {Array.<T>} returns sorted list of transactions. sorted from oldest to nearest (i.e. jan - dec)
 */
var loadAllTransactionsOnSheet = function() {
    var transactionList = SpreadsheetApp.getActiveSheet().getRange(TransactionRange).getValues();

    return ArrayLib.sort(transactionList, TransactionListColumn.TRADE_DATE, true);
};

/**
 * @param transaction
 */
var addTransactionFromSheet = function(transaction) {
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