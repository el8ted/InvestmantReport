/**
 * Created by Tom on 2017-05-13.
 * Mock of Google's Spreadsheet services
 */
"use strict";


global.RUN_ON_NODE = true;
if (global.RUN_ON_NODE) {
  module.exports.ActiveSpreadsheet = ActiveSpreadsheet;
  module.exports.ActiveSheet = ActiveSheet;
  module.exports.ArrayLib = ArrayLib;
  module.exports.SpreadsheetApp = SpreadsheetApp;
  module.exports.Range = Range;
}

/**
 * ActiveSpreadsheet
 */
function ActiveSpreadsheet() {}

ActiveSpreadsheet.prototype.getSheetByName = function (sheetName) { return '2011 New'; };


/**
 * ActiveSheet
 */
function ActiveSheet() {}

ActiveSheet.prototype.getRange = function (range) { return new Range(); };


/**
 * ArrayLib
 */
function ArrayLib() {}

ArrayLib.prototype.sort = function (data, columnIndex, ascOrDesc) { return data; };


/**
 * Range
 */
function Range() {}

Range.prototype.getValues = function () {
  var fs = require('fs');
  var values = null;

  try {
    values = fs.readFileSync('RangeValues.txt', 'utf8');
  } catch (e) { throw e; }

  return JSON.parse(values);
};


/**
 * SpreadsheetApp
 */
function SpreadsheetApp() {}

SpreadsheetApp.prototype.getActiveSheet = function (sheetName) { return new ActiveSheet(); };
SpreadsheetApp.prototype.getActiveSpreadsheet = function () { return new ActiveSpreadsheet(); };
SpreadsheetApp.prototype.setActiveSheet = function (sheetName) {};