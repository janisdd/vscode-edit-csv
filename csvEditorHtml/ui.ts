

/* --- common helpers --- */


/**
 * displayed or hides the read options
 * @param shouldCollapse 
 */
function toggleReadOptions(shouldCollapse: boolean) {
	const el = _getById('read-options-icon')
	const content = _getById('read-options-content') //the wrapper

	if (shouldCollapse !== undefined) {
		_setCollapsed(shouldCollapse, el, content)
		return
	}

		_toggleCollapse(el, content)
}

/**
 * displayed or hides the write options
 * @param shouldCollapse 
 */
function toggleWriteOptions(shouldCollapse: boolean) {
	const el = _getById('write-options-icon')
	const content = _getById('write-options-content') //the wrapper

	if (shouldCollapse !== undefined) {
		_setCollapsed(shouldCollapse, el, content)
		return
	}

	_toggleCollapse(el, content)
}

/**
 * displayed or hides the preview
 * @param shouldCollapse 
 */
function togglePreview(shouldCollapse: boolean) {
	const el = _getById('preview-icon')
	const content = _getById('preview-content') //the wrapper

	if (shouldCollapse !== undefined) {
		_setCollapsed(shouldCollapse, el, content)
		return
	}

	_toggleCollapse(el, content)
}

function _toggleCollapse(el: HTMLElement, wrapper: HTMLElement) {

	if (el.classList.contains('fa-chevron-right')) {
		//expand
		_setCollapsed(false, el, wrapper)
		return
	}

	//collapse
	_setCollapsed(true, el, wrapper)
}

function _setCollapsed(shouldCollapsed: boolean, el: HTMLElement, wrapper: HTMLElement) {

	if(shouldCollapsed) {
		el.classList.remove('fa-chevron-down')
		el.classList.add('fa-chevron-right')
		// el.classList.replace( 'fa-chevron-down','fa-chevron-right')
		wrapper.style.display = 'none'
		return
	}

	el.classList.add('fa-chevron-down')
	el.classList.remove('fa-chevron-right')

	// el.classList.replace('fa-chevron-right', 'fa-chevron-down')

	wrapper.style.display = 'block'
}

/* --- read options --- */

function setHasHeader() {
	const el = _getById('has-header') as HTMLInputElement
	const data = getData()

	if (data.length === 0) {
		return
	}

	const elWrite = _getById('has-header-write') as HTMLInputElement

	if (el.checked) {

		//this checked state is set from csvReadOptions._hasHeader

		//use header row from data
		hot.updateSettings({
			colHeaders: data[0].map((col, index) => defaultColHeaderFunc(index, col))
		}, false)

		headerRow = data[0]

		hot.alter('remove_row', 0)

		
		elWrite.checked = true
		return
	}

	//use default headers
	hot.updateSettings({
		colHeaders: defaultColHeaderFunc as any
	}, false)

	hot.alter('insert_row', 0)
	hot.populateFromArray(0, 0, [headerRow])
	elWrite.checked = false

}
function setDelimiterString() {
	const el = _getById('delimiter-string') as HTMLInputElement
	csvReadOptions.delimiter = el.value

}
function setCommentString() {
	const el = _getById('comment-string')  as HTMLInputElement
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
function setReadDelimiter(delimiter: string) {
	const el = _getById('delimiter-string')  as HTMLInputElement
	el.value = delimiter
	csvReadOptions.delimiter = delimiter
}

/* --- write options --- */


function setHasHeaderWrite() {
	const el = _getById('has-header-write') as HTMLInputElement
	csvWriteOptions.header = el.checked
}

function setDelimiterStringWrite() {
	const el = _getById('delimiter-string-write') as HTMLInputElement
	csvWriteOptions.delimiter = el.value
}

function setCommentStringWrite() {
	const el = _getById('comment-string-write') as HTMLInputElement
	csvWriteOptions.comments = el.value === '' ? false : el.value
}

function setNewLineWrite() {
	const el = _getById('newline-select-write') as HTMLInputElement

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
function setWriteDelimiter(delimiter: string) {
	const el = _getById('delimiter-string-write') as HTMLInputElement
	el.value = delimiter
	csvWriteOptions.delimiter = delimiter
}


/* --- preview --- */

/**
 * updates the preview
 */
function generateCsvPreview() {
	const value = getDataAsCsv(csvWriteOptions)
	const el = _getById('csv-preview') as HTMLTextAreaElement
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
function displayData(data: string[][]) {

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

	//@ts-ignore
	hot = new Handsontable(container, {
		data,
		rowHeaders: function(row: number) {
			let text = (row+1).toString()
			return `${text} <span class="remove-row clickable" onclick="removeRow(${row})"><i class="fas fa-trash"></i></span>`
		} as any,
		fillHandle: false,
		colHeaders: defaultColHeaderFunc as any,
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
		//TODO see https://github.com/handsontable/handsontable/issues/3328
		//only working because first argument is actually the old size
		beforeColumnResize: function(oldSize, newSize, isDoubleClick) { //after change but before render
			
			if (allColSizes.length > 0 && isDoubleClick) {
				// const oldSize = allColSizes[currentColumn]

				if (oldSize === newSize) {
					//e.g. we have a large column and the auto size is too large...
					if (miscOptions.doubleClickMinColWidth) {
						return miscOptions.doubleClickMinColWidth
					}
				}
			}
		},
	})

	//@ts-ignore
	Handsontable.dom.addEvent(window as any, 'resize', throttle(onResize, 200))

	checkIfHasHeaderReadOptionIsAvailable()
}

//not needed really now because of bug in handson table, see https://github.com/handsontable/handsontable/issues/3328
//just used to check if we have columns
let allColSizes = []
/**
 * updates the handson table to fill available space (will trigger scrollbars)
 */
function onResize() {
	const widthString = getComputedStyle(csvEditorWrapper).width

	if (!widthString) {
		_error(`could not resize table, width string was null`)
		return
	}

	const width = parseInt(widthString.substring(0, widthString.length-2))

	const heightString = getComputedStyle(csvEditorWrapper).height

	if (!heightString) {
		_error(`could not resize table, height string was null`)
		return
	}

	const height = parseInt(heightString.substring(0, heightString.length-2))

	hot.updateSettings({
		width: width,
		height: height,
	}, false)

	//get all col sizes
	allColSizes = []
	for (let i = 0; i < hot.countCols(); i++) {
		allColSizes.push(hot.getColWidth(i))
	}
	// console.log(allColSizes);
	

}

/**
 * generates the default html wrapper code for the given column name
 * we add a delete icon
 * @param {number} colIndex 
 * @param {string | undefined} colName 
 */
function defaultColHeaderFunc(colIndex: number, colName: string | undefined) {
	let text = getSpreadsheetColumnLabel(colIndex)
	if (colName !== undefined) {
		text = colName
	}
	return `${text} <span class="remove-col clickable" onclick="removeColumn(${colIndex})"><i class="fas fa-trash"></i></span>`
}

/**
 * displays or hides the help modal
 * @param isVisible 
 */
function toggleHelpModal(isVisible: boolean) {
	
	if (isVisible) {
		helModalDiv.classList.add('is-active')
		return
	}
	
	helModalDiv.classList.remove('is-active')
}