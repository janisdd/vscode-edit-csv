
function _getById(id) {
	const el = document.getElementById(id)

	if (!el) {
		//TODO warn
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