
/**
 * returns the html element with the given id
 * if not found throws and returns null
 * @param id 
 */
function _getById(id: string): HTMLElement {
	const el = document.getElementById(id)

	if (!el) {
		_error(`could not find element with id '${id}'`)
		return null as any
	}

	return el
}

function ensuredSingleCharacterString(el: HTMLInputElement) {

	if (el.value.length > 1) {
		//using last char is more user friendly as we can click and press a key to use the new char
		el.value = el.value.substring(el.value.length - 1)
	}

}

/**
 * checks if a given cell value is a comment with the given configuration
 * @param value
 * @param csvReadConfig
 */
function isCommentCell(value: string | null, csvReadConfig: CsvReadOptions) {

	if (value === null) return false

	if (typeof csvReadConfig.comments === 'string' && csvReadConfig.comments !== '') {
		return value.trimLeft().startsWith(csvReadConfig.comments)
	}

	return false
}

function containAndExtractUrl(text: string): null | UrlInStringCoords[] {
	urlRegex.lastIndex = 0
	//NOT longer needed as we test in the outer functions for http(s):// ...
	//as most cell values will not contain urls we can do a quick check before running the regex
	// if (!urlRegex.test(text)) return null

	urlRegex.lastIndex = 0
	let matches = urlRegex.exec(text)
	if (matches) {
		let urls: UrlInStringCoords[] = []

		while (matches) {
			urls.push({
				url: matches[0],
				startIndex: matches.index,
				endIndex: matches.index + matches[0].length
			})
			matches = urlRegex.exec(text)
		}

		return urls
	}

	return null
}

function createCellValueWithUrlLinks(text: string, urls: UrlInStringCoords[]): (string | HTMLElement)[] {

	const aTags = urls.map(url => {
		const a = document.createElement('a')
		a.href = url.url
		a.innerText = url.url
		a.setAttribute('target', '_blank')
		//not really needed anymore, see https://stackoverflow.com/questions/50709625/link-with-target-blank-and-rel-noopener-noreferrer-still-vulnerable
		//but why not
		a.setAttribute('rel', 'noopener noreferrer')
		a.setAttribute(linkIsOpenableAttribute, '1')
		a.title = `${getOpenLinkModifierTooltopPart()} ${url.url}`
		return a
	})

	let htmlParts: (string | HTMLElement)[] = []

	let currIndex = 0
	for (let i = 0; i < aTags.length; i++) {
		const aTag = aTags[i];
		const urlObj = urls[i]

		if (currIndex < urlObj.startIndex) {
			htmlParts.push(text.substring(currIndex, urlObj.startIndex))
		}

		aTag.addEventListener(`mouseover`, (e) => {
			aTag.classList.add('link-hovered')
			hoveredATag = aTag

			if (isOpenLinkModifierPressed(e)) {
				//if the user presses alt before moving the mouse over the link ... the alt class is not added
				aTag.classList.add(isOpenUrlKeyDownClass)
			}
		})
		aTag.addEventListener(`mouseout`, (e) => {
			aTag.classList.remove('link-hovered')
			aTag.classList.remove(isOpenUrlKeyDownClass)
			hoveredATag = null
		})

		aTag.addEventListener(`click`, (e) => {
			if (isOpenLinkModifierPressed(e)) {
				//let the webview open the url
				return
			}

			//normal click should select the cell or start editing
			e.stopPropagation()
			e.preventDefault()
			return false
		})

		htmlParts.push(aTag)

		currIndex = urlObj.endIndex
	}

	if (currIndex < text.length) {
		htmlParts.push(text.substring(currIndex))
	}

	return htmlParts
}

/**
 * ensures that all rows inside data have the same length
 * @param csvParseResult 
 * @param csvReadConfig 
 */
function _normalizeDataArray(csvParseResult: ExtendedCsvParseResult, csvReadConfig: CsvReadOptions, fillString = '') {


	const maxCols = csvParseResult.data.reduce((prev, curr) => curr.length > prev ? curr.length : prev, 0)

	let someRowWasExpanded = false
	let firstRealRowExpandedWasFound = false

	for (let i = 0; i < csvParseResult.data.length; i++) {
		const row = csvParseResult.data[i];

		//first real row (not a comment)
		//we might need to expand the quote information array
		//this works always because
		//case 1: first real row is the row with max columns --> maxCols === row.length --> we push empty and because of spread operator we don't push anything
		//case 2: first real row has less rows --> row.length < maxCols --> we push
		if (isCommentCell(row[0], csvReadConfig) === false && firstRealRowExpandedWasFound === false) {
			firstRealRowExpandedWasFound = true

			//if the first row is expanded we need to expand the quote information
			if (row.length < maxCols && csvParseResult.columnIsQuoted !== null) {
				csvParseResult.columnIsQuoted.push(...Array.from(Array(maxCols - row.length), (p, index) => newColumnQuoteInformationIsQuoted))
			}
		}

		if (row.length < maxCols) {
			row.push(...Array.from(Array(maxCols - row.length), (p, index) => fillString))

			//comment rows are also expanded...
			//but comment rows only export the first cell so they are not really affect the expanded state
			if (row.length > 0 && isCommentCell(row[0], csvReadConfig) === false) {
				someRowWasExpanded = true
			}
		}

		//because we mutate the array the csv parse result will be changed...
		//papaparse not automatically expands the rows

		//trim cell values to normalize
		// if(trimWhitespace) {
		// 	for (let j = 0; j < row.length; j++) {

		// 		if (row[j] === null || row[j] === undefined) continue

		// 		row[j] = row[j].trim()
		// 	}
		// }

	}

	if (someRowWasExpanded) {
		postSetEditorHasChanges(true)
	}

}

function _resolveInitiallyHiddenColumns(csvParseResult: ExtendedCsvParseResult, csvReadConfig: CsvReadOptions) {


	let firstRealRow: string[] | null = null

	for (let i = 0; i < csvParseResult.data.length; i++) {
		const row = csvParseResult.data[i];

		//first real row (not a comment)
		if (isCommentCell(row[0], csvReadConfig) === false) {
			firstRealRow = row
			break
		}
	}

	initiallyHiddenColumnIndices = []
	if (firstRealRow === null || !initialConfig) return

	//names and indices might map to the same column
	let initiallyHiddenColumnIndicesSet = new Set<number>()

	let _initiallyHiddenColumnNames = initialConfig.initiallyHiddenColumnNames ?? []
	let _initiallyHiddenColumnNumbers = initialConfig.initiallyHiddenColumnNumbers ?? []

	if (_initiallyHiddenColumnNames.length === 0 && _initiallyHiddenColumnNumbers.length === 0) return

	//we could have the same name multiple times in the array
	let colNameToIndicesMap = new Map<string, number[]>()

	for (let i = 0; i < firstRealRow.length; i++) {
		const cell = firstRealRow[i]

		let indicesList = colNameToIndicesMap.get(cell)

		if (indicesList === undefined) {
			indicesList = []
			colNameToIndicesMap.set(cell, indicesList)
		}

		indicesList.push(i)
	}

	for (let i = 0; i < _initiallyHiddenColumnNames.length; i++) {
		const colName = _initiallyHiddenColumnNames[i]

		if (!colNameToIndicesMap.has(colName)) continue

		let indicesToHide = colNameToIndicesMap.get(colName)
		if (indicesToHide) {
			indicesToHide.forEach(index => initiallyHiddenColumnIndicesSet.add(index))
		}
	}

	for (let i = 0; i < _initiallyHiddenColumnNumbers.length; i++) {
		let maybeColNumber = _initiallyHiddenColumnNumbers[i] as number | string //vs code does not enforce numbers, only shows an error

		if (typeof maybeColNumber === 'string') {

			let check = parseInt(maybeColNumber)

			if (isNaN(check)) continue

			maybeColNumber = check
		}

		let colIndex = maybeColNumber - 1 //1 based

		if (colIndex >= 0) {
			initiallyHiddenColumnIndicesSet.add(colIndex)
		}
	}

	initiallyHiddenColumnIndices = Array.from(initiallyHiddenColumnIndicesSet)

	if (initiallyHiddenColumnIndices.length === firstRealRow.length) {
		//we can't hide all columns
		console.warn(`initially hidden columns: all columns are hidden, this is not allowed`)
		initiallyHiddenColumnIndices = []
	}

	// console.log(`initiallyHiddenColumnIndices: ${initiallyHiddenColumnIndices}`)
}

function _hideColumnByIndices(columnIndices: number[]) {
	if (!hot) return

	for (let i = 0; i < columnIndices.length; i++) {
		const targetColIndex = columnIndices[i]

		const physicalColIndex = hot.toPhysicalColumn(targetColIndex)
		hiddenPhysicalColumnIndicesSorted.push(physicalColIndex)

		//after there is no place where the previous manual size is stored, so after showing the col again
		//it will have auto size (for now)
		const manualColumnResizePlugin = hot.getPlugin('manualColumnResize')
		manualColumnResizePlugin.manualColumnWidths[physicalColIndex] = undefined
	}

	hiddenPhysicalColumnIndicesSorted = hiddenPhysicalColumnIndicesSorted.sort()
	firstAndLastVisibleColumns = getFirstAndLastVisibleColumns()

	hot.render()
}

function _unhideAllColumns() {
	if (!hot) return

	//we need to do more here because e.g. on remove col we update the settings and manually set the column widths
	//this means that now the manually set widhts are used (which is still 0.000001 for hidden columns)
	//so, the columns will not be shown again
	//to fix this we need to get the auto calculated widths of the hidden columns and set them manually
	//but only for the hidden columns, else we would reset the manually set widths of the visible columns

	//the main problem with the col widths is, that we don't know if they are currently manual or automatic
	//when removing a column we apply the previous widths, else all widths of all columns right of the removed column changed
	let manualColumnResizePlugin = hot.getPlugin('manualColumnResize')
	for (let i = 0; i < hiddenPhysicalColumnIndicesSorted.length; i++) {
		const visualColIndex = hot.toVisualColumn(hiddenPhysicalColumnIndicesSorted[i])
		manualColumnResizePlugin.clearManualSize(visualColIndex)
	}

	hiddenPhysicalColumnIndicesSorted = []
	firstAndLastVisibleColumns = getFirstAndLastVisibleColumns()
	hot.render()
}

// /**
//  * if we find a comment row merge the cells into one row (else we would need to display additional columns for them)
//  * also for export multiple cells in a comment row is bad because we might need to escape the cells because of spaces... e.g. #"  test  ", aaa
//  * @param data 
//  * @param csvReadConfig 
//  */
// function mergeCommentRowsIntoOneCell(data: string[][], csvReadConfig: CsvReadOptions): void {

// 	for (let i = 0; i < data.length; i++) {
// 		const row = data[i];

// 		if (isCommentCell(row[0], csvReadConfig)) {

// 			data[i] = [row.join(',')]// csv.unparse([row])

// 		}

// 	}

// }

/**
 * returns the rows starting with a comment string
 * if comments are treated as normal rows an empty array is returned
 * @param data 
 * @param csvReadConfig 
 */
function _getCommentIndices(data: string[][], csvReadConfig: CsvReadOptions): number[] {

	if (typeof csvReadConfig.comments !== "string") return []

	let commentIndices: number[] = []

	for (let i = 0; i < data.length; i++) {
		const row = data[i];

		//can be null if we added a new row
		if (row.length > 0 && row[0] !== null && isCommentCell(row[0], csvReadConfig)) {
			commentIndices.push(i)
		}
	}
	return commentIndices
}

/**
 * generates column labels: column 1, column 2, ....
 * @param index 0 based (where 0 will generate label 1 because this is probably more desired)
 */
function getSpreadsheetColumnLabel(index: number) {
	return `column ${index + 1}`
}

