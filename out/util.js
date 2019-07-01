"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function debugLog(msg) {
    // console.log(msg)
}
exports.debugLog = debugLog;
/**
 * gets the current view column (e.g. we could have split view)
 */
function getCurrentViewColumn() {
    return vscode.window.activeTextEditor && vscode.window.activeTextEditor.viewColumn
        ? vscode.window.activeTextEditor.viewColumn
        : vscode.ViewColumn.One;
}
exports.getCurrentViewColumn = getCurrentViewColumn;
//from https://davidwalsh.name/javascript-debounce-function
function debounce(func, wait, immediate = false) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate)
                func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow)
            func.apply(context, args);
    };
}
exports.debounce = debounce;
//inspired from https://github.com/jjuback/gc-excelviewer/blob/master/src/extension.ts
function isCsvFile(document) {
    if (!document)
        return false;
    let lang = document.languageId.toLowerCase();
    let possible = ['csv', 'csv (semicolon)', 'tsv', 'plaintext'];
    const _isCsvFile = possible.find(p => p === lang) && document.uri.scheme !== 'csv-edit';
    return _isCsvFile;
}
exports.isCsvFile = isCsvFile;
function partitionString(text, sliceLength) {
    const slices = [];
    const totalSlices = Math.ceil(text.length / sliceLength);
    for (let i = 0; i < totalSlices; i++) {
        const _part = text.substr(i * sliceLength, sliceLength);
        slices.push({
            text: _part,
            sliceNr: i + 1,
            totalSlices
        });
    }
    return slices;
}
exports.partitionString = partitionString;
//# sourceMappingURL=util.js.map