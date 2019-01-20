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
    skipEmptyLines: true,
    dynamicTyping: false,
    _hasHeader: false
};
let defaultCsvWriteOptions = {
    header: false,
    comments: '#',
    delimiter: '',
    newline: '',
    quoteChar: '"',
};
let newLineFromInput = '\n';
const csvEditorWrapper = _getById('csv-editor-wrapper');
const csvEditorDiv = _getById('csv-editor');
const helModalDiv = _getById('help-modal');
const beforeCommentsTextareaId = 'comments-before';
const afterCommentsTextareaId = 'comments-after';
const commentsBeforeOptionId = 'comments-before-option';
const commentsAfterOptionId = 'comments-after-option';
const toggleCommentsSectionsButtonId = 'toggle-comments-sections';
setCsvReadOptionsInitial(defaultCsvReadOptions);
setCsvWriteOptionsInitial(defaultCsvWriteOptions);
if (typeof initialContent === 'undefined') {
    var initialContent = '';
}
if (initialContent === undefined) {
    initialContent = '';
}
initialContent =
    `
#test
1,2,3
4,5,6,7,8

#after
`;
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