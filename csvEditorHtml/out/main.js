"use strict";
let vscode = undefined;
if (typeof acquireVsCodeApi !== 'undefined') {
    vscode = acquireVsCodeApi();
}
if (typeof initialConfig === 'undefined') {
    var initialConfig = undefined;
}
const csv = window.Papa;
let hot;
const defaultCsvContentIfEmpty = `,\n,`;
let headerRow = null;
let defaultCsvReadOptions = {
    header: false,
    comments: '#',
    delimiter: '',
    newline: '',
    quoteChar: '"',
    escapeChar: '"',
    skipEmptyLines: true,
    dynamicTyping: false,
    _hasHeader: true,
};
let defaultCsvWriteOptions = {
    header: false,
    comments: '#',
    delimiter: '',
    newline: '',
    quoteChar: '"',
    escapeChar: '"',
    quoteAllFields: false,
};
let newLineFromInput = '\n';
const csvEditorWrapper = _getById('csv-editor-wrapper');
const csvEditorDiv = _getById('csv-editor');
const helModalDiv = _getById('help-modal');
const askReadAgainModalDiv = _getById('ask-read-again-modal');
const beforeCommentsTextareaId = 'comments-before';
const afterCommentsTextareaId = 'comments-after';
const commentsBeforeOptionId = 'comments-before-option';
const commentsAfterOptionId = 'comments-after-option';
const toggleCommentsSectionsButtonId = 'toggle-comments-sections';
const commentsBeforeHasContentDiv = _getById('comments-before-has-content');
const commentsAfterHasContentDiv = _getById('comments-after-has-content');
const readDelimiterTooltip = _getById('read-delimiter-tooltip');
const readDelimiterTooltipText = "Empty to auto detect";
setCsvReadOptionsInitial(defaultCsvReadOptions);
setCsvWriteOptionsInitial(defaultCsvWriteOptions);
if (typeof initialContent === 'undefined') {
    var initialContent = '';
}
if (initialContent === undefined) {
    initialContent = '';
}
initialContent = `123,wet`;
console.log("initialConfig: ", initialConfig);
console.log("initialContent: " + initialContent);
setupAndApplyInitialConfigPart1(initialConfig);
let _data = parseCsv(initialContent, defaultCsvReadOptions);
if (_data) {
    displayData(_data[1], _data[0], _data[2]);
    setupAndApplyInitialConfigPart2(_data[0], _data[2], initialConfig);
}
if (vscode) {
    console.log(JSON.stringify(vscode.getState()));
}
//# sourceMappingURL=main.js.map