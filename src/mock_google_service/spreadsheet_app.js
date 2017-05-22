/**
 * @license MIT
 *
 * @fileoverview  Mock of Google's Sheets APIs required by InvestmentReport
 *
 * @author tomek32@gmail.com Tom Hosiawa
 */
"use strict";

module.exports.ActiveSpreadsheet = ActiveSpreadsheet;
module.exports.ActiveSheet = ActiveSheet;
module.exports.ArrayLib = ArrayLib;
module.exports.Range = Range;
module.exports.SpreadsheetApp = SpreadsheetApp;


/**
 * @constructor
 */
function ActiveSpreadsheet() {}

/**
 * @param {string} sheetName
 * @returns {string}
 */
ActiveSpreadsheet.prototype.getSheetByName = function(sheetName) { return '2011 New'; };


/**
 *  @constructor
 */
function ActiveSheet() {}

/**
 * @param {string} range
 * @returns {Range}
 */
ActiveSheet.prototype.getRange = function(range) { return new Range(); };


/**
 *  @constructor
 */
function ArrayLib() {}

/**
 * @param {Array<data><data>} data
 * @param {number} columnIndex
 * @param {string} ascOrDesc
 * @returns {Array<data><data>}
 */
ArrayLib.prototype.sort = function(data, columnIndex, ascOrDesc) { return data; };


/**
 *  @constructor
 */
function Range() {}

/**
 * @return {Array<data><data>}
 */
Range.prototype.getValues = function() {
  var fs = require('fs');
  var values = null;

  try {
    values = fs.readFileSync('./resources/range_values.txt', 'utf8');
  } catch (e) {
    throw e;
  }

  return JSON.parse(values);
};

/**
 * @param {Array<values><values>} values
 */
Range.prototype.setValues = function(values) {};


/**
 * @constructor
 */
function SpreadsheetApp() {}

SpreadsheetApp.prototype.getActiveSheet = function(sheetName) { return new ActiveSheet(); };
SpreadsheetApp.prototype.getActiveSpreadsheet = function() { return new ActiveSpreadsheet(); };
SpreadsheetApp.prototype.setActiveSheet = function(sheetName) {};