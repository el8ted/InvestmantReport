/**
 * Created by Tom on 2017-05-01.
 */
"use strict";


global.RUN_ON_NODE = true;
if (global.RUN_ON_NODE) {
  module.exports.Security = Security;
  module.exports.BaseTransaction = BaseTransaction;
  module.exports.DividendTransaction = DividendTransaction;
  module.exports.InterestTransaction = InterestTransaction;
  module.exports.CarryChargeTransaction = CarryChargeTransaction;
  module.exports.OrderTransaction = OrderTransaction;
  module.exports.OptionOrderTransaction = OptionOrderTransaction;
}

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


/**
 * @param amountWithheld - optional
 * @param quantity - optional
 * @param usdRate - optional
 */
function DividendTransaction(accountCurrency, securityID, tradeDate, amount, usdRate, quantity) {
  if (typeof amount !== 'undefined') {
    if (amount >= 0) {
      amount = amount;
      this.amountWithheld = null;
    } else {
      this.amountWithheld = amount;
      amount = null;
    }
  }

  BaseTransaction.call(this, accountCurrency, securityID, tradeDate, amount, usdRate);
  this.quantity = (typeof quantity !== 'undefined') ?  quantity : null;
}

DividendTransaction.prototype = Object.create(BaseTransaction.prototype);
DividendTransaction.prototype.constructor = DividendTransaction;
DividendTransaction.prototype.getTransactionType = function() { return 'DIVIDEND'; };
DividendTransaction.prototype.getAmountWithheld = function() { return this.amountWithheld; };
DividendTransaction.prototype.getQuantity = function() { return this.quantity; };


/**
 * @param usdRate - optional
 */
function InterestTransaction(accountCurrency, securityID, tradeDate, amount, usdRate) {
  BaseTransaction.call(this, accountCurrency, securityID, tradeDate, amount, usdRate);
}

InterestTransaction.prototype = Object.create(BaseTransaction.prototype);
InterestTransaction.prototype.constructor = InterestTransaction;
InterestTransaction.prototype.getTransactionType = function() { return 'INTEREST'; };


/**
 * @param usdRate - optional
 */
function CarryChargeTransaction(accountCurrency, securityID, tradeDate, amount, usdRate) {
  BaseTransaction.call(this, accountCurrency, securityID, tradeDate, amount, usdRate);
}

CarryChargeTransaction.prototype = Object.create(BaseTransaction.prototype);
CarryChargeTransaction.prototype.constructor = CarryChargeTransaction;
CarryChargeTransaction.prototype.getTransactionType = function() { return 'CARRY_CHARGE'; };


/**
 * TODO: add support for commission, exchange traded debentures
 * @param amount - optional. net amount of order (after commission)
 * @param usdRate - optional
 */
function OrderTransaction(accountCurrency, securityID, tradeDate, amount, usdRate, quantity) {
  BaseTransaction.call(this, accountCurrency, securityID, tradeDate, amount, usdRate);
  this.quantity = (typeof quantity !== 'undefined') ?  quantity : null;
}

OrderTransaction.prototype = Object.create(BaseTransaction.prototype);
OrderTransaction.prototype.constructor = OrderTransaction;
OrderTransaction.prototype.getTransactionType = function() { return 'ORDER'; };
OrderTransaction.prototype.getQuantity = function() { return this.quantity; };


/**
 * TODO: add commission support
 * @param amount - optional. net amount of order (after commission)
 * @param usdRate - optional
 */
function OptionOrderTransaction(accountCurrency, securityID, tradeDate, amount, usdRate, quantity, multiplier) {
  OrderTransaction.call(this, accountCurrency, securityID, tradeDate, amount, usdRate, quantity);
  this.multiplier = (typeof multiplier !== 'undefined') ? multiplier : null;
}

OptionOrderTransaction.prototype = Object.create(OrderTransaction.prototype);
OptionOrderTransaction.prototype.constructor = OptionOrderTransaction;
OptionOrderTransaction.prototype.getTransactionType = function() { return 'OPTION_ORDER'; };
OptionOrderTransaction.prototype.getMultiplier = function() { return this.multiplier; };