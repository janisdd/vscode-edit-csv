import * as vscode from 'vscode';

export function debugLog(msg: any) {
	// console.log(msg)
}

/**
 * gets the current view column (e.g. we could have split view)
 */
export function getCurrentViewColumn(): vscode.ViewColumn {
	return vscode.window.activeTextEditor && vscode.window.activeTextEditor.viewColumn
		? vscode.window.activeTextEditor.viewColumn
		: vscode.ViewColumn.One
}

export function limitSingleCharacterString(value: string): string {
	
	if (value.length > 1) {
		//using last char is more user friendly as we can click and press a key to use the new char
		value = value.substring(value.length-1)
	}

	return value
}

//from https://davidwalsh.name/javascript-debounce-function
export function debounce(func: Function, wait: number, immediate = false) {
	var timeout: any;
	return function (this: any) {
		var context = this, args = arguments;
		var later = function () {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}

//inspired from https://github.com/jjuback/gc-excelviewer/blob/master/src/extension.ts
export function isCsvFile(document: vscode.TextDocument) {
	if (!document) return false

	let lang = document.languageId.toLowerCase()
	let possible = ['csv', 'tsv', 'plaintext',
		//rainbow csv extension types, see https://github.com/mechatroner/vscode_rainbow_csv
		'csv (semicolon)', 'csv (pipe)', 'csv (whitespace)', 'csv (tilde)', 'csv (caret)', 'csv (colon)', 'csv (double quote)', 'csv (equals)', 'csv (dot)', 'csv (hyphen)'
	]
	const _isCsvFile = possible.find(p => p === lang) && document.uri.scheme !== 'csv-edit'
	return _isCsvFile
}

export function partitionString(text: string, sliceLength: number): StringSlice[] {

	const slices: StringSlice[] = []
	const totalSlices = Math.ceil(text.length / sliceLength)

	for (let i = 0; i < totalSlices; i++) {
		const _part = text.substr(i * sliceLength, sliceLength)

		slices.push({
			text: _part,
			sliceNr: i + 1,
			totalSlices
		})
	}

	return slices
}