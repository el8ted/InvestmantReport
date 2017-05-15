/**
 * Created by Tom on 2017-05-01.
 */
"use strict";

/**
 * @param {string} accountCurrency, 
 * @param {string} securityID
 */
function Security(accountCurrency, securityID) {
  this.accountCurrency = accountCurrency;
  this.securityID = securityID;
}

Security.prototype.getAccountCurrency = function() { return this.accountCurrency; };
Security.prototype.getSecurityID = function() { return this.securityID; };

/**
 * @returns {string} unique representation of security
 */
Security.prototype.getUID = function() {
  return this.accountCurrency + "_" + this.securityID;
};


/**
 * Base transection object
 * @param  {string} accountCurrency
 * @param  {string} securityID
 * @param  {string} tradeDate
 * @param  {number} amount
 * @param  {number} usdRate
 */
function BaseTransaction(accountCurrency, securityID, tradeDate, amount, usdRate) {
  this.security = new Security(accountCurrency, securityID);
  this.tradeDate = tradeDate;
  this.amount = amount;
  this.usdRate = (typeof usdRate !== 'undefined') ?  usdRate : null;
}

BaseTransaction.prototype.getInvestmentType = function() { return 'TRANSACTION'; };
BaseTransaction.prototype.getSecurity = function() { return this.security; };
BaseTransaction.prototype.getTradeDate = function() { return this.tradeDate; };
BaseTransaction.prototype.getAmount = function() { return this.amount; };
BaseTransaction.prototype.getUSDRate = function() { return this.usdRate; };


/**
 * Extends Base Transaction
 * @param  {string} accountCurrency
 * @param  {string} securityID
 * @param  {string} tradeDate
 * @param  {number} amount can be positive or negative. negative indicates dividend tax withheld 
 * @param  {number} usdRate
 * @param  {number} quantity
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
DividendTransaction.prototype.getInvestmentType = function() { return 'DIVIDEND'; };
DividendTransaction.prototype.getAmountWithheld = function() { return this.amountWithheld; };
DividendTransaction.prototype.getQuantity = function() { return this.quantity; };


/**
 * Extends Base Transaction
 * @param  {string} accountCurrency
 * @param  {string} securityID
 * @param  {} tradeDate
 * @param  {} amount
 * @param  {} usdRate optional
 */
function InterestTransaction(accountCurrency, securityID, tradeDate, amount, usdRate) {
  BaseTransaction.call(this, accountCurrency, securityID, tradeDate, amount, usdRate);
}

InterestTransaction.prototype = Object.create(BaseTransaction.prototype);
InterestTransaction.prototype.constructor = InterestTransaction;
InterestTransaction.prototype.getInvestmentType = function() { return 'INTEREST'; };


/**
 * Extends Base Transaction
 * @param  {string} accountCurrency
 * @param  {string} securityID
 * @param  {string} tradeDate
 * @param  {number} amount
 * @param  {number} usdRate optional
 */
function CarryChargeTransaction(accountCurrency, securityID, tradeDate, amount, usdRate) {
  BaseTransaction.call(this, accountCurrency, securityID, tradeDate, amount, usdRate);
}

CarryChargeTransaction.prototype = Object.create(BaseTransaction.prototype);
CarryChargeTransaction.prototype.constructor = CarryChargeTransaction;
CarryChargeTransaction.prototype.getInvestmentType = function() { return 'CARRY_CHARGE'; };


/**
 * Extends Base Transaction
 * TODO: add support for commission, exchange traded debentures
 * @param  {string} accountCurrency
 * @param  {string} securityID
 * @param  {string} tradeDate
 * @param  {number} amount net amount of order (after commission)
 * @param  {number} usdRate optional
 * @param  {number} quantity optional
 */
function OrderTransaction(accountCurrency, securityID, tradeDate, amount, usdRate, quantity) {
  BaseTransaction.call(this, accountCurrency, securityID, tradeDate, amount, usdRate);
  this.quantity = (typeof quantity !== 'undefined') ?  quantity : null;
}

OrderTransaction.prototype = Object.create(BaseTransaction.prototype);
OrderTransaction.prototype.constructor = OrderTransaction;
OrderTransaction.prototype.getInvestmentType = function() { return 'ORDER'; };
OrderTransaction.prototype.getQuantity = function() { return this.quantity; };


/**
 * Extends Order Transaction
 * TODO: add support for commission
 * @param  {string} accountCurrency
 * @param  {string} securityID
 * @param  {string} tradeDate
 * @param  {number} amount net amount of order (after commission)
 * @param  {number} usdRate optional
 * @param  {number} quantity
 * @param  {number} multiplier optional
 */
function OptionOrderTransaction(accountCurrency, securityID, tradeDate, amount, usdRate, quantity, multiplier) {
  OrderTransaction.call(this, accountCurrency, securityID, tradeDate, amount, usdRate, quantity);
  this.multiplier = (typeof multiplier !== 'undefined') ? multiplier : 100;
}

OptionOrderTransaction.prototype = Object.create(OrderTransaction.prototype);
OptionOrderTransaction.prototype.constructor = OptionOrderTransaction;
OptionOrderTransaction.prototype.getInvestmentType = function() { return 'OPTION_ORDER'; };
OptionOrderTransaction.prototype.getMultiplier = function() { return this.multiplier; };


// Configuration to run on node with mock data
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