
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

/**
 * checks if a given cell value is a comment with the given configuration
 * @param value
 * @param csvReadConfig
 */
function isCommentCell(value: string | null, csvReadConfig: CsvReadOptions) {

	if (value === null) return false

	if (typeof csvReadConfig.comments === 'string') {
		return value.trimLeft().startsWith(csvReadConfig.comments)
	}

	return false
}

/**
 * ensures that all rows inside data have the same length
 * @param data 
 * @param csvReadConfig 
 */
function _normalizeDataArray(data: string[][], csvReadConfig: CsvReadOptions, fillString = '') {


	const maxCols = data.reduce((prev, curr) => curr.length > prev ? curr.length : prev, 0)

	for (let i = 0; i < data.length; i++) {
		const row = data[i];

		if (row.length < maxCols) {
			row.push(...Array.from(Array(maxCols - row.length), (p, index) => fillString))
		}

		//trim cell values to normalize
		// if(trimWhitespace) {
		// 	for (let j = 0; j < row.length; j++) {

		// 		if (row[j] === null || row[j] === undefined) continue
	
		// 		row[j] = row[j].trim()
		// 	}
		// }

	}

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
	return `column ${index+1}`
}

/**
 * adds a new column at the end
 * @param {boolean} selectNewColumn true: scrolls to the new column
 */
function addColumn(selectNewColumn = true) {

	if (!hot) throw new Error('table was null')

	const numCols = hot.countCols()
	hot.alter('insert_col', numCols) //inserted data contains null but papaparse correctly unparses it as ''

	//keep header in sync with the number of columns
	if (headerRowWithIndex) {
		headerRowWithIndex.row.push(null)
	}
	console.log(`headerRowWithIndex`, headerRowWithIndex)

	//we could get 0 cols...
	checkIfHasHeaderReadOptionIsAvailable(false)

	const pos = hot.getSelected() //undefined or [[startRow, startCol, endRow, endCol], ...] (could select not connected cells...)
	if (pos && pos.length === 1) { //only 1 row selected

		if (selectNewColumn) {
			hot.selectCell(pos[0][0], numCols)
		}
	}

	rerenderColumns()
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

	if (selectNewRow) {
		hot.selectCell(numRows, 0)
	}

	checkIfHasHeaderReadOptionIsAvailable(false)
}

/**
 * removes a row by index
 * @param {number} index 0 based
 */
function removeRow(index: number) {

	if (!hot) throw new Error('table was null')

	hot.alter('remove_row', index)
	checkIfHasHeaderReadOptionIsAvailable(false)
}

/**
 * removes a column by index
 * @param {number} index the visual column index
 */
function removeColumn(index: number) {

	if (!hot) throw new Error('table was null')

	hot.alter('remove_col', index)

	//keep header in sync with the number of columns
	if (headerRowWithIndex) {
		headerRowWithIndex.row.splice(index, 1)
	}

	//we could get 0 cols...
	checkIfHasHeaderReadOptionIsAvailable(false)

	rerenderColumns()
}

/**
 * after some actions e.g. inserting/removing rows we need to correct the header column text
 */