//idea from handsontable
const COLUMN_LABEL_BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const COLUMN_LABEL_BASE_LENGTH = COLUMN_LABEL_BASE.length
/**
 * generates spreadsheet-like column names: A, B, C, ..., Z, AA, AB
 * 
 * DO NOT CHANGE THIS !!! IF YOU NEED TO TAKE A LOOK AT THE TESTS IN THE PLUGIN
 * @param {Number} index Column index (starting with 0)
 */
function spreadsheetColumnLetterLabel(index: number) {
	//e.g. we have index 
	/*
	0 --> A
	1 --> B
	...
	25 --> Z
	26 --> AA
	27 --> AB
	...
	2*26-1=51 --> AZ
	52 --> BA
	3*26-1=77 --> BZ
	*/
	let num = index
	let columnLabel = ''

	//see https://stackoverflow.com/questions/34813980/getting-an-array-of-column-names-at-sheetjs
	while (num >= 0) {
		columnLabel = COLUMN_LABEL_BASE[num % 26] + columnLabel //this will cover the last "bit" in range 0-25 so we get the last letter
		num = Math.floor(num / 26) - 1 //e.g. 27 would get us 27/26 = 1 but this is actually AB so we do -1
		//e.g. 52 -> first (right) letter is A, 52 / 26 = 2 --> 2-1 = 1 = B --> BA
		//so this works only because the number is not changed before getting the first letter
	}
	return columnLabel
}
//this is ~ 2x slower because of parseInt (and maybe a bit more because of String.fromCharCode)
//this is the original from handson table
// function spreadsheetColumnLabel(index: number): string {
//   let dividend = index + 1
//   let columnLabel = ''
//   let modulo

//   while (dividend > 0) {
//     modulo = (dividend - 1) % COLUMN_LABEL_BASE_LENGTH;
//     columnLabel = String.fromCharCode(65 + modulo) + columnLabel;
//     dividend = parseInt((dividend - modulo) / COLUMN_LABEL_BASE_LENGTH, 10);
//   }

//   return columnLabel;
// }

/**
 * adds a new column at the end
 * @param {boolean} selectNewColumn true: scrolls to the new column
 */
function addColumn(selectNewColumn = true) {

	if (!hot) throw new Error('table was null')

	const numCols = hot.countCols()
	hot.alter('insert_col', numCols) //inserted data contains null but papaparse correctly unparses it as ''

	//in hooks we insert a null column in the header

	//we could get 0 cols...
	checkIfHasHeaderReadOptionIsAvailable(false)

	const pos = hot.getSelected() //undefined or [[startRow, startCol, endRow, endCol], ...] (could select not connected cells...)
	if (pos && pos.length === 1) { //only 1 row selected

		if (selectNewColumn) {
			hot.selectCell(pos[0][0], numCols)
		}
	}
}

/**
 * adds a new row at the end
 * @param {boolean} selectNewRow true: scrolls to the  new row
 */
function addRow(selectNewRow = true) {

	if (!hot) throw new Error('table was null')

	// const headerCells = hot.getColHeader()
	const numRows = hot.countRows()
	hot.alter('insert_row', numRows) //inserted data contains null but papaparse correctly unparses it as ''
	// hot.populateFromArray(numRows, 0, [headerCells.map(p => '')])

	firstAndLastVisibleRows = getFirstAndLastVisibleRows()

	if (selectNewRow) {
		hot.selectCell(numRows, 0)
	}

	checkAutoApplyHasHeader()
}

/**
 * returns the visual start row index of the first selection range
 * the index is the visual one seen in the ui (e.g. changed when we reorder rows)
 */
function _getSelectedVisualRowIndex(): number | null {

	if (!hot) throw new Error('table was null')

	const selections = hot.getSelected()
	if (!selections?.length) return null

	const firstSelection = selections[0]
	const rowIndex = firstSelection[0] //start row
	return rowIndex
}

/**
 * returns the visual start col index of the first selection range
 * the index is the visual one seen in the ui (e.g. changed when we reorder rows)
 */
function _getSelectedVisualColIndex(): number | null {

	if (!hot) throw new Error('table was null')

	const selections = hot.getSelected()
	if (!selections?.length) return null

	const firstSelection = selections[0]
	const rowIndex = firstSelection[1] //start row
	return rowIndex
}

/**
 * adds a new row above the current row
 */
function insertRowAbove() {

	if (isReadonlyMode) return

	_insertRowInternal(false)
}
/**
 * adds a new row below the current row
 */
function insertRowBelow() {

	if (isReadonlyMode) return

	_insertRowInternal(true)
}

function _insertRowInternal(belowCurrRow: boolean) {
	if (!hot) throw new Error('table was null')

	const currRowIndex = _getSelectedVisualRowIndex()
	const currColIndex = _getSelectedVisualColIndex()
	if (currRowIndex === null || currColIndex === null) return

	const targetRowIndex = currRowIndex + (belowCurrRow ? 1 : 0)
	// const test = hot.toPhysicalRow(targetRowIndex) //also not working when rows are reordered...
	hot.alter('insert_row', targetRowIndex)

	//undefined should not happen but just in case
	const focusBehavior = initialConfig?.insertRowBehavior ?? 'focusFirstCellNewRow'

	switch (focusBehavior) {
		case 'focusFirstCellNewRow': {
			//new row, first cell
			hot.selectCell(targetRowIndex, 0)
			break;
		}
		case 'keepRowKeepColumn': {
			//before insert row, same column
			hot.selectCell(targetRowIndex + (belowCurrRow ? -1 : 1), currColIndex)
			break;
		}
		default: notExhaustiveSwitch(focusBehavior)
	}

	checkAutoApplyHasHeader()
}

/**
 * adds a new row above the current row
 */
function insertColLeft(selectNewCol = true, preserveSelectedRow = true) {

	if (isReadonlyMode) return

	_insertColInternal(false)
}
/**
 * adds a new col below the current row
 */
function insertColRight(selectNewCol = true, preserveSelectedRow = true) {

	if (isReadonlyMode) return

	_insertColInternal(true)
}

function _insertColInternal(afterCurrCol: boolean) {
	if (!hot) throw new Error('table was null')

	const currColIndex = _getSelectedVisualColIndex()
	const currRowIndex = _getSelectedVisualRowIndex()
	if (currRowIndex === null || currColIndex === null) return

	const targetColIndex = currColIndex + (afterCurrCol ? 1 : 0)
	// const test = hot.toPhysicalColumn(targetColIndex) //also not working when columns are reordered...
	hot.alter('insert_col', targetColIndex)

	//undefined should not happen but just in case
	const focusBehavior = initialConfig?.insertColBehavior ?? 'keepRowKeepColumn'

	switch (focusBehavior) {
		case 'keepRowFocusNewColumn': {
			//new row, first cell
			hot.selectCell(currRowIndex, targetColIndex)
			break;
		}
		case 'keepRowKeepColumn': {
			//before insert row, same column
			hot.selectCell(currRowIndex, targetColIndex + (afterCurrCol ? -1 : 1))
			break;
		}
		default: notExhaustiveSwitch(focusBehavior)
	}
}

function getIsCallRemoveRowContextMenuActionDisabled(): boolean {

	if (isReadonlyMode) return true

	const selection = hot!.getSelected()
	let allRowsAreSelected = false
	if (selection) {
		const selectedRowsCount = Math.abs(selection[0][0] - selection[0][2]) //starts at 0 --> +1
		allRowsAreSelected = hot!.countRows() === selectedRowsCount + 1
	}

	return hot!.countRows() === 1 || allRowsAreSelected
}

/**
 * different than {@link removeRow} because this can remove whole ranges (also not contiguous)
 */
function pretendRemoveRowContextMenuActionClicked() {

	if (!hot) return

	let isMenuActionDisabled = getIsCallRemoveRowContextMenuActionDisabled()

	if (isMenuActionDisabled) return

	const activeEditor = hot.getActiveEditor() as any
	//this is needed because current shortcut (ctrl+shift+alt+-) will insert dash in the cell
	if (activeEditor && activeEditor.isOpened()) {
		activeEditor.finishEditing(true) //true reverses the changes (does not interact with the undo stack)
		activeEditor.close()
	}

	// setTimeout(() => { //not needed active editor is closed immediately (dash insert is fixed even without this)

	const currRowIndex = _getSelectedVisualRowIndex()

	if (currRowIndex === null) return

	//copied from context menu remove row action
	const selRanges = hot!.getSelectedRange()
	// function normalizeSelection(selRanges) {
	// 	return (0, _array.arrayMap)(selRanges, function (range) {
	// 		return {
	// 			start: range.getTopLeftCorner(),
	// 			end: range.getBottomRightCorner()
	// 		};
	// 	});
	// }
	const normalizedSelection = selRanges
		? selRanges.map(range => ({
			start: (range as any).getTopLeftCorner(),
			end: (range as any).getBottomRightCorner(),
		}))
		: [];

	//actual context menu also passes mouse event, but we don't need it here
	hot!.getPlugin('contextMenu')?.executeCommand('remove_row', normalizedSelection)
	// }, 0)

}

/**
 * removes a row by index
 * @param {number} index 0 based
 */
function removeRow(index: number) {

	if (isReadonlyMode) return

	if (!hot) throw new Error('table was null')

	hot.alter('remove_row', index)
	checkIfHasHeaderReadOptionIsAvailable(false)
}

/**
 * removes a column by index
 * @param {number} index the visual column index
 */
function removeColumn(index: number) {

	if (isReadonlyMode) return

	if (!hot) throw new Error('table was null')

	hot.alter('remove_col', index)

	//keep header in sync with the number of columns
	//this is done in the hooks

	//we could get 0 cols...
	checkIfHasHeaderReadOptionIsAvailable(false)

}


/**
 * called on every render...
 * so we only need to add the css rule and never remove it
 * @param instance 
 * @param td 
 * @param row 
 * @param col 
 * @param prop 
 * @param value 
 * @param cellProperties 
 */
function commentValueAndUrlsRenderer(instance: Handsontable, td: HTMLTableDataCellElement, row: number, col: number, prop: any, value: string | null, cellProperties: any) {

	let isCellWithUrls = initialConfig?.convertUrlsToLinkTags
		? value && (value.indexOf("http://") >= 0 || value.indexOf("https://") >= 0) // a faster check than regex
		: false

	if (isCellWithUrls) {
		const urls = containAndExtractUrl(value!)

		if (urls !== null) {
			const htmlParts = createCellValueWithUrlLinks(value!, urls)
			Handsontable.dom.empty(td)
			td.append(...htmlParts)
		}

		//this applied css classes to the cell
		//@ts-ignore
		Handsontable.renderers.BaseRenderer.apply(this, arguments);

	} else {
		//cell has no urls
		//@ts-ignore
		Handsontable.renderers.TextRenderer.apply(this, arguments);
	}

	if (highlightCsvComments) {
		if (value !== null && col === 0 && isCommentCell(value, defaultCsvReadOptions)) {
			// td.classList.add('comment-row')
			if (td && td.nextSibling) {
				(td.nextSibling as HTMLElement).title = warningTooltipTextWhenCommentRowNotFirstCellIsUsed;
			}

			//make the whole row a comment
			if (td && td.parentElement) {
				td.parentElement.classList.add('comment-row')
			}
		}
	}

	if (isCellWithUrls) {
		return td
	}
}

(Handsontable.renderers as any).registerRenderer('commentValueAndUrlsRenderer', commentValueAndUrlsRenderer);

// function invisiblesCellValueRenderer(instance: Handsontable, td: HTMLTableDataCellElement, row: number, col: number, prop: any, value: string | null, cellProperties: any) {
// 	//@ts-ignore
// 	const val = Handsontable.helper.stringify(value);

// 	console.log(value)

// 	td.innerText = val.replace(/\ /g, '·').replace(/\	/g, '⇥')

// 	return td
// }

// (Handsontable.renderers as any).registerRenderer('invisiblesCellValueRenderer', invisiblesCellValueRenderer);

/**
 * overwrites a single option
 * warns and returns if the an option name is not found in targetOptions or options
 * @param {*} targetOptions the target options obj
 * @param {*} options the option to take the value from
 * @param {*} optionName the option name
 */
