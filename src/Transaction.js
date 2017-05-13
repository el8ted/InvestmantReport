/**
 * Created by Tom on 2017-05-01.
 */
"use strict";

/**
 * Security object
 */
function Security(accountCurrency, securityID) {
  this.accountCurrency = accountCurrency;
  this.securityID = securityID;
}

Security.prototype.getAccountCurrency = function() { return this.accountCurrency; };
Security.prototype.getSecurityID = function() { return this.securityID; };
Security.prototype.getUID = function() { return this.accountCurrency + "_" + this.securityID; };

/**
 * Base transection object
 */
//var BaseTransaction = (function() {
function BaseTransaction(accountCurrency, securityID, tradeDate, amount, usdRate) {
  this.security = new Security(accountCurrency, securityID);
  this.tradeDate = tradeDate;
  this.amount = amount;
  this.usdRate = (typeof usdRate !== 'undefined') ?  usdRate : null;
}

BaseTransaction.prototype.getTransactionType = function() { return 'TRANSACTION'; };
BaseTransaction.prototype.getSecurity = function() { return this.security; };
BaseTransaction.prototype.getTradeDate = function() { return this.tradeDate; };
BaseTransaction.prototype.getAmount = function() { return this.amount; };
BaseTransaction.prototype.getUSDRate = function() { return this.usdRate; };
//})();


//var DividendTransaction = (function() {
/**
 * @param amountWithheld - optional
 * @param quantity - optional
 * @param usdRate - optional
 */
function DividendTransaction(accountCurrency, symbol, tradeDate, amount, quantity, usdRate) {
  if (typeof amount !== 'undefined') {
    if (amount >= 0) {
      amount = 0;
      this.amountWithheld = null;
    } else {
      this.amountWithheld = amount;
      amount = null;
    }
  }

  BaseTransaction.call(this, accountCurrency, symbol, tradeDate, amount, usdRate);
  this.quantity = (typeof quantity !== 'undefined') ?  quantity : null;
}

DividendTransaction.prototype = Object.create(BaseTransaction.prototype);
DividendTransaction.prototype.constructor = DividendTransaction;
DividendTransaction.prototype.getTransactionType = function() { return 'DIVIDEND'; };
DividendTransaction.prototype.getAmountWithheld = function() { return this.amountWithheld; };
DividendTransaction.prototype.getQuantity = function() { return this.quantity; };
//})();


//var InterestTransaction = (function() {
/**
 * @param usdRate - optional
 */
function InterestTransaction(accountCurrency, tradeDate, amount, usdRate) {
  BaseTransaction.call(this, accountCurrency, tradeDate, amount, usdRate);
}

InterestTransaction.prototype = Object.create(BaseTransaction.prototype);
InterestTransaction.prototype.constructor = InterestTransaction;
InterestTransaction.prototype.getTransactionType = function() { return 'INTEREST'; };
//})();


//var CarryChargeTransaction = (function() {
/**
 * @param usdRate - optional
 */
function CarryChargeTransaction(accountCurrency, tradeDate, amount, usdRate) {
  BaseTransaction.call(this, accountCurrency, tradeDate, amount, usdRate);
}

CarryChargeTransaction.prototype = Object.create(BaseTransaction.prototype);
CarryChargeTransaction.prototype.constructor = CarryChargeTransaction;
CarryChargeTransaction.prototype.getTransactionType = function() { return 'CARRY_CHARGE'; };
//})();


//var OrderTransaction = (function() {
/**
 * TODO: add support for commission, exchange traded debentures
 * @param amount - optional. net amount of order (after commission)
 * @param usdRate - optional
 */
function OrderTransaction(accountCurrency, symbol, tradeDate, amount, quantity, usdRate) {
  BaseTransaction.call(this, accountCurrency, symbol, tradeDate, amount, usdRate);
  this.quantity = (typeof quantity !== 'undefined') ?  quantity : null;
}

OrderTransaction.prototype = Object.create(BaseTransaction.prototype);
OrderTransaction.prototype.constructor = OrderTransaction;
OrderTransaction.prototype.getTransactionType = function() { return 'ORDER'; };
OrderTransaction.prototype.getQuantity = function() { return this.quantity; };
//})();


//var OptionOrderTransaction = (function() {
/**
 * TODO: add commission support
 * @param amount - optional. net amount of order (after commission)
 * @param usdRate - optional
 */
function OptionOrderTransaction(accountCurrency, symbol, tradeDate, amount, quantity, usdRate, multiplier) {
  OrderTransaction.call(this, accountCurrency, symbol, tradeDate, amount, quantity, usdRate);
  this.multiplier = (typeof multiplier !== 'undefined') ? multiplier : null;
}

OptionOrderTransaction.prototype = Object.create(OrderTransaction.prototype);
OptionOrderTransaction.prototype.constructor = OptionOrderTransaction;
OptionOrderTransaction.prototype.getTransactionType = function() { return 'OPTION_ORDER'; };
OptionOrderTransaction.prototype.getMultiplier = function() { return this.multiplier; };
//})();