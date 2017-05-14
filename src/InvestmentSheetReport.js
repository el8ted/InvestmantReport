/**
 * Created by Tom on 2017-05-14.
 * Class to interact with putting data into report of the active sheet
 */
"use strict";


gobal.RUN_ON_NODE = true;
if (global.RUN_ON_NODE) {
  var Transaction = require('./Transaction.js');
  var Security = Transaction.Security;

  
  module.exports = node_init;
}


var TransactionType = {'INTEREST': 'INTEREST', 'CARRY_CHARGE': 'CARRY_CHARGE', 'DIVIDEND': 'DIVIDEND', 'ORDERS': 'ORDER'};

var SheetConfig = {
  DataRange: 'K1',
  DateColumns: {'REPORT_TYPE': 0, 'SECURIT_ID': 1, 'AMOUNT': 2, 'GAIN_LOSS': 3, 'QUANTITY': 4, 'ACB': 5 }
};


/**
 * Report class 
 */
function InvestmentRepoort(accountCurrency, securityID) {
  this.reportList = {'INCOME': 0, 'CARRY_CHARGE': 1, 'GAIN_LOSS': 2}};
}

Security.prototype.getAccountCurrency = function() { return this.accountCurrency; };
Security.prototype.getSecurityID = function() { return this.securityID; };
Security.prototype.getUID = function() { return this.accountCurrency + "_" + this.securityID; };
