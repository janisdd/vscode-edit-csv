import * as vscode from 'vscode';
import { editorUriScheme } from './extension';



const defaultConfig: CsvEditSettings = {
	lastRowEnterBehavior: 'default',
	lastColumnTabBehavior: 'default',
	beforeCommentsAppearance: "onlyOnContent",
	afterCommentsAppearance: "onlyOnContent",
	previewOptionsAppearance: "collapsed",
	writeOptionsAppearance: "collapsed",
	readOptionsAppearance: "collapsed",
	readOption_comment: "#",
	readOption_delimiter: "",
	readOption_hasHeader: "false",
	writeOption_comment: "#",
	writeOption_delimiter: "",
	writeOption_hasHeader: "false",
	doubleClickColumnHandleForcedWith: 200,
	openSourceFileAfterCommit: false,
	selectTextAfterBeginEditCell: false
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