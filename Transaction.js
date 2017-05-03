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
Transaction.prototype.getTransactionType = function() { return 'TRANSACTION'; };
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
function DividendTransaction(accountCurr, symbol, tradeDate, amount, amountWithheld, quantity, usdRate) {
  this.transaction = new Transaction (accountCurr, symbol, tradeDate, amount, usdRate);
  this.amountWithheld = (typeof amountWithheld !== 'undefined') ?  amountWithheld : null;
  this.quantity = (typeof quantity !== 'undefined') ?  quantity : null;
}
Transaction.prototype.getTransactionType = function() { return 'DIVIDEND'; };
DividendTransaction.prototype.getAmountWithheld = function() { return this.amountWithheld; };
DividendTransaction.prototype.getQuantity = function() { return this.quantity; };



/**
 * @param usdRate - optional
 */
function InterestTransaction(accountCurr, source, tradeDate, amount, usdRate) {
  this.transaction = new Transaction (accountCurr, source, tradeDate, amount, usdRate);
}
Transaction.prototype.getTransactionType = function() { return 'INTEREST'; };



/**
 * @param usdRate - optional
 */
function CarryChargeTransaction(accountCurr, source, tradeDate, amount, usdRate) {
  this.transaction = new Transaction (accountCurr, source, tradeDate, amount, usdRate);
}
Transaction.prototype.getTransactionType = function() { return 'CARRY_CHARGE'; };

/**
 * TODO: add support for commission, exchange traded debentures
 * @param amount - optional. net amount of order (after commission)
 * @param usdRate - optional
 */
function OrderTransaction(accountCurr, symbol, tradeDate, amount, quantity, usdRate) {
  this.transaction = new Transaction (accountCurr, symbol, tradeDate, amount, usdRate);
  this.quantity = (typeof quantity !== 'undefined') ?  quantity : null;
  this.rgl = null;
}
Transaction.prototype.getTransactionType = function() { return 'ORDER'; };
OrderTransaction.prototype.getQuantity = function() { return this.quantity; };
OrderTransaction.prototype.getRGL = function() { return this.rgl; };



/**
 * TODO: add commission support
 * @param amount - optional. net amount of order (after commission)
 * @param usdRate - optional
 */
function OptionOrderTransaction(accountCurr, symbol, tradeDate, amount, quantity, usdRate, multiplier) {
  this.optionOrder = new Order (accountCurr, symbol, tradeDate, amount, usdRate);
  this.multiplier = (typeof multiplier !== 'undefined') ? multiplier : null;
}
Transaction.prototype.getTransactionType = function() { return 'OPTION_ORDER'; };
OptionOrderTransaction.prototype.getQuantity = function() { return this.quantity; };
OptionOrderTransaction.prototype.getRGL = function() { return this.rgl; };
OptionOrderTransaction.prototype.getMultiplier = function() { return this.multiplier; };

/**
 *
 */
OptionOrderTransaction.prototype.getUnderlyingSymbol = function() {
};