
declare var acquireVsCodeApi: any
declare var initialContent: string
declare var initialConfig: CsvEditSettings | undefined

let vscode: VsExtension | undefined = undefined

if (typeof acquireVsCodeApi !== 'undefined') {
	vscode = acquireVsCodeApi()
}

if (typeof initialConfig === 'undefined') {
	// tslint:disable-next-line:no-duplicate-variable
	var initialConfig = undefined as CsvEditSettings | undefined
}

const csv: typeof import('papaparse') = (window as any).Papa
//handsontable instance
let hot: import('../node_modules/handsontable/handsontable') | null

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
let headerRowWithIndex: HeaderRowWithIndex | null = null

let hiddenPhysicalRowIndices: number[] = []

//csv reader options + some ui options
//this gets overwritten with the real configuration in setCsvReadOptionsInitial
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


//this gets overwritten with the real configuration in setCsvWriteOptionsInitial
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

//we need to store this because for collapsed columns we need to change the selection
//and we need to know if we we need to change the column or not
let lastHandsonMoveWas: 'tab' | 'enter' | null = null

/**
 * true: the cell/row color is changed if the first cell is a comment, (might have negative impact on performance e.g. for large data sets),
 * false: no additional highlighting (comments are still treated as comments)
 */
let highlightCsvComments: boolean = true

const csvEditorWrapper = _getById('csv-editor-wrapper')
const csvEditorDiv = _getById('csv-editor')
const helModalDiv = _getById('help-modal')
const askReadAgainModalDiv = _getById('ask-read-again-modal')

const readDelimiterTooltip = _getById('read-delimiter-tooltip')
const readDelimiterTooltipText = "Empty to auto detect"

const receivedCsvProgBar = _getById('received-csv-prog-bar') as HTMLProgressElement
const receivedCsvProgBarWrapper = _getById('received-csv-prog-bar-wrapper') as HTMLDivElement
const statusInfo = _getById('status-info') as HTMLSpanElement

const showCommentsBtn = _getById('show-comments-btn') as HTMLButtonElement
const hideCommentsBtn = _getById('hide-comments-btn') as HTMLButtonElement

//add this to the first wrong column
const warningTooltipTextWhenCommentRowNotFirstCellIsUsed = `Please use only the first cell in comment row (others are not exported)`


/* main */

//set defaults when we are in browser
setCsvReadOptionsInitial(defaultCsvReadOptions)
setCsvWriteOptionsInitial(defaultCsvWriteOptions)

if (typeof initialContent === 'undefined') {
	// tslint:disable-next-line:no-duplicate-variable
	var initialContent = ''
}

if (initialContent === undefined) {
	initialContent = ''
}

// initialContent = `123,wet
// 4,5`

// initialContent =
// 	`
// #test , wer
// # wetwet
// 1,2,3
// 4,5,6,7,8
// 4,5,6,7,8

// `

if (!vscode) {
	console.log("initialConfig: ", initialConfig);
	console.log("initialContent: " + initialContent);
}

//set values from extension config
setupAndApplyInitialConfigPart1(initialConfig)

//see readDataAgain
let _data = parseCsv(initialContent, defaultCsvReadOptions)

if (_data && !vscode) {
	//@ts-ignore
	// _data = Handsontable.helper.createSpreadsheetData(100, 20)
	displayData(_data, defaultCsvReadOptions)
}

if (vscode) {

	receivedCsvProgBarWrapper.style.display = "block"

	window.addEventListener('message', (e) => {
		handleVsCodeMessage(e)
	})
	_postReadyMessage()
	// console.log(JSON.stringify(vscode.getState()))
}