function _setOption<T extends {}>(targetOptions: T, options: T, optionName: keyof T & string) {

	if (options.hasOwnProperty(optionName)) {

		if (targetOptions.hasOwnProperty(optionName) === false) {
			_error(`target options object has not property '${String(optionName)}'`)
			return
		}

		targetOptions[optionName] = options[optionName]
	} else {
		_error(`options object has not property '${String(optionName)}'`)
	}
}

/**
 * overwrites the current read options with the given options
 * also updates the ui to display the new options
 * @param {*} options 
 */
function setCsvReadOptionsInitial(options: CsvReadOptions) {

	const keys = Object.keys(defaultCsvReadOptions)

	for (const key of keys) {
		_setOption(defaultCsvReadOptions, options, key as keyof CsvReadOptions)
	}

	//set ui from (maybe updated) options
	const el1 = _getById('delimiter-string') as HTMLInputElement
	el1.value = defaultCsvReadOptions.delimiter


	//disabled
	// const el2 = _getById('skip-empty-lines')
	// if (el2) {
	// 	//currently disabled...
	// 	el2.checked = csvReadOptions.skipEmptyLines
	// }

	const el3 = _getById('has-header') as HTMLInputElement
	el3.checked = defaultCsvReadOptions._hasHeader

	const el4 = _getById('comment-string') as HTMLInputElement
	el4.value = defaultCsvReadOptions.comments === false ? '' : defaultCsvReadOptions.comments

	const el5 = _getById('quote-char-string') as HTMLInputElement
	el5.value = defaultCsvReadOptions.quoteChar

	const el6 = _getById('escape-char-string') as HTMLInputElement
	el6.value = defaultCsvReadOptions.escapeChar
}

/**
 * overwrites the current write options with the given options
 * also updates the ui to display the new options
 * @param {*} options 
 */
function setCsvWriteOptionsInitial(options: CsvWriteOptions) {

	const keys = Object.keys(defaultCsvWriteOptions)

	for (const key of keys) {
		_setOption(defaultCsvWriteOptions, options, key as keyof CsvWriteOptions)
	}

	//set ui from (maybe updated) options
	const el1 = _getById('has-header-write') as HTMLInputElement
	el1.checked = defaultCsvWriteOptions.header

	const el2 = _getById('delimiter-string-write') as HTMLInputElement
	el2.value = defaultCsvWriteOptions.delimiter

	const el3 = _getById('comment-string-write') as HTMLInputElement
	el3.value = defaultCsvWriteOptions.comments === false ? '' : defaultCsvWriteOptions.comments

	const el4 = _getById('quote-char-string-write') as HTMLInputElement
	el4.value = defaultCsvWriteOptions.quoteChar

	const el5 = _getById('escape-char-string-write') as HTMLInputElement
	el5.value = defaultCsvWriteOptions.quoteChar

	const el6 = _getById('quote-all-fields-write') as HTMLInputElement
	el6.checked = defaultCsvWriteOptions.quoteAllFields
}

/**
 * checks if the has header read option must be disabled or not
 * and sets the needed state
 * 
 * if has header option is available (when we have enough data rows) we also check 
 * {@link headerRowWithIndex} if we have only comment rows
 * 
 * see https://forum.handsontable.com/t/table-with-only-header-row/2915 and
 * and https://github.com/handsontable/handsontable/issues/735
 * seems like with default headers it's not possible to only have headers?
 * @returns false: force changes (settings want headers but is not possible with data), true: all ok
 */
function checkIfHasHeaderReadOptionIsAvailable(isInitialRender: boolean): boolean {

	const data = getData() //this also includes header rows

	const el = hasHeaderReadOptionInput

	let canSetOption = false

	if (isInitialRender) {
		canSetOption = data.length > 1
	}
	else {
		if (defaultCsvReadOptions._hasHeader) {
			canSetOption = data.length >= 1 //we already stored the header row so we have data + 1 rows...
		} else {
			canSetOption = data.length > 1 //no header ... to enable header we need 2 rows
		}
	}

	if (canSetOption) {
		//but we could have only comments --> no header available
		const firstRow = getFirstRowWithIndex()
		if (firstRow === null && !el.checked) { //if el.checked is true then we already have a header row...
			canSetOption = false
		}
	}

	if (canSetOption) {
		// el.removeAttribute('disabled')

	} else {
		// el.setAttribute('disabled', '')

		defaultCsvReadOptions._hasHeader = false
		el.checked = false
		return false
	}

	return true
}

//from https://stackoverflow.com/questions/27078285/simple-throttle-in-js ... from underscore
function throttle(func: Function, wait: number) {
	var context: any, args: any, result: any;
	var timeout: any = null;
	var previous = 0;
	var later = function () {
		previous = Date.now();
		timeout = null;
		result = func.apply(context, args);
		if (!timeout) context = args = null;
	};
	return function (this: any) {
		var now = Date.now();
		var remaining = wait - (now - previous);
		context = this;
		args = arguments;
		if (remaining <= 0 || remaining > wait) {
			if (timeout) {
				clearTimeout(timeout);
				timeout = null;
			}
			previous = now;
			result = func.apply(context, args);
			if (!timeout) context = args = null;
		} else if (!timeout) {
			timeout = setTimeout(later, remaining);
		}
		return result
	}
}

