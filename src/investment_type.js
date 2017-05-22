/**
 * Created by Tom on 2017-05-01.
 * Class to interact with getting data from active sheet and put report in the same active sheet
 */
"use strict";

var InvestmentType = {
  'INTEREST': 'INTEREST',
  'CARRY_CHARGE': 'CARRY_CHARGE',
  'DIVIDEND': 'DIVIDEND',
  'ORDER': 'ORDER'
};

// Configuration to run on node with mock data
if (typeof process !== 'undefined' && process.release.name === 'node') {
  module.exports.InvestmentType = InvestmentType;
}