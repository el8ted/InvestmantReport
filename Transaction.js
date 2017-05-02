/**
 *
 */
function Transaction(accountCurr, securityID, tradeDate, amount, usdRate) {
    this.accountCurr = accountCurr;
    this.securityID = securityID;
    this.tradeDate = tradeDate;
    this.amount = amount;
    this.usdRate = (typeof usdRate !== 'undefined') ?  usdRate : null;
}
Transaction.prototype.getAccountCurr = function() { return this.accountCurr; };
Transaction.prototype.getSecurityID = function() { return this.securityID; };
Transaction.prototype.getTradeDate = function() { return this.tradeDate; };
Transaction.prototype.getAmount = function() { return this.amount; };
Transaction.prototype.getUSDRate = function() { return this.usdRate; };



/**
 * @param amountWithheld - optional
 * @param quantity - optional
 * @param usdRate - optional
 */
function Dividend(accountCurr, symbol, tradeDate, amount, amountWithheld, quantity, usdRate) {
    var transaction = new Transaction (accountCurr, symbol, tradeDate, amount, usdRate);
    this.amountWithheld = (typeof amountWithheld !== 'undefined') ?  amountWithheld : null;
    this.quantity = (typeof quantity !== 'undefined') ?  quantity : null;
}
Transaction.prototype.getAmountWithheld = function() { return this.amountWithheld; };
Transaction.prototype.getQuantity = function() { return this.quantity; };



/**
 * @param usdRate - optional
 */
function Interest(accountCurr, source, tradeDate, amount, usdRate) {
    var transaction = new Transaction (accountCurr, source, tradeDate, amount, usdRate);
}



/**
 * @param usdRate - optional
 */
function CarryCharge(accountCurr, source, tradeDate, amount, usdRate) {
    var transaction = new Transaction (accountCurr, source, tradeDate, amount, usdRate);
}

/**
 * TODO: add support for commission, exchange traded debentures
 * @param amount - optional. net amount of order (after commission)
 * @param usdRate - optional
 */
function Order(accountCurr, symbol, tradeDate, amount, quantity, usdRate) {
    var transaction = new Transaction (accountCurr, symbol, tradeDate, amount, usdRate);
    this.quantity = (typeof quantity !== 'undefined') ?  quantity : null;
    this.rgl = null;
}
Transaction.prototype.getQuantity = function() { return this.quantity; };
Transaction.prototype.getRGL = function() { return this.rgl; };



/**
 * TODO: add commission support
 * @param amount - optional. net amount of order (after commission)
 * @param usdRate - optional
 */
function OptionOrder(accountCurr, symbol, tradeDate, amount, quantity, usdRate, multiplier) {
    var transaction = new Transaction (accountCurr, symbol, tradeDate, amount, usdRate);
    this.quantity = (typeof quantity !== 'undefined') ?  quantity : null;
    this.multiplier = (typeof multiplier !== 'undefined') ? multiplier : null;
    this.rgl = null;
}
Transaction.prototype.getQuantity = function() { return this.quantity; };
Transaction.prototype.getRGL = function() { return this.rgl; };
Transaction.prototype.getMultiplier = function() { return this.multiplier; };

/**
 *
 */
Transaction.prototype.getUnderlyingSymbol = function() {
};