

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
