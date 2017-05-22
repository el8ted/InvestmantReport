/**
 * @license MIT
 *
 * @fileoverview Collection of transaction classes supported in investment report
 *
 * @author tomek32@gmail.com Tom Hosiawa
 */
"use strict";

// Configuration to run on node with mock data
if (typeof process !== 'undefined' && process.release.name === 'node') {
  var Security = require('./security.js').Security;

  module.exports.BaseTransaction = BaseTransaction;
  module.exports.DividendTransaction = DividendTransaction;
  module.exports.InterestTransaction = InterestTransaction;
  module.exports.CarryChargeTransaction = CarryChargeTransaction;
  module.exports.OrderTransaction = OrderTransaction;
  module.exports.OptionOrderTransaction = OptionOrderTransaction;
}


/**
 * Base transaction class that is extended by specific transaction
 * @constructor
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

BaseTransaction.prototype.getAmount = function() { return this.amount; };
BaseTransaction.prototype.getInvestmentType = function() { return 'TRANSACTION'; };
BaseTransaction.prototype.getSecurity = function() { return this.security; };
BaseTransaction.prototype.getTradeDate = function() { return this.tradeDate; };
BaseTransaction.prototype.getUSDRate = function() { return this.usdRate; };


/**
 * Dividend transaction class (extends BaseTransaction class)
 * @constructor
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
      this.amountWithheld = null;
    } else {
      this.amountWithheld = amount;
      amount = 'undefined';
    }
  }

  BaseTransaction.call(this, accountCurrency, securityID, tradeDate, amount, usdRate);
  this.quantity = (typeof quantity !== 'undefined') ?  quantity : null;
}

DividendTransaction.prototype = Object.create(BaseTransaction.prototype);
DividendTransaction.prototype.constructor = DividendTransaction;
DividendTransaction.prototype.getAmountWithheld = function() { return this.amountWithheld; };
DividendTransaction.prototype.getInvestmentType = function() { return 'DIVIDEND'; };
DividendTransaction.prototype.getQuantity = function() { return this.quantity; };


/**
 * Interest transaction class (extends BaseTransaction class)
 * @constructor
 * @param  {string} accountCurrency
 * @param  {string} securityID
 * @param  {string} tradeDate
 * @param  {number} amount
 * @param  {number} usdRate optional
 */
function InterestTransaction(accountCurrency, securityID, tradeDate, amount, usdRate) {
  BaseTransaction.call(this, accountCurrency, securityID, tradeDate, amount, usdRate);
}

InterestTransaction.prototype = Object.create(BaseTransaction.prototype);
InterestTransaction.prototype.constructor = InterestTransaction;
InterestTransaction.prototype.getInvestmentType = function() { return 'INTEREST'; };


/**
 * Carry Charge transaction class (extends BaseTransaction class)
 * @constructor
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
 * Order transaction class (extends BaseTransaction class)
 * TODO: add support for exchange traded debentures
 * @constructor
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
 * Option Order transaction class (extends BaseTransaction class)
 * TODO: add support for non-standard multipler
 * @constructor
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