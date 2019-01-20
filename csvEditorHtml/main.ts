
declare var acquireVsCodeApi: any
declare var initialContent: string

let vscode: VsExtension | undefined  = undefined 

if (typeof acquireVsCodeApi !== 'undefined') {
	vscode = acquireVsCodeApi()
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

let miscOptions: MiscOptions = {
	doubleClickMinColWidth: 200
}



//csv reader options + some ui options
let csvReadOptions: CsvReadOptions = {
	header: false, //always use false to get an array of arrays
	comments: '#',
	delimiter: '', //auto detect
	newline: '', //auto detect
	quoteChar: '"',
	skipEmptyLines: true,
	dynamicTyping: false,
	_hasHeader: false
}


let csvWriteOptions: CsvWriteOptions = {
	header: false,
	comments: '#',
	delimiter: '', //'' = use from input, will be set from empty to string when exporting (or earlier)
	newline: '', //set by editor
	quoteChar: '"',
}
let newLineFromInput = '\n'

//before csv content
let commentLinesBefore: string[] = []
let commentLinesAfter: string[] = []

const csvEditorWrapper = _getById('csv-editor-wrapper')
const csvEditorDiv = _getById('csv-editor')
const helModalDiv = _getById('help-modal')


/* main */

setCsvReadOptionsInitial(csvReadOptions)
setCsvWriteOptionsInitial(csvWriteOptions)

if (typeof initialContent === 'undefined') {
	var initialContent = ''
}

if (initialContent === undefined) {
	initialContent = ''
}

console.log("initialContent: " + initialContent);

//see readDataAgain
let _data = parseCsv(initialContent, csvReadOptions)
//@ts-ignore
// _data = Handsontable.helper.createSpreadsheetData(100, 20)
displayData(_data)


toggleReadOptions(true)
toggleWriteOptions(true)
togglePreview(true)

onResize();

window.addEventListener('message', (event) => {
	handleVsCodeMessage(event)
})
