"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExtensionConfiguration = void 0;
const vscode = require("vscode");
const extension_1 = require("./extension");
const defaultConfig = {
    highlightCsvComments: true,
    lastRowEnterBehavior: 'default',
    lastColumnTabBehavior: 'default',
    optionsBarAppearance: "collapsed",
    readOption_comment: "#",
    readOption_quoteChar: '"',
    readOption_escapeChar: '"',
    readOption_delimiter: "",
    readOption_hasHeader: "false",
    writeOption_comment: "#",
    writeOption_delimiter: "",
    writeOption_quoteChar: '"',
    writeOption_escapeChar: '"',
    writeOption_hasHeader: "false",
    doubleClickColumnHandleForcedWith: 200,
    openSourceFileAfterApply: false,
    selectTextAfterBeginEditCell: false,
    quoteAllFields: false,
    initiallyHideComments: false,
    enableWrapping: true,
    initialColumnWidth: 0,
    retainQuoteInformation: true,
    newColumnQuoteInformationIsQuoted: false,
    disableBorders: false,
    initiallyFixedRowsTop: 0,
    initiallyFixedColumnsLeft: 0,
    fontSizeInPx: 16,
    showColumnHeaderNamesWithLettersLikeExcel: false,
    shouldWatchCsvSourceFile: true,
    sidePanelAppearance: 'collapsed',
    initialNumbersStyle: 'en',
};
/**
 * returns the configuration for this extension
 */
function getExtensionConfiguration() {
    const configObj = vscode.workspace.getConfiguration(extension_1.editorUriScheme);
    const copy = Object.assign({}, defaultConfig);
    for (const key in defaultConfig) {
        const optionValue = configObj.get(key);
        if (optionValue === undefined) {
            vscode.window.showWarningMessage(`Could not find option: ${key} in csv-edit configuration`);
            continue;
        }
        //@ts-ignore
        copy[key] = optionValue;
    }
    return copy;
}
exports.getExtensionConfiguration = getExtensionConfiguration;
//# sourceMappingURL=configurationHelper.js.map