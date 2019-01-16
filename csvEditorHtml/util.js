

//partly from handsontable data.js
const COLUMN_LABEL_BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const COLUMN_LABEL_BASE_LENGTH = COLUMN_LABEL_BASE.length;

/**
 * generates column labels: column 1, column 2, ....
 * 
 * OLD: Generates spreadsheet-like column names: A, B, C, ..., Z, AA, AB, etc.
 *
 * @param {Number} index Column index (0 based)
 * @returns {String}
 */
function getSpreadsheetColumnLabel(index) {
	let dividend = index + 1;
	let columnLabel = '';
	let modulo;

	// while (dividend > 0) {
	//   modulo = (dividend - 1) % COLUMN_LABEL_BASE_LENGTH;
	//   columnLabel = String.fromCharCode(65 + modulo) + columnLabel;
	//   dividend = parseInt((dividend - modulo) / COLUMN_LABEL_BASE_LENGTH, 10);
	// }

	return `column ${index}`

	// return columnLabel;
}


/**
 * removes a row by index
 * @param {number} index 
 */
function removeRow(index) {
	hot.alter('remove_row', index)
	checkIfHasHeaderReadOptionIsAvailable()
}

/**
 * removes a column by index
 * @param {number} index 
 */
function removeColumn(index) {
	hot.alter('remove_col', index)
}

/**
 * adds a new row at the end
 * and scrolls to the first col in the new row
 */
function addRow() {

	// const headerCells = hot.getColHeader()
	const numRows = hot.countRows()
	hot.alter('insert_row', numRows) //inserted data contains null but papaparse correctly unparses it as ''
	// hot.populateFromArray(numRows, 0, [headerCells.map(p => '')])
	hot.selectCell(numRows, 0)
	checkIfHasHeaderReadOptionIsAvailable()
}

/**
 * adds a new column at the end
 */
function addColumn() {

	const numCols = hot.countCols()
	hot.alter('insert_col', numCols) //inserted data contains null but papaparse correctly unparses it as ''


	//not working because when we click outside of the table we lose selection...
	// const pos = hot.getSelected() //undefined or [[startRow, startCol, endRow, endCol], ...] (could select not connected cells...)
	// if (pos && pos.length === 1) { //only 1 row selected
	// 	hot.selectCell(pos[0][0], numCols)
	// }
}


/**
 * overwrites a single option
 * warns and returns if the an option name is not found in targetOptions or options
 * @param {*} targetOptions the target options obj
 * @param {*} options the option to take the value from
 * @param {*} optionName the option name
 */
function _setOption(targetOptions, options, optionName) {

	if (options.hasOwnProperty(optionName)) {

		if (targetOptions.hasOwnProperty(optionName) === false) {
			//TODO warn
			return
		}

		targetOptions[optionName] = options[optionName]
	} else {
		//TODO warn
	}
}

/**
 * overwrites the current read options with the given options
 * also updates the ui to display the new options
 * @param {*} options 
 */
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

/**
 * overwrites the current write options with the given options
 * also updates the ui to display the new options
 * @param {*} options 
 */
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
 * parses and displays the given data (csv)
 * @param {string} content 
 */
function readDataAgain(content, csvReadOptions) {
	const _data = parseCsv(content, csvReadOptions)
	displayData(_data)
}


/**
 * checks if the has header read option must be disabled or not
 * and sets the needed state
 */
function checkIfHasHeaderReadOptionIsAvailable() {

	const data = getData()

	const canSetOption = data.length > 0

	const el = _getById('has-header')

	if (canSetOption) {
		el.removeAttribute('disabled')
	} else {
		el.setAttribute('disabled','')
	}
}