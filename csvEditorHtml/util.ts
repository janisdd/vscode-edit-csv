
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

	if (typeof csvReadConfig.comments === 'string' && csvReadConfig.comments !== '') {
		return value.trimLeft().startsWith(csvReadConfig.comments)
	}

	return false
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
function commentValueRenderer(instance: Handsontable, td: HTMLTableDataCellElement, row: number, col: number, prop: any, value: string | null, cellProperties: any) {
	//@ts-ignore
	Handsontable.renderers.TextRenderer.apply(this, arguments);

	// console.log(value)

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
		//but we could have only comments --> no header available
		const firstRow = getFirstRowWithIndex()
		if (firstRow === null && !el.checked) { //if el.checked is true then we already have a header row...
			canSetOption = false
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
function setupAndApplyInitialConfigPart1(initialConfig: CsvEditSettings | undefined, initialVars: InitialVars) {


	//first apply the initial vars
	{
		_setIsWatchingSourceFileUiIndicator(initialVars.isWatchingSourceFile)
	}


	if (initialConfig === undefined) {

		//probably in browser here...

		toggleOptionsBar(true)

		showCommentsBtn.style.display = 'none'
		hideCommentsBtn.style.display = 'initial'

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
		comments: initialConfig.readOption_comment,
		_hasHeader: _readOption_hasHeader,
		escapeChar: initialConfig.readOption_escapeChar,
		quoteChar: initialConfig.readOption_quoteChar
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
		retainQuoteInformation: initialConfig.retainQuoteInformation
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
		showCommentsBtn.style.display = 'initial'
		hideCommentsBtn.style.display = 'none'
	}
	else {
		showCommentsBtn.style.display = 'none'
		hideCommentsBtn.style.display = 'initial'
	}

	//--- other options
	fixedRowsTopInfoSpan.innerText = fixedRowsTop + ''
	fixedColumnsTopInfoSpan.innerText = fixedColumnsLeft + ''
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