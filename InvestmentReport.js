/**
 * Created by Tom on 2017-05-01.
 */
function runReport() {
    //FIXME: create function to appending sheet name
    var sheetName = SpreadsheetApp.getActiveSheet().getName();
    var reportSymbols = SpreadsheetApp.getActiveSheet().getRange("SymbolsWithType" + sheetName).getValues();
    var gainLossReport;

    for (i = 0; i < reportSymbols.length; i++) {
        var symbol = reportSymbols[i][0], type = reportSymbols[i][1], gainLoss = reportSymbols[i][3], totalQuantityCarryover = reportSymbols[i][4], bookValueCarryover = reportSymbols[i][5];

        if (type == "Security" || type == "US Security") {
            gainLossReport = getGainLoss(symbol);
            gainLoss = gainLossReport[0];
            totalQuantityCarryover = gainLossReport[1];
            bookValueCarryover = gainLossReport[2];
        }

        reportSymbols[i][3] = gainLoss;
        reportSymbols[i][4] = totalQuantityCarryover;
        reportSymbols[i][5] = -bookValueCarryover;
    }

    //FIXME: create function for this
    reportSymbols = ArrayLib.transpose(reportSymbols);
    reportSymbols = reportSymbols.slice(3, 6);
    reportSymbols = ArrayLib.transpose(reportSymbols);

    SpreadsheetApp.getActiveSheet().getRange("SymbolsWithType" + sheetName).offset(0, 3, reportSymbols.length, 3).setValues(reportSymbols);
}


// Returns the capital gain or loss for the symbol
// Uses Transction defined name for table reference
function getGainLoss(symbol) {
    var transactionList = getBuySellTransactions(symbol);
    var totalQuantity = 0, totalBookValue = 0, avgCostPerQuantity = 0, totalGainLoss = 0;
    var nextDate, date, amount = 0, quantity = 0, gainLoss = 0, fxRate = 0;

    if (symbol == "CALL-100MSFT'11MY@26")
        ;

    for (j = 0; j < transactionList.length; j++) {
        if (j+1 < transactionList.length)
            nextDate = transactionList[j+1][0];
        else
            nextDate = null;

        date = transactionList[j][0];
        amount = Number(transactionList[j][3]);
        quantity = Number(transactionList[j][4]);
        fxRate = Number(transactionList[j][6]);

        // Convert USD values to CAD
        if (fxRate != "")
            amount = amount * fxRate;

        // Catch rounding errors
        totalQuantity = totalQuantity + quantity;
        if (Math.abs(totalQuantity) < 0.001)
            totalQuantity = 0;

        // Record gain/loss for closing transactions (sell, or buy to cover)
        if ((quantity < 0 && totalQuantity >= 0)  || (quantity > 0 && totalQuantity <= 0)) {
            gainLoss = (quantity * avgCostPerQuantity) + amount;

            if (totalQuantity == 0 || nextDate == null || gainLoss >= 0 || (gainLoss < 0 && isBoughtBackWithin30Days(transactionList, j) == false)) {
                transactionList[j][6] = gainLoss;
                totalGainLoss = totalGainLoss + gainLoss;
            }
        }

        totalBookValue = getUpdatedTotalBookValue(transactionList, totalQuantity, totalBookValue, avgCostPerQuantity, date, quantity, amount, nextDate, gainLoss, j);
        if (totalQuantity != 0)
            avgCostPerQuantity = totalBookValue / totalQuantity;
        else
            avgCostPerQuantity = 0;
    }

    return [totalGainLoss, totalQuantity, totalBookValue];
}


// Return only buy and sell transactions, sorted by date
function getBuySellTransactions(symbol) {
    var sheetName = SpreadsheetApp.getActiveSheet().getName();
    var transactionList = SpreadsheetApp.getActiveSheet().getRange("Transactions" + sheetName).getValues();

    var k = 0;
    while (k < transactionList.length) {
        if (transactionList[k][2] != symbol || transactionList[k][4] == "")
            transactionList.splice(k, 1);
        else
            k++;
    }

    transactionList = ArrayLib.sort(transactionList, 0, true);

    return transactionList;
}


// Returns the new total book value after processing a transaction
function getUpdatedTotalBookValue (transactionList, totalQuantity, totalBookValue, avgCostPerQuantity, date, quantity, amount, nextDate, gainLoss, n) {

    // Expiring contract
    if (quantity != 0 && totalQuantity == 0)
        totalBookValue = 0;
    else if (quantity > 0 && totalQuantity >= 0)
        totalBookValue = totalBookValue - amount;
    // Cover transaction
    else if (quantity < 0 && totalQuantity < 0)
        totalBookValue = totalBookValue - amount;
    // Sell action
    else {
        // Calculation is based on superfical loss rule
        totalBookValue = totalBookValue + (quantity * avgCostPerQuantity);

        if (totalQuantity !=0 && isBoughtBackWithin30Days(transactionList, n) && gainLoss < 0)
            totalBookValue = totalBookValue - gainLoss;
    }

    return totalBookValue;
}


// Performs gain/loss calculation
function calculateGainLoss (totalQuantity, totalBookValue, avgCostPerQuantity, date, quantity, amount) {
    if (quantity < 0) {
        gainLoss = (quantity * avgCostPerQuantity) + amount;
        transactionList[j][6] = gainLoss;
        totalGainLoss = totalGainLoss + gainLoss;
    }

    avgCostPerQuantity = totalBookValue / totalQuantity;
}


// return true if bought back within 30 calendar days
// FIXME: check for short covers and buy backs in a future year
function isBoughtBackWithin30Days (transactionList, fromIndex) {
    var fromDate = new Date (transactionList[fromIndex][0]);
    var toDate = null, quantity = 0;
    var one_day = 1000*60*60*24; // seconds in an hour

    for (m = fromIndex+1; m < transactionList.length; m++) {
        toDate = new Date (transactionList[m][0]);
        quantity = transactionList[m][4];

        //FIXME: check if quantity > than previous sold amount
        if (toDate == null)
            return false;
        else if (quantity > 0 && (toDate.getTime() - fromDate.getTime())/one_day <= 30)
            return true;
        else if (quantity > 0)
            return false;
    }

    return false;
}