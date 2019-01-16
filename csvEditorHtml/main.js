
let vscode

if (typeof acquireVsCodeApi !== 'undefined') {
	vscode = acquireVsCodeApi()
}

const csvEditorId = 'csv-editor'
const csv = window.Papa
//handsontable instance
let hot

/**
 * stores the header row after initial parse...
 * if we have header rows in data (checked) we set this to the header row
 * if we uncheck header row read option then we use this to insert the header row again as data row
 * can be null if we have 0 rows
 * {string[] | null}
 */
let headerRow = null

//csv reader options + some ui options
let csvReadOptions = {
	header: false, //always use false to get an array of arrays
	comments: '#',
	delimiter: '', //auto detect
	newline: '', //auto detect
	quoteChar: '"',
	skipEmptyLines: true, //if false we have invalid rows ... always only 1 col
	dynamicTyping: false,
	//ui props, not part of papaparse options
	_hasHeader: false
}


let csvWriteOptions = {
	header: false,
	comments: '#',
	delimiter: '', //'' = use from input, will be set from empty to string when exporting (or earlier)
	newline: '', //set by editor
	quoteChar: '"',
}
let newLineFromInput = '\n'

//before csv content
let commentLinesBefore = []
let commentLinesAfter = []



/* main */

const t1 =
`#test

#test3
col1, col2, col3
1, test,t2
2, t3, t4

20,,
10,,
9,,
#test2
#test3`

setCsvReadOptionsInitial(csvReadOptions)
setCsvWriteOptionsInitial(csvWriteOptions)
let _data = parseCsv(t1, csvReadOptions)
_data = Handsontable.helper.createSpreadsheetData(100, 100)
displayData(_data)



toggleReadOptions(true)
toggleWriteOptions(true)
togglePreview(true)