function rerenderColumns() {

	if (!hot) throw new Error('table was null')

	if (defaultCsvReadOptions._hasHeader && headerRowWithIndex) {
		const data = headerRowWithIndex

		hot.updateSettings({
			colHeaders: data.row.map((col, index) => defaultColHeaderFunc(index, col))
		}, false)

	} else {
		hot.updateSettings({
			colHeaders: defaultColHeaderFunc as any
		}, false)
	}
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
function commentValueRenderer(instance: Handsontable, td: HTMLTableDataCellElement, row: number, col: number, prop: any, value: string | null, cellProperties: any) {
	//@ts-ignore
	Handsontable.renderers.TextRenderer.apply(this, arguments);

	// console.log(value)

	if (value !== null && isCommentCell(value, defaultCsvReadOptions)) {
		// td.classList.add('comment-row')
		if (td && td.nextSibling) {
			(td.nextSibling as HTMLElement).title = warningTooltipTextWhenCommentRowNotFirstCellIsUsed;
		}

		//make the whole row a comment
		if (td && td.parentElement) {
			td.parentElement.classList.add('comment-row')
		}
	}

	// if (cellProperties._isComment) {
	// 	td.classList.add('comment-row')
	// } else {
	// 	// td.style.backgroundColor = ''
	// }

}

(Handsontable.renderers as any).registerRenderer('commentValueRenderer', commentValueRenderer);

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
function _setOption<T extends {}>(targetOptions: T, options: T, optionName: keyof T) {

	if (options.hasOwnProperty(optionName)) {

		if (targetOptions.hasOwnProperty(optionName) === false) {
			_error(`target options object has not property '${optionName}'`)
			return
		}

		targetOptions[optionName] = options[optionName]
	} else {
		_error(`options object has not property '${optionName}'`)
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
 * see https://forum.handsontable.com/t/table-with-only-header-row/2915 and
 * and https://github.com/handsontable/handsontable/issues/735
 * seems like with default headers it's not possible to only have headers?
 * @returns false: force changes (settings want headers but is not possible with data), true: all ok
 */
function checkIfHasHeaderReadOptionIsAvailable(isInitialRender: boolean): boolean {

	const data = getData() //this also includes header rows

	const el = _getById('has-header') as HTMLInputElement

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
		el.removeAttribute('disabled')

	} else {
		el.setAttribute('disabled', '')

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

function _error(text: string) {
	postVsError(text)
	throw new Error(text)
}

/**
 * apply the first part of the settings from initialConfig, called before parsing data
 * some options have impact e.g. on how to parse the data...
 * some options depend on the state after parse ... e.g. has before/after comments?
 */
function setupAndApplyInitialConfigPart1(initialConfig: CsvEditSettings | undefined) {

	if (initialConfig === undefined) {

		//probably in browser here...

		toggleReadOptions(true)
		toggleWriteOptions(true)
		togglePreview(true)

		showCommentsBtn.style.display = 'none'
		hideCommentsBtn.style.display = 'initial'

		return
	}

	highlightCsvComments = initialConfig.highlightCsvComments

	//apply settings from extension

	const copyReadOptions = {
		...defaultCsvReadOptions
	}

	setCsvReadOptionsInitial({
		...copyReadOptions,
		delimiter: initialConfig.readOption_delimiter,
		comments: initialConfig.readOption_comment,
		_hasHeader: initialConfig.readOption_hasHeader === 'true' ? true : false,
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
	})


	switch (initialConfig.readOptionsAppearance) {
		case 'expanded': {
			toggleReadOptions(false)
			break
		}
		case 'collapsed': {
			toggleReadOptions(true)
			break
		}
		// case 'remember': {
		// 	//TODO
		// 	toggleReadOptions(true)
		// 	break
		// }
		default: {
			_error(`unknown readOptionsAppearance: ${initialConfig.readOptionsAppearance}`)
			break;
		}
	}

	switch (initialConfig.writeOptionsAppearance) {
		case 'expanded': {
			toggleWriteOptions(false)
			break
		}
		case 'collapsed': {
			toggleWriteOptions(true)
			break
		}
		// case 'remember': {
		// 	//TODO
		// 	toggleWriteOptions(true)
		// 	break
		// }
		default: {
			_error(`unknown writeOptionsAppearance: ${initialConfig.writeOptionsAppearance}`)
			break;
		}
	}

	switch (initialConfig.previewOptionsAppearance) {
		case 'expanded': {
			togglePreview(false)
			break
		}
		case 'collapsed': {
			togglePreview(true)
			break
		}
		// case 'remember': {
		// 	//TODO
		// 	togglePreview(true)
		// 	break
		// }
		default: {
			_error(`unknown previewOptionsAppearance: ${initialConfig.previewOptionsAppearance}`)
			break;
		}
	}

	if (initialConfig.initiallyHideComments) {
		showCommentsBtn.style.display = 'initial'
		hideCommentsBtn.style.display = 'none'
	}
	else {
		showCommentsBtn.style.display = 'none'
		hideCommentsBtn.style.display = 'initial'
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