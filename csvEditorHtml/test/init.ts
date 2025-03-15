
window.vscode = null
window.papaCsv = window.Papa

const defaultInitialVars = {
	isWatchingSourceFile: false,
	sourceFileCursorLineIndex: null,
	sourceFileCursorColumnIndex: null,
	isCursorPosAfterLastColumn: false,
	openTableAndSelectCellAtCursorPos: 'initialOnly_correctRowAlwaysFirstColumn',
	os: 'web',
}
window.initialVars = defaultInitialVars

let defaultCsvReadOptions: CsvReadOptions = {
	header: false, //always use false to get an array of arrays
	comments: '#',
	delimiter: '', //auto detect
	delimitersToGuess: [',', '\t', '|', ';',
		String.fromCharCode(30), //Papa.RECORD_SEP // \u001e" // INFORMATION SEPARATOR TWO
		String.fromCharCode(31), //Papa.UNIT_SEP // \u001f" // INFORMATION SEPARATOR ONE
	],
	newline: '', //auto detect
	quoteChar: '"',
	escapeChar: '"',
	skipEmptyLines: true,
	dynamicTyping: false,
	_hasHeader: false,
}
window.defaultCsvReadOptions = defaultCsvReadOptions


//this gets overwritten with the real configuration in setCsvWriteOptionsInitial
let defaultCsvWriteOptions: CsvWriteOptions = {
	header: false,
	comments: '#',
	delimiter: '', //'' = use from input, will be set from empty to string when exporting (or earlier)
	newline: '', //set by editor
	quoteChar: '"',
	escapeChar: '"',
	quoteAllFields: false,
	quoteEmptyOrNullFields: false,
}
window.defaultCsvWriteOptions = defaultCsvWriteOptions


//do not use original type here, else we get some error that modules are not found...
window.knownNumberStylesMap = {
	"en": {
		key: 'en',
		/**
		 * this allows:
		 * 0(000)
		 * 0(000).0(000)
		 * .0(000)
		 * all repeated with - in front (negative numbers)
		 * all repeated with e0(000) | e+0(000) | e-0(000)
		 */
		regex: /-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?/,
		regexStartToEnd: /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/,
		thousandSeparator: /(\,| )/gm,
		thousandSeparatorReplaceRegex: /((\,| )\d{3})+/gm
	},
	"non-en": {
		key: 'non-en',
		/**
		 * this allows:
		 * 0(000)
		 * 0(000),0(000)
		 * ,0(000)
		 * all repeated with - in front (negative numbers)
		 * all repeated with e0(000) | e+0(000) | e-0(000)
		 */
		regex: /-?(\d+(\,\d*)?|\,\d+)(e[+-]?\d+)?/,
		regexStartToEnd: /^-?(\d+(\,\d*)?|\,\d+)(e[+-]?\d+)?$/,
		thousandSeparator: /(\.| )/gm,
		thousandSeparatorReplaceRegex: /((\.| )\d{3})+/gm
	}
}

window.newColumnQuoteInformationIsQuoted = false


//ui mocks

window.newlineSameSsInputOptionText = `Same as input`
window.readDelimiterTooltipText = "Empty to auto detect"

window.newlineSameSsInputOption = {
	innerText: '',
}
window.readDelimiterTooltip = {
	setAttribute() {
	}
}

window._setHasUnsavedChangesUiIndicator = function () {
}