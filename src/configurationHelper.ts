import * as vscode from 'vscode';
import { editorUriScheme } from './extension';



const defaultConfig: CsvEditSettings = {
	highlightCsvComments: true,
	lastRowEnterBehavior: 'default',
	lastColumnTabBehavior: 'default',
	previewOptionsAppearance: "collapsed",
	writeOptionsAppearance: "collapsed",
	readOptionsAppearance: "collapsed",
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

	return copy
}