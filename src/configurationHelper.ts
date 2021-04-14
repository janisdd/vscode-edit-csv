import * as vscode from 'vscode';
import { editorUriScheme } from './extension';
import { limitSingleCharacterString } from "./util";



const defaultConfig: CsvEditSettings = {
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
}

/**
 * returns the configuration for this extension
 */
export function getExtensionConfiguration(): CsvEditSettings {
	const configObj = vscode.workspace.getConfiguration(editorUriScheme)

	const copy = {
		...defaultConfig
	}

	for (const key in defaultConfig) {
		const optionValue = configObj.get(key)

		if (optionValue === undefined) {
			vscode.window.showWarningMessage(`Could not find option: ${key} in csv-edit configuration`)
			continue
		}

		//@ts-ignore
		copy[key] = optionValue
	}

	//ensure single character requirements
	copy.readOption_quoteChar = limitSingleCharacterString(copy.readOption_quoteChar)
	copy.readOption_escapeChar = limitSingleCharacterString(copy.readOption_escapeChar)
	copy.writeOption_quoteChar = limitSingleCharacterString(copy.writeOption_quoteChar)
	copy.writeOption_escapeChar = limitSingleCharacterString(copy.writeOption_escapeChar)

	return copy
}