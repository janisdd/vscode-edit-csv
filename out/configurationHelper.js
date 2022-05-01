"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.overwriteConfiguration = exports.getExtensionConfiguration = void 0;
const vscode = require("vscode");
const extension_1 = require("./extension");
const util_1 = require("./util");
const defaultConfig = {
    highlightCsvComments: true,
    lastRowEnterBehavior: 'default',
    lastColumnTabBehavior: 'default',
    lastRowOrFirstRowNavigationBehavior: 'wrap',
    lastColumnOrFirstColumnNavigationBehavior: 'wrap',
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
    quoteEmptyOrNullFields: 'false',
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
    insertRowBehavior: 'keepRowKeepColumn',
    insertColBehavior: 'keepRowKeepColumn',
    initiallyIsInReadonlyMode: false,
    hideOpenCsvEditorUiActions: false,
    openTableAndSelectCellAtCursorPos: "initialOnly_correctRowAlwaysFirstColumn",
    pasteMode: 'normal',
    fontFamilyInTable: 'default',
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
    //ensure single character requirements
    copy.readOption_quoteChar = util_1.limitSingleCharacterString(copy.readOption_quoteChar);
    copy.readOption_escapeChar = util_1.limitSingleCharacterString(copy.readOption_escapeChar);
    copy.writeOption_quoteChar = util_1.limitSingleCharacterString(copy.writeOption_quoteChar);
    copy.writeOption_escapeChar = util_1.limitSingleCharacterString(copy.writeOption_escapeChar);
    console.log(`[edit csv] settings`, copy);
    return copy;
}
exports.getExtensionConfiguration = getExtensionConfiguration;
function overwriteConfiguration(currentConfig, overwriteConfigObj) {
    for (const key in overwriteConfigObj) {
        if (!currentConfig.hasOwnProperty(key)) {
            vscode.window.showWarningMessage(`unknown setting '${key}', skipping this setting`);
            continue;
        }
        //@ts-ignore
        currentConfig[key] = overwriteConfigObj[key];
        console.log(`[edit csv] overwrote config key: '${key}' with value: `, overwriteConfigObj[key]);
    }
    console.log(`[edit csv] resulting settings`, currentConfig);
}
exports.overwriteConfiguration = overwriteConfiguration;
//# sourceMappingURL=configurationHelper.js.map