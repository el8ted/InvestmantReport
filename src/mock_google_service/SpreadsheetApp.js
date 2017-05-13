/**
 * Created by Tom on 2017-05-13.
 * Mock of Google's Spreadsheet services
 */
"use strict";


/**
 * SpreadsheetApp
 */
(function() {
    function SpreadsheetApp() {
    }

    SpreadsheetApp.prototype.getActiveSheet = function (sheetName) { return new ActiveSheet(); };
    SpreadsheetApp.prototype.getActiveSpreadsheet = function () { return new ActiveSpreadsheet(); };
    SpreadsheetApp.prototype.setActiveSheet = function (sheetName) {};
})();


/**
 * ActiveSpreadsheet
 */
(function() {
    function ActiveSpreadsheet() {
    }

    ActiveSpreadsheet.prototype.getSheetByName = function (sheetName) { return '2011 New'; };
})();


/**
 * ActiveSheet
 */
(function() {
    function ActiveSheet() {
    }

    ActiveSheet.prototype.getRange = function (range) { return '2011 New'; };
})();


/**
 * Range
 */
(function() {
    function Range() {
    }

    Range.prototype.getValues = function () { return require('RangeValues.txt'); };
})();