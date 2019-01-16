
const csvEditorId = 'csv-editor'
const csv = window.Papa
//handsontable instance
let hot
//used to check if data changed
let lastDisplayedDataString = null

//can be null if we have 0 rows
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

function setCsvReadOptionsInitial(options) {

	const keys = [
		'comments',
		'delimiter',
		'quoteChar',
		'skipEmptyLines',
		'_hasHeader',
	]

	for (const key of keys) {
		_setOption(csvReadOptions, options, key)
	}

	//set ui from (maybe updated) options
	const el1 = _getById('delimiter-string')
	el1.value = csvReadOptions.delimiter


	const el2 = _getById('skip-empty-lines')
	if (el2) {
		//currently disabled...
		el2.checked = csvReadOptions.skipEmptyLines
	}
	

	const el3 = _getById('has-header')
	el3.checked = csvReadOptions._hasHeader

	const el4 = _getById('comment-string')
	el4.value = csvReadOptions.comments

}

function setCsvWriteOptionsInitial(options) {

	const keys = [
		'comments',
		'delimiter',
		'quoteChar',
		'header',
	]

	for (const key of keys) {
		_setOption(csvWriteOptions, options, key)
	}

	//set ui from (maybe updated) options
	const el1 = _getById('has-header-write')
	el1.checked = csvWriteOptions.header

	const el2 = _getById('delimiter-string-write')
	el2.value = csvWriteOptions.delimiter

	const el3 = _getById('comment-string-write')
	el3.value = csvWriteOptions.comments
}

/**
 * 
 * @param {any} options 
 * @param {string} optionName 
 */
function _setOption(targetOptions, options, optionName) {

	if (options.hasOwnProperty(optionName)) {
		targetOptions[optionName] = options[optionName]
	} else {
		//TODO warn
	}
}

/**
 * 
 * @param {string} content 
 */
function parseCsv(content) {

	const parseResult = csv.parse(content, csvReadOptions)

	if (parseResult.errors.length > 0) {
		//TODO display
		return null
	}
	csvWriteOptions.delimiter = parseResult.meta.delimiter
	newLineFromInput = parseResult.meta.linebreak

	if (csvReadOptions.comments) {
		commentLinesBefore = []
		commentLinesAfter = []
		let lines = content.split(newLineFromInput)
		let inBeforeLineRange = true
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];

			if (inBeforeLineRange) {

				if (line.startsWith(csvReadOptions.comments)) {
					commentLinesBefore.push(line.substring(csvReadOptions.comments.length))
					continue
				}

				if (line === '') {
					continue
				}

				inBeforeLineRange = false
			}
			else {

				if (line.startsWith(csvReadOptions.comments)) {
					commentLinesAfter.push(line.substring(csvReadOptions.comments.length))
					continue
				}
			}
		}
	}

	return parseResult.data
}


/**
 * 
 * @param {any[][]} data an array with the rows
 */
function displayData(data) {

	if (data === null) return

	console.log(data);
	if (data.length > 0) {
		headerRow = data[0]
	}

	const container = document.getElementById(csvEditorId)

	if (hot) {
		hot.destroy()
	}

	hot = new Handsontable(container, {
		data,
		rowHeaders: function(row) {
			let text = (row+1).toString()
			return `${text} <span class="remove-row clickable" onclick="removeRow(${row})"><i class="fas fa-trash"></i></span>`
		},
		fillHandle: false,
		colHeaders: function(col) {
			let text = getSpreadsheetColumnLabel(col)
			if (csvReadOptions._hasHeader) {
				text = data[0][col]
			}
			return `${text} <span class="remove-col clickable" onclick="removeColumn(${col})"><i class="fas fa-trash"></i></span>`
		},
		currentColClassName: 'foo',
		currentRowClassName: 'foo',
		//plugins
		comments: false, //don't know how this is handled
		manualRowMove: true,
		manualRowResize: true,
		manualColumnMove: true,
		manualColumnResize: true,
		columnSorting: true,
	})

	lastDisplayedDataString = JSON.stringify(getData())
}


function hasDataChanged() {
	const currentData = getData()

	if (JSON.stringify(currentData) === lastDisplayedDataString) {
		//not changed
		return false
	}
	return true
}

/**
 * 
 * @param {string} content 
 */
function rereadData(content) {

	const hasChanges = hasDataChanged()

	if (hasChanges) {
		//TODO ask...
		console.log('asdasd')
	}

	const _data = parseCsv(content)
	displayData(_data)
}

function updateCsvPreview() {
	const value = getDataAsCsv()
	const el = _getById('csv-preview')
	el.value = value
}

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
setCsvWriteOptionsInitial({ newline: '\n' })
let _data = parseCsv(t1)
_data = Handsontable.helper.createSpreadsheetData(100, 100)
displayData(_data)



toggleReadOptions(true)
toggleWriteOptions(true)
togglePreview(true)