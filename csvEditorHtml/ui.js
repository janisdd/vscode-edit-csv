
function _getById(id) {
	const el = document.getElementById(id)

	if (!el) {
		_error(`could not find element with id '${id}'`)
		return null
	}

	return el
}

/* --- common helpers --- */


function toggleReadOptions(shouldCollapse) {
	const el = _getById('read-options-icon')
	const content = _getById('read-options-content')

	if (shouldCollapse !== undefined) {
		_setCollapsed(shouldCollapse, el, content)
		return
	}

		_toggleCollapse(el, content)
}

function toggleWriteOptions(shouldCollapse) {
	const el = _getById('write-options-icon')
	const content = _getById('write-options-content')

	if (shouldCollapse !== undefined) {
		_setCollapsed(shouldCollapse, el, content)
		return
	}

	_toggleCollapse(el, content)
}

function togglePreview(shouldCollapse) {
	const el = _getById('preview-icon')
	const content = _getById('preview-content')

	if (shouldCollapse !== undefined) {
		_setCollapsed(shouldCollapse, el, content)
		return
	}

	_toggleCollapse(el, content)
}

function _toggleCollapse(el, content) {

	if (el.classList.contains('fa-chevron-right')) {
		//expand
		_setCollapsed(false, el, content)
		return
	}

	//collapse
	_setCollapsed(true, el, content)
}

function _setCollapsed(shouldCollapsed, el, content) {

	if(shouldCollapsed) {
		el.classList.remove('fa-chevron-down')
		el.classList.add('fa-chevron-right')
		// el.classList.replace( 'fa-chevron-down','fa-chevron-right')
		content.style.display = 'none'
		return
	}

	el.classList.add('fa-chevron-down')
	el.classList.remove('fa-chevron-right')

	// el.classList.replace('fa-chevron-right', 'fa-chevron-down')

	content.style.display = 'block'
}

/* --- read options --- */

function setHasHeader() {
	const el = _getById('has-header')
	const data = getData()

	if (data.length === 0) {
		return
	}

	const elWrite = _getById('has-header-write')

	if (el.checked) {

		//this checked state is set from csvReadOptions._hasHeader

		//use header row from data
		hot.updateSettings({
			colHeaders: data[0].map((col, index) => defaultColHeaderFunc(index, col))
		})

		headerRow = data[0]

		hot.alter('remove_row', 0)

		
		elWrite.checked = true
		return
	}

	//use default headers
	hot.updateSettings({
		colHeaders: defaultColHeaderFunc
	})

	hot.alter('insert_row', 0)
	hot.populateFromArray(0, 0, [headerRow])
	elWrite.checked = false

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
	// const el = _getById('skip-empty-lines')
	// if (el) {
	// 	//currently disabled...
	// 	csvReadOptions.skipEmptyLines = el.checked
	// }
}

/**
 * sets the read delimiter programmatically
 * @param {string} delimiter 
 */
function setReadDelimiter(delimiter) {
	const el = _getById('delimiter-string')
	el.value = delimiter
	csvReadOptions.delimiter = delimiter
}

/* --- write options --- */


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

/**
 * sets the write delimiter programmatically
 * @param {string} delimiter 
 */
function setWriteDelimiter(delimiter) {
	const el = _getById('delimiter-string-write')
	el.value = delimiter
	csvWriteOptions.delimiter = delimiter
}


/* --- preview --- */

/**
 * updates the preview
 */
function generateCsvPreview() {
	const value = getDataAsCsv(csvWriteOptions)
	const el = _getById('csv-preview')
	el.value = value

	//open preview
	togglePreview(false)
}


/* --- other --- */

/**
 * display the given data in the handson table
 * also sets the headerRow if we have more than 
 * @param {string[][]} data array with the rows or null to just destroy the old table
 */
function displayData(data) {

	if (data === null) {
		if (hot) {
			hot.destroy()
		}
		return
	}

	if (data.length > 0) {
		headerRow = data[0]
	}

	const container = csvEditorDiv

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
		colHeaders: defaultColHeaderFunc,
		currentColClassName: 'foo',
		currentRowClassName: 'foo',
		//plugins
		comments: false, //don't know how this is handled
		manualRowMove: true,
		manualRowResize: true,
		manualColumnMove: true,
		manualColumnResize: true,
		columnSorting: true,

		outsideClickDeselects: false, //keep selection
	})

	Handsontable.dom.addEvent(window, 'resize', throttle(onResize, 200))

	checkIfHasHeaderReadOptionIsAvailable()
}

/**
 * updates the handson table to fill available space (will trigger scrollbars)
 */
function onResize() {
	const widthString = getComputedStyle(csvEditorWrapper).width
	const width = parseInt(widthString.substring(0, widthString.length-2))

	const heightString = getComputedStyle(csvEditorWrapper).height
	const height = parseInt(heightString.substring(0, heightString.length-2))

	hot.updateSettings({
		width: width,
		height: height,
	})
}

/**
 * 
 * @param {number} colIndex 
 * @param {string | undefined} colName 
 */
function defaultColHeaderFunc(colIndex, colName) {
	let text = getSpreadsheetColumnLabel(colIndex)
	if (colName !== undefined) {
		text = colName
	}
	return `${text} <span class="remove-col clickable" onclick="removeColumn(${colIndex})"><i class="fas fa-trash"></i></span>`
}

function toggleHelpModal(isVisible) {
	
	if (isVisible) {
		helModalDiv.classList.add('is-active')
		return
	}
	
	helModalDiv.classList.remove('is-active')
}