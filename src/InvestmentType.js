/**
 * Created by Tom on 2017-05-01.
 * Class to interact with getting data from active sheet and put report in the same active sheet
 */
"use strict";


global.RUN_ON_NODE = true;
if (global.RUN_ON_NODE) {
  module.exports.InvestmentType = InvestmentType;
}


var InvestmentType = {
  'INTEREST': 'INTEREST',
  'CARRY_CHARGE': 'CARRY_CHARGE',
  'DIVIDEND': 'DIVIDEND',
  'ORDERS': 'ORDER'
};