/**
 * Created by Tom on 2017-05-01.
 */

/**
 *
 */
function TransactionDB() {
  this.transactions = {'INTEREST': [], 'CARRY_CHARGE': [], 'DIVIDEND': [], 'ORDER': [], 'OPTION_ORDER': []};
}

/**
 * @param transaction
 */
TransactionDB.prototype.addTransaction = function(transaction) {
  this.transactions[transaction.getTransactionType()] = transaction;
};

/**
 *
 */
TransactionDB.prototype.getDividendTransactions = function() {
  return this.transactions['DIVIDEND'];
};

/**
 *
 */
TransactionDB.prototype.getInterestTransactions = function() {
  return this.transactions['INTEREST'];
};

/**
 *
 */
TransactionDB.prototype.getCarryChargeTransactions = function() {
  return this.transactions['CARRY_CHARGE'];
};

/**
 *
 */
TransactionDB.prototype.getOrderTransactions = function() {
  return this.transactions['ORDER'];
};

/**
 *
 */
TransactionDB.prototype.getTransactionType = function(transaction) {
  return this.transactions['OPTION_ORDER'];
};

/**
 *
 */
TransactionDB.prototype.getUniqueSecurityIDs = function (type) {
  var list = {};

  for (var i = 0; i < this.transactions[type].length; i++) {
    var UID =  this.transactions[type][i]['ACCOUNT_CURR'] + this.transactions[type][i]['SECURITY_ID-'];

    if (!(UID in list.indexOf))
      list.push(UID);
  }
};