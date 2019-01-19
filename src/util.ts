import * as vscode from 'vscode';

/**
 * gets the current view column (e.g. we could have split view)
 */
export function getCurrentViewColumn(): vscode.ViewColumn {
	return vscode.window.activeTextEditor && vscode.window.activeTextEditor.viewColumn
		? vscode.window.activeTextEditor.viewColumn
		: vscode.ViewColumn.One
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
	let possible = ['csv', 'csv (semicolon)', 'tsv', 'plaintext']
	const _isCsvFile = possible.find(p => p === lang) && document.uri.scheme !== 'csv-edit'
	return _isCsvFile
}