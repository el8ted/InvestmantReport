/**
 * Created by Tom on 2017-05-01.
 * Class to interact with getting data from active sheet and put report in the same active sheet
 */
"use strict";
global.RUN_ON_NODE = true;

var InvestmentType = {
  'INTEREST': 'INTEREST',
  'CARRY_CHARGE': 'CARRY_CHARGE',
  'DIVIDEND': 'DIVIDEND',
  'ORDERS': 'ORDER'
};


// Configuration to run on node with mock data
if (global.RUN_ON_NODE) {
  module.exports.InvestmentType = InvestmentType;
}