//from https://davidwalsh.name/javascript-debounce-function
function debounce(func: Function, wait: number, immediate = false) {
	var timeout: any;
	return function (this: any) {
		var context = this, args = arguments;
		var later = function () {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}

function _error(text: string) {
	postVsError(text)
	throw new Error(text)
}

/**
 * apply the first part of the settings from initialConfig, called before parsing data
 * some options have impact e.g. on how to parse the data...
 * some options depend on the state after parse ... e.g. has before/after comments?
 */
function setupAndApplyInitialConfigPart1(initialConfig: EditCsvConfig | undefined, initialVars: InitialVars) {


	//first apply the initial vars
	{
		_setIsWatchingSourceFileUiIndicator(initialVars.isWatchingSourceFile)
	}


	if (initialConfig === undefined) {

		//probably in browser here...

		toggleOptionsBar(true)

		showCommentsBtn.style.display = 'none'
		hideCommentsBtn.style.display = ''

		return
	}

	highlightCsvComments = initialConfig.highlightCsvComments
	enableWrapping = initialConfig.enableWrapping
	initialColumnWidth = initialConfig.initialColumnWidth
	newColumnQuoteInformationIsQuoted = initialConfig.newColumnQuoteInformationIsQuoted
	fixedRowsTop = Math.max(initialConfig.initiallyFixedRowsTop, 0)
	fixedColumnsLeft = Math.max(initialConfig.initiallyFixedColumnsLeft, 0)
	disableBorders = initialConfig.disableBorders

	if (disableBorders) {
		const style = document.createElement('style');
		style.type = 'text/css';
		style.innerHTML = `.vscode-dark td, th { border: 0px !important; }`;
		document.getElementsByTagName('head')[0].appendChild(style);
	}

	changeFontSizeInPx(initialConfig.fontSizeInPx)

	//apply settings from extension

	const copyReadOptions = {
		...defaultCsvReadOptions
	}

	let _readOption_hasHeader = initialConfig.readOption_hasHeader === 'true' ? true : false

	if (_readOption_hasHeader) {
		isFirstHasHeaderChangedEvent = true
	} else {
		//when this is not initially set then we don't want to clear the undo after we enabled this option
		isFirstHasHeaderChangedEvent = false
	}

	setCsvReadOptionsInitial({
		...copyReadOptions,
		delimiter: initialConfig.readOption_delimiter,
		delimitersToGuess: initialConfig.readOption_delimitersToGuess,
		comments: initialConfig.readOption_comment,
		_hasHeader: _readOption_hasHeader,
		escapeChar: initialConfig.readOption_escapeChar,
		quoteChar: initialConfig.readOption_quoteChar,
	})

	const copyWriteOptions = {
		...defaultCsvReadOptions
	}

	setCsvWriteOptionsInitial({
		...copyWriteOptions,
		comments: initialConfig.writeOption_comment,
		delimiter: initialConfig.writeOption_delimiter,
		header: initialConfig.writeOption_hasHeader === 'true' ? true : false,
		escapeChar: initialConfig.writeOption_escapeChar,
		quoteChar: initialConfig.writeOption_quoteChar,
		quoteAllFields: initialConfig.quoteAllFields,
		retainQuoteInformation: initialConfig.retainQuoteInformation,
		quoteEmptyOrNullFields: initialConfig.quoteEmptyOrNullFields === 'true' ? true : false,
	})

	switch (initialConfig.optionsBarAppearance) {
		case 'expanded': {
			toggleOptionsBar(false)
			break
		}
		case 'collapsed': {
			toggleOptionsBar(true)
			break
		}
		// case 'remember': {
		// 	toggleOptionsBar(true)
		// 	break
		// }
		default: {
			_error(`unknown optionsBarAppearance: ${initialConfig.optionsBarAppearance}`)
			notExhaustiveSwitch(initialConfig.optionsBarAppearance)
			break;
		}
	}

	if (initialConfig.initiallyHideComments) {
		showCommentsBtn.style.display = ''
		hideCommentsBtn.style.display = 'none'
	}
	else {
		showCommentsBtn.style.display = 'none'
		hideCommentsBtn.style.display = ''
	}

	//--- other options
	fixedRowsTopInfoSpan.innerText = fixedRowsTop + ''
	fixedColumnsTopInfoSpan.innerText = fixedColumnsLeft + ''

	isReadonlyMode = initialConfig.initiallyIsInReadonlyMode
	_updateToggleReadonlyModeUi()

	setNumbersStyleUi(initialConfig.initialNumbersStyle)

	//iterate document.styleSheets
	for (let i = 0; i < document.styleSheets.length; i++) {
		const styleSheet = document.styleSheets[i];

		//only use dark.css and light.css because there is our prop we need to change
		if (!styleSheet.href?.toLowerCase().endsWith(`dark.css`) &&
			!styleSheet.href?.toLowerCase().endsWith(`light.css`)) continue

		// console.log(`styleSheet.href: ${styleSheet.href}`)

		//iterate cssRules
		for (let j = 0; j < styleSheet.cssRules.length; j++) {
			const cssRule = styleSheet.cssRules[j]

			if (cssRule instanceof CSSStyleRule) {
				const cssStyleRule = cssRule as CSSStyleRule

				if (cssStyleRule.selectorText === `body.vscode-light`) {
					cssStyleRule.style.setProperty(cssFgColorVariableName, initialConfig.lightThemeTextColor)
				}

				if (cssStyleRule.selectorText === `body.vscode-dark`) {
					cssStyleRule.style.setProperty(cssFgColorVariableName, initialConfig.darkThemeTextColor)
				}
			}
		}
	}
}


/* - maybe we get the collapse states and store them across sessions see
CsvEditSettings
 .readOptionsAppearance: remember option
 .writeOptionsAppearance: remember option
 .previewOptionsAppearance: remember option
 --- */

function _getVsState(): VsState {
	if (!vscode) return _createDefaultVsState()
	const state = vscode.getState()

	if (!state) return _createDefaultVsState()

	return state
}
function _createDefaultVsState(): VsState {
	return {
		previewIsCollapsed: true,
		readOptionIsCollapsed: true,
		writeOptionIsCollapsed: true
	}
}

function _setReadOptionCollapsedVsState(isCollapsed: boolean) {
	if (vscode) {
		// const lastState = _getVsState()
		// const newState = {
		// 	...lastState,
		// 	readOptionIsCollapsed: isCollapsed
		// }
		// console.log(JSON.stringify(newState));
		// vscode.setState(newState)
	}
}

function _setWriteOptionCollapsedVsState(isCollapsed: boolean) {
	if (vscode) {
		// const lastState = _getVsState()
		// const newState: VsState = {
		// 	...lastState,
		// 	writeOptionIsCollapsed: isCollapsed
		// }
		// vscode.setState(newState)
	}
}

function _setPreviewCollapsedVsState(isCollapsed: boolean) {
	if (vscode) {
		// const lastState = _getVsState()
		// const newState: VsState = {
		// 	...lastState,
		// 	previewIsCollapsed: isCollapsed
		// }
		// vscode.setState(newState)
	}
}

/**
 * a custom search method for the table
 * @param query 
 * @param value 
 */
function customSearchMethod(query: string | undefined | null, value: string | undefined | null): boolean {

	if (query === null || query === undefined || value === null || value === undefined) return false

	if (query === '') return false


	if (!findWidgetInstance.findOptionMatchCaseCache) {
		value = value.toLowerCase()
		query = query.toLowerCase()
	}

	if (findWidgetInstance.findOptionTrimCellCache) {
		value = value.trim()
	}

	if (findWidgetInstance.findOptionUseRegexCache) {

		if (findWidgetInstance.findWidgetCurrRegex === null) {
			throw new Error('should not happen...')
		}

		//this is needed when we use the global flag and we call exec on the same regex instance
		// findWidgetInstance.findWidgetCurrRegex.lastIndex = 0
		let result = findWidgetInstance.findWidgetCurrRegex.exec(value)

		if (findWidgetInstance.findOptionMatchWholeCellCache) {
			if (result !== null && result.length > 0) {
				return result[0] === value
			}
		}

		return result !== null

	} else {

		if (findWidgetInstance.findOptionMatchWholeCellCache) {
			return value === query
		}

		return value.indexOf(query) !== -1
	}
}

//taken from https://github.com/MikeMcl/big.js/blob/master/big.js
// const numberRegex = /-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?/
function afterHandsontableCreated(hot: Handsontable) {

	/**
	 * @param row Selection start visual row index.
	 * @param column Selection start visual column index.
	 * @param row2 Selection end visual row index.
	 * @param column2 Selection end visual column index.
	 */
	const afterSelectionHandler = (row: number, column: number, row2: number, column2: number) => {

		if (getIsSidePanelCollapsed()) {
			//not update stats (might be costly and we don't display stats anyway)
		} else {
			calculateStats(row, column, row2, column2)
		}
	}

	hot.addHook('afterSelection', afterSelectionHandler as any)

	const afterRowOrColsCountChangeHandler = () => {
		statRowsCount.innerText = `${hot.countRows()}`
		statColsCount.innerText = `${hot.countCols()}`
	}

	hot.addHook('afterRemoveRow', afterRowOrColsCountChangeHandler)
	hot.addHook('afterCreateRow', afterRowOrColsCountChangeHandler)
	hot.addHook('afterCreateCol', afterRowOrColsCountChangeHandler)
	hot.addHook('afterRemoveCol', afterRowOrColsCountChangeHandler)

	statSelectedRows.innerText = `${0}`
	statSelectedCols.innerText = `${0}`
	statSelectedNotEmptyCells.innerText = `${0}`
	statSumOfNumbers.innerText = `${0}`
	statSelectedCellsCount.innerText = `${0}`
	statRowsCount.innerText = `${hot.countRows()}`
	statColsCount.innerText = `${hot.countCols()}`
}

/**
 * recalculates the stats (even if they are not visible)
 */
function recalculateStats() {
	const selectedRanges = hot!.getSelected()

	if (!selectedRanges) return

	const firstRange = selectedRanges[0]

	calculateStats(...firstRange)
}

/**
 * the stats calculation func
 * @param row 
 * @param column 
 * @param row2 
 * @param column2 
 */
function _calculateStats(row: number, column: number, row2: number, column2: number) {

	let numbersStyleToUse = getNumbersStyleFromUi()
	let rowsCount = Math.abs(row2 - row) + 1
	let colsCount = Math.abs(column2 - column) + 1
	statSelectedRows.innerText = `${rowsCount}`
	// statSelectedNotEmptyRows
	statSelectedCols.innerText = `${colsCount}`
	// statSelectedNotEmptyCols
	statSelectedCellsCount.innerText = `${rowsCount * colsCount}`

	//could be improved when we iterate over cols when we have less cols than rows??
	let notEmptyCount = 0
	let numbersSum = Big(0)
	let containsInvalidNumbers = false
	let minR = Math.min(row, row2)
	let maxR = Math.max(row, row2)
	for (let index = minR; index <= maxR; index++) {
		const data = hot!.getDataAtRow(index)

		let minC = Math.min(column, column2)
		let maxC = Math.max(column, column2)

		for (let i = minC; i <= maxC; i++) {
			const el = data[i]

			if (el !== '' && el !== null) {
				notEmptyCount++

				if (!containsInvalidNumbers) {

					const firstCanonicalNumberStringInCell = getFirstCanonicalNumberStringInCell(el, numbersStyleToUse)

					if (firstCanonicalNumberStringInCell === null) continue

					try {
						let _num = Big(firstCanonicalNumberStringInCell)
						numbersSum = numbersSum.plus(_num)
					} catch (error) {
						console.warn(`could not create or add number to statSumOfNumbers at row: ${index}, col: ${i}`, error)
						containsInvalidNumbers = true
					}
				}
			}
		}
	}

	statSelectedNotEmptyCells.innerText = `${notEmptyCount}`
	statSumOfNumbers.innerText = containsInvalidNumbers
		? `Some invalid num`
		: `${formatBigJsNumber(numbersSum, numbersStyleToUse)}`

}

const calculateStats = throttle(_calculateStats, 300) as typeof _calculateStats


/**
 * returns the first number string in the cell value
 */
function getFirstCanonicalNumberStringInCell(cellValue: string, numbersStyle: NumbersStyle): string | null {

	// let thousandSeparatorsMatches = numbersStyle.thousandSeparatorReplaceRegex.exec(cellValue)

	let cellContent = cellValue

	let thousandSeparatorsMatches
	while (thousandSeparatorsMatches = numbersStyle.thousandSeparatorReplaceRegex.exec(cellValue)) {

		let replaceContent = thousandSeparatorsMatches[0].replace(numbersStyle.thousandSeparator, '')
		cellContent = cellContent.replace(thousandSeparatorsMatches[0], replaceContent)
	}

	let numberRegexRes = numbersStyle.regex.exec(cellContent)

	if (!numberRegexRes || numberRegexRes.length === 0) return null

	//this not longer has thousand separators...
	//big js only accepts numbers in en format (3.14)
	return numberRegexRes[0].replace(/\,/gm, '.')
}

const knownNumberStylesMap: KnownNumberStylesMap = {
	"en": {
		key: 'en',
		/**
		 * this allows:
		 * 0(000)
		 * 0(000).0(000)
		 * .0(000)
		 * all repeated with - in front (negative numbers)
		 * all repeated with e0(000) | e+0(000) | e-0(000)
		 */
		regex: /-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?/,
		regexStartToEnd: /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/,
		thousandSeparator: /(\,| )/gm,
		thousandSeparatorReplaceRegex: /((\,| )\d{3})+/gm
	},
	"non-en": {
		key: 'non-en',
		/**
		 * this allows:
		 * 0(000)
		 * 0(000),0(000)
		 * ,0(000)
		 * all repeated with - in front (negative numbers)
		 * all repeated with e0(000) | e+0(000) | e-0(000)
		 */
		regex: /-?(\d+(\,\d*)?|\,\d+)(e[+-]?\d+)?/,
		regexStartToEnd: /^-?(\d+(\,\d*)?|\,\d+)(e[+-]?\d+)?$/,
		thousandSeparator: /(\.| )/gm,
		thousandSeparatorReplaceRegex: /((\.| )\d{3})+/gm
	}
}

/**
 * sets the number style ui from the given nubmer style
 */
function setNumbersStyleUi(numbersStyleToUse: EditCsvConfig["initialNumbersStyle"]) {

	numbersStyleEnRadio.checked = false
	numbersStyleNonEnRadio.checked = false
	numbersStyleEnRadio.removeAttribute('checked')
	numbersStyleEnRadio.removeAttribute('checked')

	switch (numbersStyleToUse) {
		case 'en': {
			numbersStyleEnRadio.checked = true
			numbersStyleEnRadio.setAttribute('checked', 'true')
			break
		}

		case 'non-en': {
			numbersStyleNonEnRadio.checked = true
			numbersStyleNonEnRadio.setAttribute('checked', 'true')
			break
		}

		default:
			notExhaustiveSwitch(numbersStyleToUse)
	}
}

/**
 * returns the number style from the ui
 */
function getNumbersStyleFromUi(): NumbersStyle {


	if (numbersStyleEnRadio.checked) return knownNumberStylesMap['en']

	if (numbersStyleNonEnRadio.checked) return knownNumberStylesMap['non-en']

	postVsWarning(`Got unknown numbers style from ui, defaulting to 'en'`)

	return knownNumberStylesMap['en']
}

//don't know how to type this properly without typeof ...
const b = new Big(1)
function formatBigJsNumber(bigJsNumber: typeof b, numbersStyleToUse: NumbersStyle): string {

	switch (numbersStyleToUse.key) {
		case 'en': {

			//@ts-ignore
			bigJsNumber.format = {
				decimalSeparator: '.',
				groupSeparator: '', //TODO or maybe whitespace?
			}
			break
		}
		case 'non-en': {
			//@ts-ignore
			bigJsNumber.format = {
				decimalSeparator: ',',
				groupSeparator: '', //TODO or maybe whitespace?
			}
			break
		}

		default:
			notExhaustiveSwitch(numbersStyleToUse.key)
	}

	//uses toFixed internally
	// see https://github.com/MikeMcl/toFormat/blob/master/toFormat.js
	//@ts-ignore
	return bigJsNumber.toFormat()
}

function calcHotCellToSelectFromCurosPos(
	openTableAndSelectCellAtCursorPos: InitialVars["openTableAndSelectCellAtCursorPos"],
	sourceFileCursorLineIndex: number | null,
	sourceFileCursorColumnIndex: number | null,
	isCursorPosAfterLastColumn: boolean,
	csvParseResult: ExtendedCsvParseResult,
	csvReadOptions: CsvReadOptions
): HotCellPos {

	if (openTableAndSelectCellAtCursorPos === 'never'
		|| sourceFileCursorLineIndex === null
		|| sourceFileCursorColumnIndex === null
		|| !csvParseResult
		|| !csvParseResult.outLineIndexToCsvLineIndexMapping
		|| !csvParseResult.outColumnIndexToCsvColumnIndexMapping
	) {
		return {
			rowIndex: 0,
			colIndex: 0,
		}
	}

	let modifySelectedRowBecauseIfHeaderBy = 0
	let csvRowToSelect = 0
	let csvColToSelect = 0

	//wrap in a try catch in case csv was corrupted and we can't finde some index...
	try {

		let currentCsvRowStartTextFileLineIndex = 0
		//actually only needed to check if the csv row spans multiple text lines
		//for indices we can use the editor text file line (we only need to add the line lengths before the current editor line)
		let currentCsvRowEndTextFileLineIndex = 0
		let currentCursorColAsCsvCol = sourceFileCursorColumnIndex ?? 0

		//find the csv row we need to select
		if (sourceFileCursorLineIndex < csvParseResult.outLineIndexToCsvLineIndexMapping.length) {

			//this is the csv row/index we want to select in the table ui
			csvRowToSelect = csvParseResult.outLineIndexToCsvLineIndexMapping[sourceFileCursorLineIndex]

			//we are not done yet, because the (single) csv row could span multiple text file lines
			//  if this is the case, the columns are harder to calculate
			currentCsvRowStartTextFileLineIndex = csvParseResult.outLineIndexToCsvLineIndexMapping.indexOf(csvRowToSelect)
			currentCsvRowEndTextFileLineIndex = currentCsvRowStartTextFileLineIndex

			if (currentCsvRowStartTextFileLineIndex === -1) {
				throw new Error(`Could not find text line for csv row ${csvRowToSelect}`)
			}

			//search down to find end/last text file line for the current csv row
			{
				for (let i = currentCsvRowStartTextFileLineIndex; i < csvParseResult.outLineIndexToCsvLineIndexMapping.length; i++) {
					let csvRowIndex = csvParseResult.outLineIndexToCsvLineIndexMapping[i]

					if (csvRowIndex === csvRowToSelect) {
						currentCsvRowEndTextFileLineIndex = i
						continue
					}
					//break is we get to the next csv line
					break
				}
			}

			//if we have new line inside a field... (csv row spans multiple text file lines)
			//now we know the current csv row spans from currentCsvRowStartTextFileLineIndex to currentCsvRowEndTextFileLineIndex
			//because the editor only knows the column of the text file line, we need to calculate the column in the csv file
			//e.g.
			//"633","Hanns-
			//Heinr
			//ich","F
			//
			//#test
			//alse
			//",Java,1,3,"2",,,
			//our csv column data only gives us the field/string end offsets for the whole csv row
			//as the csv row spans multiple text file lines, we need to calculate the column index starting from the first text file line of the csv row
			if (currentCsvRowStartTextFileLineIndex !== currentCsvRowEndTextFileLineIndex) {
				//we need to know the text file line lengths
				//\r\n is no problem because the csv content also contains \r\n, our split lines ends with \r but this is ok
				let allLines = csvParseResult.originalContent.split('\n')
				let startLineToSearch = currentCsvRowStartTextFileLineIndex
				//-1 because we know the offset in the current text file line (exactly sourceFileCursorLineIndex)
				let maxTextLineToSearch = sourceFileCursorLineIndex - 1
				currentCursorColAsCsvCol = 0

				for (let i = startLineToSearch; i <= maxTextLineToSearch; i++) {
					const textFileLine = allLines[i];
					currentCursorColAsCsvCol += textFileLine.length + 1 //+1 for the new line
				}

				currentCursorColAsCsvCol += sourceFileCursorColumnIndex ?? 0
			}

		}

		//col, we only got data for the first row... so get the data for the row we want to select
		if (openTableAndSelectCellAtCursorPos === 'initialOnly_correctRowAndColumn') { //initial only is row AND col position

			let fieldEndIndices = csvParseResult.outColumnIndexToCsvColumnIndexMapping[csvRowToSelect]

			//select the last cell, not working normally because our col indices only cover string indices...
			//but the cursor is after the last character here...

			let findColByEndIndex = true
			if (isCursorPosAfterLastColumn) {

				//this indicates that the cursor is after the last character... so select the last cell (even if empty e.g. ",,,")
				//but we could be on a multi csv row...

				//multi text line csv row?
				if (currentCsvRowStartTextFileLineIndex !== currentCsvRowEndTextFileLineIndex) {

					//the cursor might be at the end of the line BUT inside a multi line row...
					//but there is a special case if we are on the last text line of the csv row

					//cursor on the last text line of the multi line csv row?
					if (sourceFileCursorLineIndex === currentCsvRowEndTextFileLineIndex) {
						//cursor is on the last text line of the multi line csv row
						csvColToSelect = fieldEndIndices.length - 1
						findColByEndIndex = false
					} else {
						//inside the multi line csv row and the cursor is at the end of a line (but not the last text line of the csv row)
						findColByEndIndex = true
					}

				} else {
					//not a multi line csv row... just select last cell because the cursor is at the end of the line
					csvColToSelect = fieldEndIndices.length - 1
					findColByEndIndex = false
				}

			} else {
				//the csv row might span multiple rows
				findColByEndIndex = true
			}

			if (findColByEndIndex) {
				for (let i = 0; i < fieldEndIndices.length; i++) {
					let colEndIndex = fieldEndIndices[i] //can be -1 for empty rows but this is ok as we would select col 0

					if (currentCursorColAsCsvCol <= colEndIndex) {
						csvColToSelect = i
						break
					}
				}
			}

		}

		//now account for has header
		if (csvReadOptions._hasHeader) {

			//if we have a header, the first row is the header
			//so we need to subtract 1 from the csv row to select

			//there is a special case:
			//if we have comment lines before the first real csv line
			//  AND the cursor is placed anywhere before the first real csv line or on the first real csv line

			//first non comment line
			/** see {@link getFirstRowWithIndex} */
			let csvHeaderRowIndex = 0

			for (let i = 0; i < csvParseResult.data.length; i++) {
				const csvRow = csvParseResult.data[i]

				if (csvRow.length > 0 && isCommentCell(csvRow[0], csvReadOptions) === false) {
					csvHeaderRowIndex = i
					break
				}
			}

			if (csvRowToSelect === csvHeaderRowIndex) {
				//cursor is on the row that will become the header...

				csvRowToSelect++ //use next row
				modifySelectedRowBecauseIfHeaderBy = -1

			} else if (csvRowToSelect > csvHeaderRowIndex) {
				//-1 because the header line is removed from the "data rows"
				modifySelectedRowBecauseIfHeaderBy = -1

			} else {
				//csvRowToSelect < csvHeaderRowIndex
				//cursor is before the first real csv line, on a comment row, before are comment rows
				//we don't need to change the row index because only indices after the header row are changed

				//TODO not working ... one to much??
				if (hiddenPhysicalRowIndicesSorted.length > 0) {
					//we hide comment rows... select the next row after the hidden comment row
					csvRowToSelect = getNextRowIfCommentsAreHidden(csvHeaderRowIndex + 1)
					//-1 because we remove the header cell from indices...
					modifySelectedRowBecauseIfHeaderBy = -1
				}
			}

		}

	} catch (e) {
		console.warn(`[edit csv] could not select line ${sourceFileCursorLineIndex ?? -1} or column ${sourceFileCursorColumnIndex ?? -1}`, e)
		return {
			rowIndex: 0,
			colIndex: 0
		}
	}

	let selectCellPos: HotCellPos = {
		rowIndex: Math.max(0, csvRowToSelect),
		colIndex: Math.max(0, csvColToSelect)
	}

	//in case we hide comments and the cursor is on a comment row
	selectCellPos.rowIndex = getNextRowIfCommentsAreHidden(selectCellPos.rowIndex)
	selectCellPos.rowIndex += modifySelectedRowBecauseIfHeaderBy

	try {
		selectCellPos.rowIndex = Math.max(0, Math.min(csvParseResult.data.length - 1, selectCellPos.rowIndex))
		let dataRow = csvParseResult.data[selectCellPos.rowIndex]
		selectCellPos.colIndex = Math.max(0, Math.min(dataRow.length - 1, selectCellPos.colIndex))
	} catch (e) {
		selectCellPos.rowIndex = 0
		selectCellPos.colIndex = 0
	}

	return selectCellPos
}

function scrollToSelectedCell(hot: Handsontable, cellToSelect: HotCellPos) {

	//center selected cell in viewport
	let viewportTopRowToShow = 0
	if (cellToSelect.rowIndex !== 0) {
		let autoRowSizePlugin = hot.getPlugin('autoRowSize')
		let firstVisibleRow = autoRowSizePlugin.getFirstVisibleRow()
		let lastVisibleRow = autoRowSizePlugin.getLastVisibleRow()
		let visibleRowCount = lastVisibleRow - firstVisibleRow + 1
		//e.g. top row: 50, bot row: 100 --> middle: bot row - (100-50)/2 = 100 - 25 = 75
		// then move 75 to the top and then is 125 the bottom row --> 100 is the middle 
		// (because when selecting cell it scrolls into view, probably nearest, so 100 is bottom row)
		//but if we don't need to scroll, calculate a wrong top row...
		// viewportTopRowToShow = lastVisibleRow - Math.floor(visibleRowCount / 2)
		viewportTopRowToShow = cellToSelect.rowIndex - Math.floor(visibleRowCount / 2)

		if (viewportTopRowToShow < 0) {
			//don't scroll, cell is already visible
			viewportTopRowToShow = firstVisibleRow
		}

		let maxRowCount = hot.countRows()
		viewportTopRowToShow = Math.max(0, Math.min(viewportTopRowToShow, maxRowCount - 1))
	}


	//simply calculating the middle column is not working because they are probably not all the same width!
	//for rows this is not that important because they are normally all the same width
	let viewportLeftColToShow = 0
	if (cellToSelect.colIndex !== 0) {
		let autoColumnSizePlugin = hot.getPlugin('autoColumnSize')
		let firstVisibleCol = autoColumnSizePlugin.getFirstVisibleColumn()
		let lastVisibleCol = autoColumnSizePlugin.getLastVisibleColumn()
		let colWidths: number[] = autoColumnSizePlugin.widths

		let viewportAbsoluteLeftOffset = 0
		let viewportWidth = 0
		let cumulativeAbsoluteOffsets: number[] = []
		let selectedCellLeftOffsetMiddle = 0
		for (let i = 0; i <= lastVisibleCol; i++) {

			if (i < firstVisibleCol) {
				viewportAbsoluteLeftOffset += colWidths[i]
			} else {
				viewportWidth += colWidths[i]
			}

			if (i < cellToSelect.colIndex) {
				selectedCellLeftOffsetMiddle += colWidths[i]
			} else if (i === cellToSelect.colIndex) {
				selectedCellLeftOffsetMiddle += Math.floor(colWidths[i] / 2)
			}

			if (i === 0) {
				cumulativeAbsoluteOffsets.push(colWidths[i])
			} else {
				cumulativeAbsoluteOffsets.push(colWidths[i] + cumulativeAbsoluteOffsets[i - 1])
			}
		}
		//check if after middle: viewport width, cumulative width until selected col...

		if (firstVisibleCol === 0 && selectedCellLeftOffsetMiddle <= viewportWidth / 2) {
			//special case because here the table is not scrolled and the selected cell 
			//is not on the right or not over the half viewport
			//--> don't scoll
			viewportLeftColToShow = 0
			//we could also check hot.view.activeWt.wtOverlays.scrollableElement.scrollLeft for scroll bar pos
		} else {
			//we want to center the selected cell in the viewport

			//select sell will scroll the viewport to show the last column on the very right
			//e.g. out viewportoffset starts with 10 and last pivel sown is 100 --> width: 100-10 = 90, middle: (100+10)/2 = 55
			//our goal is that our selected cell middle is in the middle of the viewport
			//so we need to change the first/left visible column and move ti to the right
			//e.g. selected column with: 30, 50% -> 15
			//we want that the column middle is at 55, so we need to move the first visible column 
			//the difference between the current viewport middle and the column middle is: (100-15) - 55 = 30
			//so we need to move the first visible column by 30 --> 10 + 30 = 40 (last pixel is 100 + 30 = 130)
			//now we need to find the column that fits this the best...

			let viewportAbsoluteMiddle = viewportAbsoluteLeftOffset + Math.floor(viewportWidth / 2)
			let viewportMiddleDiff = selectedCellLeftOffsetMiddle - viewportAbsoluteMiddle
			//the absolute left offset needed to center the column in the viewport
			let neededViewporLeftOffsetAbsolute = viewportAbsoluteLeftOffset + viewportMiddleDiff

			//now we need to find the column that fits this the best...
			for (let i = 0; i <= lastVisibleCol; i++) {
				let cumulativeOffset = cumulativeAbsoluteOffsets[i]

				if (neededViewporLeftOffsetAbsolute <= cumulativeOffset) {
					viewportLeftColToShow = i
					break
				}
			}
		}
	}

	// console.log(`viewport`, viewportTopRowToShow, viewportLeftColToShow)
	//by default this the row will be top, the col on the left side
	//see https://handsontable.com/docs/6.2.2/Core.html#scrollViewportTo
	hot.scrollViewportTo(viewportTopRowToShow, viewportLeftColToShow, false, false)
}

function getHotScrollPosition(hot: Handsontable): HotViewportOffsetInPx {
	return {
		top: (hot as any).view.activeWt.wtOverlays.topOverlay.getScrollPosition(),
		left: (hot as any).view.activeWt.wtOverlays.leftOverlay.getScrollPosition()
	}
}

function setHotScrollPosition(hot: Handsontable, viewportOffsetInPx: HotViewportOffsetInPx): void {
	; (hot as any).view.activeWt.wtOverlays.topOverlay.setScrollPosition(viewportOffsetInPx.top)
		; (hot as any).view.activeWt.wtOverlays.leftOverlay.setScrollPosition(viewportOffsetInPx.left)
}

function storeHotSelectedCellAndScrollPosition(): void {
	//preserve selected cell and scroll positions
	if (!hot) return

	let hotSelection = hot.getSelected()
	if (hotSelection && hotSelection.length > 0) {
		previousSelectedCell = {
			rowIndex: hotSelection[0][0],
			colIndex: hotSelection[0][1]
		}
	}

	previousViewportOffsets = getHotScrollPosition(hot)

	let manualRowResizePlugin = hot.getPlugin('manualRowResize')
	previousManualRowHeights = manualRowResizePlugin.manualRowHeights

}

/**
 * changed the row index if the given index is a comment line (and we hide comments via settings)
 * @param visualRowIndex 
 * @returns 
 */
function getNextRowIfCommentsAreHidden(visualRowIndex: number): number {

	if (!hot) return visualRowIndex

	//comments are visible as normal rows
	if (hiddenPhysicalRowIndicesSorted.length === 0) return visualRowIndex

	const lastPossibleRowIndex = hot.countRows() - 1

	//move down if we find comments
	for (let i = visualRowIndex; i <= lastPossibleRowIndex; i++) {

		//@ts-ignore
		let physicalIndex = hot.toPhysicalRow(i)

		let isRowCommentAndHidden = hiddenPhysicalRowIndicesSorted.indexOf(physicalIndex) !== -1

		if (isRowCommentAndHidden) {
			//search next row
			continue
		}

		//found a real row!
		return i
	}

	//no real row found search top
	for (let i = visualRowIndex; i >= 0; i--) {

		//@ts-ignore
		let physicalIndex = hot.toPhysicalRow(i)
		let isRowCommentAndHidden = hiddenPhysicalRowIndicesSorted.indexOf(physicalIndex) !== -1

		if (isRowCommentAndHidden) {
			//search next row
			continue
		}

		//found a real row!
		return i
	}

	//give up
	return 0
}

function getOpenLinkModifierTooltopPart(): string {

	if (isBrowser) {

		if (isMacOpenLinkModifierKey) {
			return `(cmd + click)`
		}

		//windows: ctrl
		//on linux browsers ctrl + click for open in new tab
		return `(ctrl + click)`
	}

	//vs code extension

	if (isMacOpenLinkModifierKey) {
		// return `(alt + click)`
		return `(cmd + click)`
	}

	return `(ctrl + click)`
}

function isOpenLinkModifierPressed(e: KeyboardEvent | MouseEvent) {

	if (isBrowser) {

		//mac: meta (because alt seems to download links )
		if (isMacOpenLinkModifierKey && e.metaKey) return true

		//windows: ctrl
		//on linux browsers ctrl + click for open in new tab
		if (!isMacOpenLinkModifierKey && e.ctrlKey) return true
	}

	//vs code extension

	//mac -> alt (because meta is used to select individual cells)
	// if (isMacOpenLinkModifierKey && e.altKey) return true
	//BETTER use meta key to be more consistent with vs code
	//even though cmd is used to select individual cells 
	//(and also alt + click does not work in browser because it tries to download links...)
	if (isMacOpenLinkModifierKey && e.metaKey) return true

	//windows/linux -> ctrl (which also select cells but alt is for focus menu, windows key is for windows menu)
	if (!isMacOpenLinkModifierKey && e.ctrlKey) return true

	return false
}

function getFirstAndLastVisibleColumns(): { first: number, last: number } {

	if (!hot) return { first: 0, last: 0 }

	let firstVisibleCol = 0
	let lastVisibleCol = 0
	const lastPossibleColIndex = hot.countCols() - 1

	//get first 
	for (let index = 0; index <= lastPossibleColIndex; index++) {

		let physicalColIndex = hot.toPhysicalColumn(index)

		let isColHidden = hiddenPhysicalColumnIndicesSorted.indexOf(physicalColIndex) !== -1

		if (!isColHidden) {
			firstVisibleCol = index
			break
		}
	}

	//get last
	for (let index = lastPossibleColIndex; index >= 0; index--) {

		let physicalColIndex = hot.toPhysicalColumn(index)

		let isColHidden = hiddenPhysicalColumnIndicesSorted.indexOf(physicalColIndex) !== -1

		if (!isColHidden) {
			lastVisibleCol = index
			break
		}
	}

	return { first: firstVisibleCol, last: lastVisibleCol }
}

function getFirstAndLastVisibleRows(): { first: number, last: number } {

	if (!hot) return { first: 0, last: 0 }

	let firstVisibleRow = 0
	let lastVisibleRow = 0
	const lastPossibleRowIndex = hot.countRows() - 1

	//get first 
	for (let index = 0; index <= lastPossibleRowIndex; index++) {

		let physicalRowIndex = hot.toPhysicalRow(index)

		let isRowHidden = hiddenPhysicalRowIndicesSorted.indexOf(physicalRowIndex) !== -1

		if (!isRowHidden) {
			firstVisibleRow = index
			break
		}
	}

	//get last
	for (let index = lastPossibleRowIndex; index >= 0; index--) {

		let physicalRowIndex = hot.toPhysicalRow(index)

		let isRowHidden = hiddenPhysicalRowIndicesSorted.indexOf(physicalRowIndex) !== -1

		if (!isRowHidden) {
			lastVisibleRow = index
			break
		}
	}

	return { first: firstVisibleRow, last: lastVisibleRow }
}






// ------------------------------ auto fill stuff ------------------------------





//TODO -x
const intRegex = /\d+/g
const floatRegexEn = /\d+\.\d+/g
const floatRegexNonEn = /\d+\,\d+/g

// currently only english months are supported
const monthRegexLen3 = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)$/gi
const monthRegexFull = /^(january|february|march|april|may|june|july|august|september|october|november|december)$/gi
const monthFullNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const monthShortNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

type KnownDateFormat = {
	regex: RegExp
}

const allKnownSeparatorRegex = /[\-\/\.]/g // - / .

//as key we always use the `-` separator but we also support `/` and `.` as separators
const allKnownDateFormats = new Map<string, KnownDateFormat>()
allKnownDateFormats.set(`YYYY-MM-DD`, {
	regex: /^(\d{4})[\-\/\.](\d{2})[\-\/\.](\d{2})$/g,
})
allKnownDateFormats.set(`YYYY-M-DD`, {
	regex: /^(\d{4})[\-\/\.](\d{1})[\-\/\.](\d{2})$/g,
})
allKnownDateFormats.set(`YYYY-MM-D`, {
	regex: /^(\d{4})[\-\/\.](\d{2})[\-\/\.](\d{1})$/g,
})
allKnownDateFormats.set(`YYYY-M-D`, {
	regex: /^(\d{4})[\-\/\.](\d{1})[\-\/\.](\d{1})$/g,
})
allKnownDateFormats.set(`DD-MM-YYYY`, {
	regex: /^(\d{2})[\-\/\.](\d{2})[\-\/\.](\d{4})$/g,
})
allKnownDateFormats.set(`DD-M-YYYY`, {
	regex: /^(\d{2})[\-\/\.](\d{1})[\-\/\.](\d{4})$/g,
})
allKnownDateFormats.set(`D-MM-YYYY`, {
	regex: /^(\d{1})[\-\/\.](\d{2})[\-\/\.](\d{4})$/g,
})
allKnownDateFormats.set(`D-M-YYYY`, {
	regex: /^(\d{1})[\-\/\.](\d{1})[\-\/\.](\d{4})$/g,
})

allKnownDateFormats.set(`DD-MM-YY`, {
	regex: /^(\d{2})[\-\/\.](\d{2})[\-\/\.](\d{2})$/g,
})
allKnownDateFormats.set(`DD-M-YY`, {
	regex: /^(\d{2})[\-\/\.](\d{1})[\-\/\.](\d{2})$/g,
})
allKnownDateFormats.set(`D-MM-YY`, {
	regex: /^(\d{1})[\-\/\.](\d{2})[\-\/\.](\d{2})$/g,
})
allKnownDateFormats.set(`D-M-YY`, {
	regex: /^(\d{1})[\-\/\.](\d{1})[\-\/\.](\d{2})$/g,
})


/**
 * real interpolation because only number
 */
type GroupInterpolationInfo_Number = {
	type: 'int'
	//not needed, we just check that the string matches a regex and then use the string from the selected data
	// numberToUse: number
}

/**
 * no real interpolation but only +1 for every copy
 */
type GroupInterpolationInfo_ContainsNumber = {
	type: 'containsInt' //big js handles ints and floats
	/**
	 * 0-based index of the number to interpolate (used for substring)
	 */
	startIndexNumber: number
	/**
	 * end offset
	 */
	endIndexNumber: number

	// numberToUse: number
	/**
	 * the original number string
	 */
	numberString: string
}

/**
 * real interpolation because only number
 */
type GroupInterpolationInfo_MonthName = {
	type: 'month'

	/**
	 * the original month string
	 */
	monthString: string
	monthIndex: number
	isFullName: boolean
	isUpperCase: boolean
}

type GroupInterpolationInfo_Date = {
	type: 'date'
	originalDate: Dayjs
	separator1String: string
	separator2String: string
	displayFormat: string
}

/**
 * will be copied only
 */
type GroupInterpolationInfo_Unknown = {
	type: 'unknown'
}

type GroupInterpolationInfo =
	| GroupInterpolationInfo_Number
	| GroupInterpolationInfo_ContainsNumber
	| GroupInterpolationInfo_MonthName
	| GroupInterpolationInfo_Date
	| GroupInterpolationInfo_Unknown

/**
 * 
 * @param _data the selected data by the user to interpolate (x values)
 * @param targetCount the number of target items to interpolate (y values) (return)
 * @param isNormalDirection normal is top to bottom or left to right
 *   however, the user can also drag to top or to left (not normal), this is important for interpolation
 *   for copy only, this can be ignored!
 * @returns an array of interpolated strings
 */
function customAutoFillFunc(_data: string[], targetCount: number, isNormalDirection: boolean): string[] {
	if (!isNormalDirection) {
		_data = [..._data].reverse()
	}

	//here are some obersevations from excel auto fill:
	// if all data are numbers (ints/floats) -> interpolate normal
	// if we have mixed data (not just plain numbers, then it's text)
	// if it's text
	//    if it's a date -> interpolate dates
	//    if it's a month (or starting characters of a month) -> interpolate months and use the same length of characters (we only interpolate 3 or all letters for performance!)
	// if it's text that also contains numbers -> it's a group
	//   groups are interpolated differently e.g. we select 3 cells then ever (x+3) cells are used for interpolation -> we have 3 groups
	//     e.g. 1 a, 2 b, 3 c -> 2 a, 3 b, 4 c -> 3 a, 4 b, 5 c 
	//     (1a -> 2a -> 3a) ...
	// 		 however, this is no real interpolation
	//     for numbers (ints only) interpolation means +1!
	//   this allows us to interpolate different types/data in the same column, e.g. group 1 may be numbers, group 2 may be months, ...
	//   for groups:
	//     if the cells starts with a number -> interpolate only first number
	//     if the cells ends with a number -> interpolate only last number
	//
	//     if the cells does not start or end with a number -> fallback to copy (but in groups)
	// EXCEPTION if we have multiple only ints is sequence -> interpolate normal for the sequence
	//  1 2 a 5 6 -> interpolate (1, 2) as sequence, copy a, interpolate (5, 6) as sequence

	//the following date formats are supported:
	// supported separators: . / - (examples use only -)
	// 2024-01-01 (YYYY-MM-DD)
	// 2024-1-01 (YYYY-M-DD)
	// 2024-01-1 (YYYY-MM-D)
	// 2024-1-1 (YYYY-M-D)

	// 01-01-2024 (DD-MM-YYYY)
	// 01-1-2024 (DD-M-YYYY)
	// 1-01-2024 (D-MM-YYYY)
	// 1-1-2024 (D-M-YYYY)

	// 01-01-2024 (DD-MM-YY)
	// 01-1-2024 (DD-M-YY)
	// 1-01-2024 (D-MM-YY)
	// 1-1-2024 (D-M-YY)

	//the following months are supported:
	// at least 3 letters of the months are needed
	// currently only enlish months are supported
	// the different in month indices must be the same in the selected data, else we copy
	// jan, mar, may (diff 2)
	// jan, mar apr (different diff) -> copy
	// the other props (uppercase, ...) are individual for every entry

	//style from stats ui
	let numbersStyleToUse = getNumbersStyleFromUi()

	let groupInterpolationInfos: GroupInterpolationInfo[] = []

	for (let i = 0; i < _data.length; i++) {
		const cellText = _data[i]

		//other
		//however, if we have mixed data, it's automatically grouped data, so do this anyway

		//could be: month, date or grouped data

		//grouped data

		{
			let checkOtherCases = true
			//check if starts or ends with number (ints only)

			const matchesInt = Array.from(cellText.matchAll(intRegex))

			let firstMatchInt = matchesInt.length > 0 ? matchesInt[0] : null
			let startsWithNumberInt = matchesInt.length > 0 && firstMatchInt && firstMatchInt.index === 0
			let lastMatchInt = matchesInt.length > 0 ? matchesInt[matchesInt.length - 1] : null
			let endsWithNumberInt = matchesInt.length > 0 && lastMatchInt && lastMatchInt.index! + lastMatchInt[0].length === cellText.length
			let onlyNumberInt = startsWithNumberInt && endsWithNumberInt && matchesInt.length === 1

			let matchesFloat: RegExpMatchArray[] = []

			if (numbersStyleToUse.key === 'en') {
				matchesFloat = Array.from(cellText.matchAll(floatRegexEn))
			} else {
				matchesFloat = Array.from(cellText.matchAll(floatRegexNonEn))
			}

			let firstMatchFloat = matchesFloat.length > 0 ? matchesFloat[0] : null
			let startsWithNumberFloat = matchesFloat.length > 0 && firstMatchFloat && firstMatchFloat.index === 0
			let lastMatchFloat = matchesFloat.length > 0 ? matchesFloat[matchesFloat.length - 1] : null
			let endsWithNumberFloat = matchesFloat.length > 0 && lastMatchFloat && lastMatchFloat.index! + lastMatchFloat[0].length === cellText.length
			let onlyNumberFloat = startsWithNumberFloat && endsWithNumberFloat && matchesFloat.length === 1


			if (onlyNumberFloat) {

				let groupInterpolationInfo_Int: GroupInterpolationInfo_Number = {
					type: 'int', //big js handles ints and floats
				}

				groupInterpolationInfos.push(groupInterpolationInfo_Int)
				checkOtherCases = false

			} else if (onlyNumberInt) {

				let groupInterpolationInfo_Int: GroupInterpolationInfo_Number = {
					type: 'int',
				}

				groupInterpolationInfos.push(groupInterpolationInfo_Int)
				checkOtherCases = false

			} else if (startsWithNumberInt && endsWithNumberInt) {
				//check date
				// fast check if it could be a date because we check a lot of regexes

				for (const [format, knownFormat] of allKnownDateFormats) {

					//TODO only use first?
					const dateMatches = Array.from(cellText.matchAll(knownFormat.regex))

					if (dateMatches.length === 0) continue

					// format = `YYYY-MM-DD`
					let dateMatch = dateMatches[0] // e.g. 2024.01.01
					let dateMatchString = dateMatch[0]

					//figure out separator
					const separatorMatches = Array.from(dateMatchString.matchAll(allKnownSeparatorRegex))

					if (separatorMatches.length !== 2) continue

					let separator1 = separatorMatches[0][0]
					let separator2 = separatorMatches[1][0]

					let displayFormat = format.replace(`-`, separator1).replace(`-`, separator2)

					let originalDate = dayjs(dateMatchString, displayFormat, true)

					if (originalDate.isValid() === false) continue

					let groupInterpolationInfo_Date: GroupInterpolationInfo_Date = {
						type: 'date',
						originalDate,
						displayFormat: displayFormat,
						separator1String: separator1,
						separator2String: separator2,
					}

					groupInterpolationInfos.push(groupInterpolationInfo_Date)
					checkOtherCases = false
					break //we found a date
				}

			}

			const monthNames = Array.from(cellText.matchAll(monthRegexLen3))
			const monthNamesFull = Array.from(cellText.matchAll(monthRegexFull))

			if (checkOtherCases) {

				if (startsWithNumberFloat && firstMatchFloat) {

					let groupInterpolationInfo_ContainsNumber: GroupInterpolationInfo_ContainsNumber = {
						type: 'containsInt',
						startIndexNumber: firstMatchFloat.index!,
						endIndexNumber: firstMatchFloat.index! + firstMatchFloat[0].length,
						numberString: firstMatchFloat[0]
					}

					groupInterpolationInfos.push(groupInterpolationInfo_ContainsNumber)

				} else if (endsWithNumberFloat && lastMatchFloat) {

					let groupInterpolationInfo_ContainsNumber: GroupInterpolationInfo_ContainsNumber = {
						type: 'containsInt',
						startIndexNumber: lastMatchFloat.index!,
						endIndexNumber: lastMatchFloat.index! + lastMatchFloat[0].length,
						numberString: lastMatchFloat[0]
					}

					groupInterpolationInfos.push(groupInterpolationInfo_ContainsNumber)

				} else if (startsWithNumberInt && firstMatchInt) {

					let groupInterpolationInfo_ContainsNumber: GroupInterpolationInfo_ContainsNumber = {
						type: 'containsInt',
						startIndexNumber: firstMatchInt.index!,
						endIndexNumber: firstMatchInt.index! + firstMatchInt[0].length,
						numberString: firstMatchInt[0]
					}

					groupInterpolationInfos.push(groupInterpolationInfo_ContainsNumber)

				} else if (endsWithNumberInt && lastMatchInt) {

					let groupInterpolationInfo_ContainsNumber: GroupInterpolationInfo_ContainsNumber = {
						type: 'containsInt',
						startIndexNumber: lastMatchInt.index!,
						endIndexNumber: lastMatchInt.index! + lastMatchInt[0].length,
						numberString: lastMatchInt[0]
					}

					groupInterpolationInfos.push(groupInterpolationInfo_ContainsNumber)

				} else if (monthNames.length === 1 || monthNamesFull.length === 1) {

					//can be a month or just a part of another word that is not a month!
					// for performance we only interpolate 3 or all letters of months
					// (else we would need to check whole words, search for whitespaces, ...)

					let info: GroupInterpolationInfo
					let monthIndex = -1
					let isFullName: boolean
					let isUpperCase: boolean = cellText[0] !== cellText[0].toLowerCase()

					if (monthNamesFull.length === 1) {
						//full match
						monthIndex = monthFullNames.indexOf(cellText.toLowerCase())
						isFullName = true
					}
					else {
						//only 3 letters
						monthIndex = monthShortNames.indexOf(cellText.toLowerCase())
						isFullName = false
					}

					if (monthIndex !== -1) {
						info = {
							type: 'month',
							monthString: cellText,
							monthIndex,
							isFullName,
							isUpperCase,
						} satisfies GroupInterpolationInfo_MonthName
					}
					else {
						console.warn(`Could not find month index for interpolation, defaulting to copying`)

						info = {
							type: 'unknown'
						} satisfies GroupInterpolationInfo_Unknown
					}

					groupInterpolationInfos.push(info)

				} else {
					//normal data, just copy

					let groupInterpolationInfo_Unknown: GroupInterpolationInfo_Unknown = {
						type: 'unknown'
					}

					groupInterpolationInfos.push(groupInterpolationInfo_Unknown)
				}
			}

		}

	}

	//--- interpolation data for numbers

	const bigZero = Big(0)
	//if we have numbers in consecutive cells -> they form a sequence for interpolation
	//we can have multiple sequences in the same column
	const interpolationSequenceStrings: Array<string[]> = []
	let currentSequence: string[] = []
	let dataIndexToInterpolationSequenceIndex: number[] = []

	const interpolationSequenceModels = []
	const interpolationLastXVal: Array<typeof bigZero> = []

	{
		for (let _i = 0; _i < groupInterpolationInfos.length; _i++) {
			const el = groupInterpolationInfos[_i]

			if (el.type === `int`) {
				currentSequence.push(_data[_i])
				dataIndexToInterpolationSequenceIndex[_i] = interpolationSequenceStrings.length

			} else if (el.type === `containsInt`) {
				//we only interpolate +1/-1 here so every contains int type is it's own sequence/group
				//same as excel

				if (currentSequence.length > 0) {
					interpolationSequenceStrings.push(currentSequence)
					currentSequence = []
				}

				dataIndexToInterpolationSequenceIndex[_i] = interpolationSequenceStrings.length

				//every contains int cell has it's own interpolation sequence
				currentSequence.push(el.numberString)
				interpolationSequenceStrings.push(currentSequence)
				currentSequence = []

			} else {
				// not int

				dataIndexToInterpolationSequenceIndex[_i] = -1

				if (currentSequence.length > 0) {
					interpolationSequenceStrings.push(currentSequence)
					currentSequence = []
				}
			}
		}

		if (currentSequence.length > 0) {
			interpolationSequenceStrings.push(currentSequence)
		}

		// create the interpolation models for number groups
		for (let i = 0; i < interpolationSequenceStrings.length; i++) {
			const sequenceStrings = interpolationSequenceStrings[i]

			let ints = sequenceStrings.map((p, index) => {

				let canonicalNumberString = getFirstCanonicalNumberStringInCell(p, numbersStyleToUse)
				if (canonicalNumberString === null) {
					console.warn(`Could not get canonical number string for interpolation at selection index: ${index}, defaulting to 0`)
					return bigZero
				}

				let num: typeof bigZero

				try {
					num = Big(canonicalNumberString)
				} catch (error) {
					console.warn(`Could not parse canonical number string for interpolation at selection index: ${index}, defaulting to 0`)
					return bigZero
				}

				return num
			})

			// special case, we want to increase +1
			let isSimpleIncrement = false
			if (ints.length === 1) {

				if (isNormalDirection) {
					ints.push(ints[0].add(1))
				} else {
					//add to front because we will reverse!
					// ints.unshift(ints[0] - 1)
					ints.push(ints[0].sub(1))
				}

				isSimpleIncrement = true
			}

			let dataPoints = ints.map((val, index) => [Big(index + 1), val])
			let model = regression.linearBig(dataPoints)
			interpolationSequenceModels.push(model)

			if (isSimpleIncrement) {
				//we added a "fake" el to get linear interpolation (a line)
				interpolationLastXVal.push(dataPoints[dataPoints.length - 2][0])
			} else {
				interpolationLastXVal.push(dataPoints[dataPoints.length - 1][0])
			}
		}

	}

	let interpolationIndices = Array.from({ length: interpolationSequenceStrings.length }, (_, i) => {
		return interpolationLastXVal[i]
	})

	//--- interpolation data for month indices

	const interpolationMonthIndices: Array<number[]> = [] //better use month indices instead of strings
	let currentSequenceMonthIndices: number[] = []
	let curentSequenceMonthGroupIndices: number[] = []

	let dataIndexToInterpolationSequenceIndexMonths: number[] = []
	let interpolationIndexToDataGroupIndexMonths: Array<number[]> = [] //entries are curentSequenceMonthGroupIndices

	//just a plain number to add
	const interpolationSequenceModelsMonths: number[] = []
	const monthInterpolationIndices: number[] = [] //we start with these indices for interpolation

	{
		for (let _i = 0; _i < groupInterpolationInfos.length; _i++) {
			const el = groupInterpolationInfos[_i]

			if (el.type === `month`) {
				currentSequenceMonthIndices.push(el.monthIndex)
				curentSequenceMonthGroupIndices.push(_i)

				dataIndexToInterpolationSequenceIndexMonths[_i] = interpolationMonthIndices.length

			} else {
				// not month

				dataIndexToInterpolationSequenceIndexMonths[_i] = -1


				if (currentSequenceMonthIndices.length > 0) {
					interpolationMonthIndices.push(currentSequenceMonthIndices)
					currentSequenceMonthIndices = []

					interpolationIndexToDataGroupIndexMonths.push(curentSequenceMonthGroupIndices)
					curentSequenceMonthGroupIndices = []
				}
			}
		}

		if (currentSequenceMonthIndices.length > 0) {
			interpolationMonthIndices.push(currentSequenceMonthIndices)

			interpolationIndexToDataGroupIndexMonths.push(curentSequenceMonthGroupIndices)
		}

		for (let i = 0; i < interpolationMonthIndices.length; i++) {
			const monthIndexSequence = interpolationMonthIndices[i]

			let delta: number

			//make sure all deltas are the same
			if (monthIndexSequence.length === 1) {
				// will be +1
				delta = isNormalDirection ? 1 : -1
			} else {
				delta = monthIndexSequence[1] - monthIndexSequence[0]
			}

			let allDeltasAreTheSame = true

			for (let j = 1; j < monthIndexSequence.length; j++) {
				if (monthIndexSequence[j] - monthIndexSequence[j - 1] !== delta) {
					allDeltasAreTheSame = false
					break
				}
			}

			if (!allDeltasAreTheSame) {

				const groupIndicesThatContributedToThisGroup = interpolationIndexToDataGroupIndexMonths[i]

				for (let k = 0; k < groupIndicesThatContributedToThisGroup.length; k++) {
					const groupIndex = groupIndicesThatContributedToThisGroup[k]

					//default to just copy
					groupInterpolationInfos[groupIndex] = {
						type: 'unknown',
					} satisfies GroupInterpolationInfo_Unknown

				}

				continue
			}

			interpolationSequenceModelsMonths.push(delta % 12)
			monthInterpolationIndices.push(monthIndexSequence[monthIndexSequence.length - 1])
		}

	}

	//--- interpolation data for dates

	//consecutive dates form a sequence for interpolation (a group)

	const interpolationDatesData: Array<GroupInterpolationInfo_Date["originalDate"][]> = [] //better use month indices instead of strings
	let currentSequenceDatesData: GroupInterpolationInfo_Date["originalDate"][] = []
	let curentSequenceDateGroupData: number[] = []

	let dataIndexToInterpolationSequenceIndexDates: number[] = []
	let interpolationIndexToDataGroupIndexDates: Array<number[]> = [] //entries are curentSequenceMonthGroupIndices

	//just a plain numbers to add
	const interpolationSequenceModelsDates: Array<[diffDays: number, diffMonths: number, diffYears: number]> = []
	const dateInterpolationStart: GroupInterpolationInfo_Date["originalDate"][] = [] //we start with these dates for interpolation

	{

		for (let _i = 0; _i < groupInterpolationInfos.length; _i++) {
			const el = groupInterpolationInfos[_i]

			if (el.type === `date`) {
				currentSequenceDatesData.push(el.originalDate)
				curentSequenceDateGroupData.push(_i)

				dataIndexToInterpolationSequenceIndexDates[_i] = interpolationDatesData.length

			} else {
				// not int

				dataIndexToInterpolationSequenceIndexDates[_i] = -1


				if (currentSequenceDatesData.length > 0) {
					interpolationDatesData.push(currentSequenceDatesData)
					currentSequenceDatesData = []

					interpolationIndexToDataGroupIndexDates.push(curentSequenceDateGroupData)
					curentSequenceDateGroupData = []
				}
			}
		}

		if (currentSequenceDatesData.length > 0) {
			interpolationDatesData.push(currentSequenceDatesData)

			interpolationIndexToDataGroupIndexDates.push(curentSequenceDateGroupData)
		}

		for (let i = 0; i < interpolationDatesData.length; i++) {
			const interpolationDateGroup = interpolationDatesData[i]

			let deltas: typeof interpolationSequenceModelsDates[number] = [0, 0, 0]

			//make sure all deltas are the same in the current group
			if (interpolationDateGroup.length === 1) {
				// special case when we only have 1 date -> increment by 1 day
				// will be +1 for days
				deltas = [isNormalDirection ? 1 : -1, 0, 0]
			} else {

				// we have the following cases for 2 dates (all others must have the same deltas or pattern)
				// days are same e.g. 20.02.2024 -> 20.03.2024 -> keep the day -> 20.04.2024 (add the diff in months)
				// days and months are the same e.g. 20.02.2024 -> 20.02.2025 -> keep the day and month -> 20.02.2026 (add the diff in years)
				// if days are different -> always add the diff in days as a constant

				let prevEl = interpolationDateGroup[0]
				let el = interpolationDateGroup[1]

				let diffInDays = el.date() - prevEl.date()
				let diffInMonths = el.month() - prevEl.month()
				let diffInYears = el.year() - prevEl.year()

				if (diffInDays === 0 && diffInMonths === 0) {

					deltas = [0, 0, diffInYears]
				}
				else if (diffInDays === 0) {

					deltas = [0, diffInMonths, diffInYears]
				}
				else {
					//diff in days is != 0

					let deltaInDays = el.diff(prevEl, 'day')
					deltas = [deltaInDays, 0, 0]
				}
			}

			let allDeltasAreTheSame = [true, true, true]

			// 2 because we already checked the first 2
			for (let j = 2; j < interpolationDateGroup.length; j++) {

				let prevEl = interpolationDateGroup[j - 1]
				let el = interpolationDateGroup[j]

				let diffInDays = el.date() - prevEl.date()
				let diffInMonths = el.month() - prevEl.month()
				let diffInYears = el.year() - prevEl.year()

				if (deltas[0] === 0 && deltas[1] === 0 && diffInDays == 0 && diffInMonths === 0) {

					if (diffInYears !== deltas[2]) {
						allDeltasAreTheSame[2] = false
					}
				}
				else if (deltas[0] === 0 && diffInDays == 0) {

					if (diffInYears !== deltas[2]) {
						allDeltasAreTheSame[2] = false
					}

					if (diffInMonths !== deltas[1]) {
						allDeltasAreTheSame[1] = false
					}
				}
				else {
					//diff in days is != 0

					let deltaInDays = el.diff(prevEl, 'day')

					if (deltaInDays !== deltas[0]) {
						allDeltasAreTheSame[0] = false
					}
				}
			}

			//if all deltas are different -> copy
			if (allDeltasAreTheSame.some(p => p === false)) {

				const groupIndicesThatContributedToThisGroup = interpolationIndexToDataGroupIndexDates[i]

				for (let k = 0; k < groupIndicesThatContributedToThisGroup.length; k++) {
					const groupIndex = groupIndicesThatContributedToThisGroup[k]

					//default to just copy
					groupInterpolationInfos[groupIndex] = {
						type: 'unknown',
					} satisfies GroupInterpolationInfo_Unknown

				}

				continue
			}

			//currently we are strict, all deltas must be the same
			// //reset deltas that are not the same
			// for (let k = 0; k < allDeltasAreTheSame.length; k++) {
			// 	const isTheSame = allDeltasAreTheSame[k]

			// 	if (!isTheSame) {
			// 		deltas[k] = 0
			// 	}
			// }

			interpolationSequenceModelsDates.push(deltas)
			//the last date is the start for the next interpolation
			dateInterpolationStart.push(interpolationDateGroup[interpolationDateGroup.length - 1])
		}

	}

	let interpolatedDataAsString: string[] = []

	console.debug(`auto fill numbersStyleToUse`, numbersStyleToUse)
	console.debug(`auto fill groupInterpolationInfos`, groupInterpolationInfos)

	// create output
	for (let i = 0; i < targetCount; i++) {

		//data.length === groupInterpolationInfos.length
		let relativI = i % _data.length

		let groupInterpolationInfo = groupInterpolationInfos[relativI]

		switch (groupInterpolationInfo.type) {
			case "int": {
				let sequenceIndex = dataIndexToInterpolationSequenceIndex[relativI]
				let model = interpolationSequenceModels[sequenceIndex]
				//always +1 regardless of the direction (because we reverse the data points for the model)
				interpolationIndices[sequenceIndex] = interpolationIndices[sequenceIndex].add(1)
				let nextXVal = interpolationIndices[sequenceIndex]

				let predictedVal = model.predict(nextXVal)
				let numString = formatBigJsNumber(predictedVal[1], numbersStyleToUse)
				interpolatedDataAsString.push(numString)
				break
			}

			case "containsInt": {

				let sequenceIndex = dataIndexToInterpolationSequenceIndex[relativI]
				let model = interpolationSequenceModels[sequenceIndex]
				//always +1 regardless of the direction (because we reverse the data points for the model)
				interpolationIndices[sequenceIndex] = interpolationIndices[sequenceIndex].add(1)
				let nextXVal = interpolationIndices[sequenceIndex]
				let predictedVal = model.predict(nextXVal)

				// the cell contained more than just the number -> recreate the cell with the number replaced
				let cellText = _data[relativI]
				let numString = formatBigJsNumber(predictedVal[1], numbersStyleToUse)
				let newCellText = cellText.substring(0, groupInterpolationInfo.startIndexNumber) + numString + cellText.substring(groupInterpolationInfo.endIndexNumber)
				interpolatedDataAsString.push(newCellText)
				break
			}

			case "month": {

				let sequenceIndex = dataIndexToInterpolationSequenceIndexMonths[relativI]
				let delta = interpolationSequenceModelsMonths[sequenceIndex]

				let currMonthIndex = monthInterpolationIndices[sequenceIndex]

				let isFullName = groupInterpolationInfo.isFullName
				let isUpperCase = groupInterpolationInfo.isUpperCase

				let newMonthIndex = currMonthIndex + delta

				if (newMonthIndex < 0) {
					newMonthIndex = 12 + newMonthIndex
				}


				let nextMonthIndex = newMonthIndex % 12
				let nextMonth = isFullName ? monthFullNames[nextMonthIndex] : monthShortNames[nextMonthIndex]

				if (isUpperCase) {
					//make first letter uppercase
					nextMonth = nextMonth[0].toUpperCase() + nextMonth.substring(1)
				}

				monthInterpolationIndices[sequenceIndex] = nextMonthIndex

				interpolatedDataAsString.push(nextMonth)
				break
			}

			case "date": {

				let sequenceIndex = dataIndexToInterpolationSequenceIndexDates[relativI]
				let delta = interpolationSequenceModelsDates[sequenceIndex]

				let currStartDate = dateInterpolationStart[sequenceIndex]

				let nextDate = currStartDate.add(delta[0], 'day').add(delta[1], 'month').add(delta[2], 'year') as typeof currStartDate

				if (nextDate.isValid() === false) {
					//could get invalid date
					interpolatedDataAsString.push("INVALID DATE")
				} else {

					dateInterpolationStart[sequenceIndex] = nextDate
					let dateString = nextDate.format(groupInterpolationInfo.displayFormat)
					interpolatedDataAsString.push(dateString)

				}

				break
			}

			case "unknown": {
				//just copy
				interpolatedDataAsString.push(_data[relativI])
				break
			}

			default:
				notExhaustiveSwitch(groupInterpolationInfo)
		}

	}

	if (!isNormalDirection) {
		interpolatedDataAsString.reverse()
	}

	//just a smal sanity check
	if (interpolatedDataAsString.some(p => typeof p !== 'string')) {
		//something went wrong -> default
		return []
	}

	console.debug(`auto fill data`, interpolatedDataAsString)
	return interpolatedDataAsString
}