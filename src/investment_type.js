/**
 * @license MIT
 *
 * @fileoverview Supported investment types
 *
 * @author tomek32@gmail.com Tom Hosiawa
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