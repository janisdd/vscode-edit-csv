"use strict";
let vscode = undefined;
if (typeof acquireVsCodeApi !== 'undefined') {
    vscode = acquireVsCodeApi();
}
const csv = window.Papa;
let hot;
const defaultCsvContentIfEmpty = ',';
let headerRow = null;
let miscOptions = {
    doubleClickMinColWidth: 200
};
let csvReadOptions = {
    header: false,
    comments: '#',
    delimiter: '',
    newline: '',
    quoteChar: '"',
    skipEmptyLines: true,
    dynamicTyping: false,
    _hasHeader: false
};
let csvWriteOptions = {
    header: false,
    comments: '#',
    delimiter: '',
    newline: '',
    quoteChar: '"',
};
let newLineFromInput = '\n';
let commentLinesBefore = [];
let commentLinesAfter = [];
const csvEditorWrapper = _getById('csv-editor-wrapper');
const csvEditorDiv = _getById('csv-editor');
const helModalDiv = _getById('help-modal');
setCsvReadOptionsInitial(csvReadOptions);
setCsvWriteOptionsInitial(csvWriteOptions);
if (typeof initialContent === 'undefined') {
    var initialContent = '';
}
if (initialContent === undefined) {
    initialContent = '';
}
console.log("initialContent: " + initialContent);
let _data = parseCsv(initialContent, csvReadOptions);
displayData(_data);
toggleReadOptions(true);
toggleWriteOptions(true);
togglePreview(true);
onResize();
window.addEventListener('message', (event) => {
    handleVsCodeMessage(event);
});
//# sourceMappingURL=main.js.map