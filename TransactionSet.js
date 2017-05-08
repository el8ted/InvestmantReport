/**
 * Created by Tom on 2017-05-01.
 */

/**
 * Object to hold transactions by category
 */
//var TransactionSet = (function() {
  function TransactionSet() {
    this.transactionsList = {'INTEREST': [], 'CARRY_CHARGE': [], 'DIVIDEND': [], 'ORDER': [], 'OPTION_ORDER': []};
  }

  /**
   * @param transaction - Transaction object to add to list
   */
  TransactionSet.prototype.addTransaction = function(transaction) {
    this.transactionsList[transaction.getTransactionType()].push(transaction);
  };

  /**
   * @returns array of transactions objects of type dividend
   */
  TransactionSet.prototype.getDividendTransactions = function() {
    return this.transactionsList['DIVIDEND'];
  };

  /**
   * @returns array of transactions objects of type interest
   */
  TransactionSet.prototype.getInterestTransactions = function() {
    return this.transactionsList['INTEREST'];
  };

  /**
   *@returns array of transactions objects of type carry charge
   */
  TransactionSet.prototype.getCarryChargeTransactions = function() {
    return this.transactionsList['CARRY_CHARGE'];
  };

  /**
   * @returns array of transactions objects of type order
   */
  TransactionSet.prototype.getOrderTransactions = function() {
    return this.transactionsList['ORDER'];
  };

  /**
   * @returns array of transactions objects of type option order
   */
  TransactionSet.prototype.getOptionOrderTransaction = function(transaction) {
    return this.transactionsList['OPTION_ORDER'];
  };

  /**
   * @param type - string of transaction type (INTEREST, CARRY_CHARGE, DIVIDEND, ORDER, OPTION_ORDER)
   * @returns json object {'ACCOUNT CURRENT', 'SECURITY_ID'} of unqiue indenitifers matching the transaction type specified
   */
  TransactionSet.prototype.getUniqueSecurityIDs = function (type) {
    var list = {};

    for (var i = 0; i < this.transactionsList[type].length; i++) {
      var UID = {'ACCOUNT CURRENCY': this.transactionsList[type][i]['ACCOUNT'],
                 'SECURITY_ID': this.transactionsList[type][i]['SECURITY_ID-']};

      if (!(UID in list.indexOf))
        list.push(UID);
    }
  };
//})();