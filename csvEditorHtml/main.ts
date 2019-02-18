
declare var acquireVsCodeApi: any
declare var initialContent: string
declare var initialConfig: CsvEditSettings | undefined

let vscode: VsExtension | undefined = undefined

if (typeof acquireVsCodeApi !== 'undefined') {
	vscode = acquireVsCodeApi()
}

if (typeof initialConfig === 'undefined') {
	var initialConfig = undefined as CsvEditSettings | undefined
}

const csv: typeof import('papaparse') = (window as any).Papa
//handsontable instance
let hot: import('../node_modules/handsontable/handsontable')

/**
 * the default csv content to used if we get empty content
 * handson table will throw if we pass in a 1D array because it expects an object?
 */
const defaultCsvContentIfEmpty = `,\n,`

/**
 * TODO check
 * stores the header row after initial parse...
 * if we have header rows in data (checked) we set this to the header row
 * if we uncheck header row read option then we use this to insert the header row again as data row
 * can be null if we have 0 rows
 * {string[] | null}
 */
let headerRow: string[] | null = null


//csv reader options + some ui options
let defaultCsvReadOptions: CsvReadOptions = {
	header: false, //always use false to get an array of arrays
	comments: '#',
	delimiter: '', //auto detect
	newline: '', //auto detect
	quoteChar: '"',
	escapeChar: '"',
	skipEmptyLines: true,
	dynamicTyping: false,
	_hasHeader: false,
}


let defaultCsvWriteOptions: CsvWriteOptions = {
	header: false,
	comments: '#',
	delimiter: '', //'' = use from input, will be set from empty to string when exporting (or earlier)
	newline: '', //set by editor
	quoteChar: '"',
	escapeChar: '"',
	quoteAllFields: false,
}
let newLineFromInput = '\n'


const csvEditorWrapper = _getById('csv-editor-wrapper')
const csvEditorDiv = _getById('csv-editor')
const helModalDiv = _getById('help-modal')
const askReadAgainModalDiv = _getById('ask-read-again-modal')

//we store the comments inside the text areas
const beforeCommentsTextareaId = 'comments-before'
const afterCommentsTextareaId = 'comments-after'

const commentsBeforeOptionId = 'comments-before-option'
const commentsAfterOptionId = 'comments-after-option'

const toggleCommentsSectionsButtonId = 'toggle-comments-sections'

const commentsBeforeHasContentDiv = _getById('comments-before-has-content')
const commentsAfterHasContentDiv = _getById('comments-after-has-content')

const readDelimiterTooltip = _getById('read-delimiter-tooltip')
const readDelimiterTooltipText = "Empty to auto detect"


/* main */

setCsvReadOptionsInitial(defaultCsvReadOptions)
setCsvWriteOptionsInitial(defaultCsvWriteOptions)

if (typeof initialContent === 'undefined') {
	var initialContent = ''
}

if (initialContent === undefined) {
	initialContent = ''
}

// initialContent =
// 	`
// #test
// 1,2,3
// 4,5,6,7,8

// `

console.log("initialConfig: ", initialConfig);
console.log("initialContent: " + initialContent);

setupAndApplyInitialConfigPart1(initialConfig)

//see readDataAgain
let _data = parseCsv(initialContent, defaultCsvReadOptions)

if (_data) {
	//@ts-ignore
	// _data = Handsontable.helper.createSpreadsheetData(100, 20)
	displayData(_data[1], _data[0], _data[2])

	setupAndApplyInitialConfigPart2(_data[0], _data[2], initialConfig)
}

if (vscode) {
	console.log(JSON.stringify(vscode.getState()))
}
