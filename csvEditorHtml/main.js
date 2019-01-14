
const csvEditorId = 'csv-editor'
const csv = window.Papa
//handsontable
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
	skipEmptyLines: false,
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
	el2.checked = csvReadOptions.skipEmptyLines

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
		rowHeaders: true,
		fillHandle: false,
		colHeaders: !csvReadOptions._hasHeader ? true : data[0],
		//plugins
		comments: false, //don't know how this is handled
		manualRowMove: true,
		manualRowResize: true,
		manualColumnMove: true,
		manualColumnResize: true,
		columnSorting: true
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

/* --- options --- */
function setHasHeader() {
	const el = _getById('has-header')
	const data = getData()

	if (el.checked) {
		hot.updateSettings({
			colHeaders: data[0]
		})

		headerRow = data[0]

		hot.alter('remove_row', 0)
		return
	}

	hot.updateSettings({
		colHeaders: true
	})

	hot.alter('insert_row', 0)
	hot.populateFromArray(0, 0, [headerRow])

}
function setDelimiterString() {
	const el = _getById('delimiter-string')
	csvReadOptions.delimiter = el.value

}
function setCommentString() {
	const el = _getById('comment-string')
	csvReadOptions.comments = el.value === '' ? false : el.value
}

function setSkipEmptyLines() {
	const el = _getById('skip-empty-lines')
	csvReadOptions.skipEmptyLines = el.checked
}

function _getById(id) {
	const el = document.getElementById(id)

	if (!el) {
		//TODO warn
	}

	return el
}

/* --- END options --- */


function setHasHeaderWrite() {
	const el = _getById('has-header-write')
	csvWriteOptions.header = el.checked
}

function setDelimiterStringWrite() {
	const el = _getById('delimiter-string-write')
	csvWriteOptions.delimiter = el.value
}

function setCommentStringWrite() {
	const el = _getById('comment-string-write')
	csvWriteOptions.comments = el.value === '' ? false : el.value
}

function setNewLineWrite() {
	const el = _getById('newline-select-write')

	if (el.value === '') {
		csvWriteOptions.newline = newLineFromInput
	}
	else if (el.value === 'lf') {
		csvWriteOptions.newline = '\n'
	}
	else if (el.value === 'lf') {
		csvWriteOptions.newline = '\r\n'
	}
}

/* ---- export options  */

function getData() {
	//hot.getSourceData() returns the original data (e.g. not sorted...)
	return hot.getData()
}

function getDataAsCsv() {
	const data = getData()

	if (csvWriteOptions.newline === '') {
		csvWriteOptions.newline = newLineFromInput
	}

	console.log(csvWriteOptions);
	
	let dataAsString = csv.unparse(data, csvWriteOptions)

	console.log(dataAsString)
	if (csvWriteOptions.comments) {

		if (commentLinesBefore.length > 0) {
			for (let i = 0; i < commentLinesBefore.length; i++) {
				commentLinesBefore[i] = csvWriteOptions.comments + commentLinesBefore[i]
			}
			dataAsString = commentLinesBefore.join(csvWriteOptions.newline) + csvWriteOptions.newline + dataAsString
		}
		

		if (commentLinesAfter.length > 0) {
			for (let i = 0; i < commentLinesAfter.length; i++) {
				commentLinesAfter[i] = csvWriteOptions.comments + commentLinesAfter[i]
			}
			dataAsString = dataAsString + csvWriteOptions.newline + commentLinesAfter.join(csvWriteOptions.newline)
		}
		
	}

	return dataAsString
}



/* ---- END export options  */

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
const _data = parseCsv(t1)
displayData(_data)