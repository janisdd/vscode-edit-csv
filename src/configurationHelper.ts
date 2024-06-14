import * as vscode from 'vscode';
import { editorUriScheme } from './extension';
import { limitSingleCharacterString } from "./util";



const defaultConfig: EditCsvConfig = {
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
	readOption_delimitersToGuess: [",", "\t", "|", ";", "\u001e", "\u001f"],
	readOption_alternativeNewLine: "",
	readOption_hasHeader: "false",
	writeOption_comment: "#",
	writeOption_delimiter: "",
	writeOption_alternativeNewLine: "",
	writeOption_quoteChar: '"',
	writeOption_escapeChar: '"',
	writeOption_hasHeader: "false",
	doubleClickColumnHandleForcedWith: 200,
	doubleClickRowHandleForcedHeight: 106, //this gives us 5 rows with the default font size
	openSourceFileAfterApply: false,
	selectTextAfterBeginEditCell: false,
	quoteAllFields: false,
	quoteEmptyOrNullFields: 'false',
	initiallyHideComments: false,
	enableWrapping: true,
	initialColumnWidth: 0,
	autoColumnWidthsIgnoreComments: true,
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
	hideOpenCsvEditorUiActions: false, //noop, has only effect if set inside the user settings
	openTableAndSelectCellAtCursorPos: "initialOnly_correctRowAlwaysFirstColumn",
	pasteMode: 'normal',
	fontFamilyInTable: 'default',
	showDeleteColumnHeaderButton: true,
	showDeleteRowHeaderButton: true,
	finalNewLine: 'sameAsSourceFile',
	darkThemeTextColor: '#d0d0d0',
	lightThemeTextColor: '#657b83',
	convertUrlsToLinkTags: true,
}

/**
 * returns the configuration for this extension
 */
export function getExtensionConfiguration(): EditCsvConfig {
	const configObj = vscode.workspace.getConfiguration(editorUriScheme)

	const copy: EditCsvConfig = {
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

	console.log(`[edit csv] settings`, copy)

	return copy
}

export function overwriteConfiguration(currentConfig: EditCsvConfig, overwriteConfigObj: EditCsvConfigOverwrite): void{

	for (const key in overwriteConfigObj) {

		if (!currentConfig.hasOwnProperty(key)) {
			vscode.window.showWarningMessage(`unknown setting '${key}', skipping this setting`)
			continue
		}

		//@ts-ignore
		currentConfig[key] = overwriteConfigObj[key] as any

		console.log(`[edit csv] overwrote config key: '${key}' with value: `, (overwriteConfigObj as any)[key])
	}

	console.log(`[edit csv] resulting settings`, currentConfig)
}