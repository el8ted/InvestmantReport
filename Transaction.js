/**
 * Created by Tom on 2017-05-01.
 */

/**
 * Base transection object
 */
//var BaseTransaction = (function() {
  function BaseTransaction(accountCurr, securityID, tradeDate, amount, usdRate) {
    this.accountCurrency = accountCurr;
    this.securityID = securityID;
    this.tradeDate = tradeDate;
    this.amount = amount;
    this.usdRate = (typeof usdRate !== 'undefined') ?  usdRate : null;
  }

  BaseTransaction.prototype.getTransactionType = function() { return 'TRANSACTION'; };
  BaseTransaction.prototype.getAccountCurr = function() { return this.accountCurrency; };
  BaseTransaction.prototype.getSecurityID = function() { return this.securityID; };
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

    this.transaction = new BaseTransaction(accountCurrency, symbol, tradeDate, amount, usdRate);
    this.quantity = (typeof quantity !== 'undefined') ?  quantity : null;
  }

  DividendTransaction.prototype.getTransactionType = function() { return 'DIVIDEND'; };
  DividendTransaction.prototype.getAmountWithheld = function() { return this.amountWithheld; };
  DividendTransaction.prototype.getQuantity = function() { return this.quantity; };
//})();


//var InterestTransaction = (function() {
  /**
   * @param usdRate - optional
   */
  function InterestTransaction(accountCurrency, tradeDate, amount, usdRate) {
    this.transaction = new BaseTransaction(accountCurrency, tradeDate, amount, usdRate);
  }

  InterestTransaction.prototype.getTransactionType = function() { return 'INTEREST'; };
//})();


//var CarryChargeTransaction = (function() {
  /**
   * @param usdRate - optional
   */
  function CarryChargeTransaction(accountCurrency, tradeDate, amount, usdRate) {
    this.transaction = new BaseTransaction(accountCurrency, tradeDate, amount, usdRate);
  }

  CarryChargeTransaction.prototype.getTransactionType = function() { return 'CARRY_CHARGE'; };
//})();


//var OrderTransaction = (function() {
  /**
   * TODO: add support for commission, exchange traded debentures
   * @param amount - optional. net amount of order (after commission)
   * @param usdRate - optional
   */
  function OrderTransaction(accountCurrency, symbol, tradeDate, amount, quantity, usdRate) {
    this.transaction = new BaseTransaction(accountCurrency, symbol, tradeDate, amount, usdRate);
    this.quantity = (typeof quantity !== 'undefined') ?  quantity : null;
    this.realizedGainLoss = null;
  }

  OrderTransaction.prototype.getTransactionType = function() { return 'ORDER'; };
  OrderTransaction.prototype.getQuantity = function() { return this.quantity; };
  OrderTransaction.prototype.getRealizedGainLoss = function() { return this.realizedGainLoss; };
//})();


//var OptionOrderTransaction = (function() {
  /**
   * TODO: add commission support
   * @param amount - optional. net amount of order (after commission)
   * @param usdRate - optional
   */
  function OptionOrderTransaction(accountCurrency, symbol, tradeDate, amount, quantity, usdRate, multiplier) {
    this.transaction = new Order (accountCurrency, symbol, tradeDate, amount, quantity, usdRate);
    this.multiplier = (typeof multiplier !== 'undefined') ? multiplier : null;
  }

  OptionOrderTransaction.prototype.getTransactionType = function() { return 'OPTION_ORDER'; };
  OptionOrderTransaction.prototype.getMultiplier = function() { return this.multiplier; };
//})();