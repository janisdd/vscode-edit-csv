
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
 * generates column labels: column 1, column 2, ....
 * @param index 0 based
 */
function getSpreadsheetColumnLabel(index: number) {
	return `column ${index}`
}


/**
 * removes a row by index
 * @param {number} index 0 based
 */
function removeRow(index: number) {
	hot.alter('remove_row', index)
	checkIfHasHeaderReadOptionIsAvailable()
}

/**
 * removes a column by index
 * @param {number} index the visual column index
 */
function removeColumn(index: number) {
	hot.alter('remove_col', index)

	//we could get 0 cols...
	checkIfHasHeaderReadOptionIsAvailable()

	_resizeMergedColumns()
}

/**
 * adds a new row at the end
 * @param {boolean} selectNewRow true: scrolls to the  new row
 */
function addRow(selectNewRow = true) {

	// const headerCells = hot.getColHeader()
	const numRows = hot.countRows()
	hot.alter('insert_row', numRows) //inserted data contains null but papaparse correctly unparses it as ''
	// hot.populateFromArray(numRows, 0, [headerCells.map(p => '')])

	if (selectNewRow) {
		hot.selectCell(numRows, 0)
	}

	checkIfHasHeaderReadOptionIsAvailable()
}

/**
 * adds a new column at the end
 * @param {boolean} selectNewColumn true: scrolls to the new column
 */
function addColumn(selectNewColumn = true) {

	const numCols = hot.countCols()
	hot.alter('insert_col', numCols) //inserted data contains null but papaparse correctly unparses it as ''

	//we could get 0 cols...
	checkIfHasHeaderReadOptionIsAvailable()

	const pos = hot.getSelected() //undefined or [[startRow, startCol, endRow, endCol], ...] (could select not connected cells...)
	if (pos && pos.length === 1) { //only 1 row selected

		if (selectNewColumn) {
			hot.selectCell(pos[0][0], numCols)
		}
	}

	_resizeMergedColumns()
}

function _resizeMergedColumns() {

	if (typeof hot.getSettings().mergeCells === 'boolean' || !hot.getSettings().mergeCells) return

	const mergedCells: HandsontableMergedCells[] = hot.getSettings().mergeCells as HandsontableMergedCells[]

	const numCols = hot.countCols()

	for (let i = 0; i < mergedCells.length; i++) {
		const mergedCell = mergedCells[i];
		mergedCell.colspan = numCols
	}

	//this breaks stuff (e.g. selection not working after this??)
	// (hot as any).undoRedo.ignoreNewActions = true;

	hot.updateSettings({
		mergeCells: mergedCells
	}, false);

	// (hot as any).undoRedo.ignoreNewActions = false;

}

// function transformIntoCommentRow(rowIndex: number, csvReadOptions: CsvReadOptions): string | null {
	
// 	if (typeof hot.getSettings().mergeCells === 'boolean' || !hot.getSettings().mergeCells) return null

// 	const mergedCells: HandsontableMergedCells[] = hot.getSettings().mergeCells as HandsontableMergedCells[]

// 	const numCols = hot.countCols()

// 	mergedCells.push({
// 		row: rowIndex,
// 		col: 0,
// 		colspan: numCols,
// 		rowspan: 1
// 	})

// 	const rowData = hot.getDataAtRow(rowIndex)

// 	hot.updateSettings({
// 		mergeCells: mergedCells
// 	}, false);


// 	if (typeof csvReadOptions.comments === 'boolean') return null

// 	const newRowText = `${csvReadOptions.comments}${csv.unparse([rowData])}`

// 	return newRowText
// }


/**
 * overwrites a single option
 * warns and returns if the an option name is not found in targetOptions or options
 * @param {*} targetOptions the target options obj
 * @param {*} options the option to take the value from
 * @param {*} optionName the option name
 */
function _setOption<T>(targetOptions: T, options: T, optionName: keyof T) {

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
 * @returns false: force changes (settings want headers but is not possible with data), true: all ok
 */
function checkIfHasHeaderReadOptionIsAvailable(): boolean {

	const data = getData() //this also includes header rows

	const el = _getById('has-header') as HTMLInputElement

	let canSetOption = false

	if (defaultCsvReadOptions._hasHeader) {
		canSetOption = data.length > 1 //we already set this option... 2 somehow works?
	} else {
		canSetOption = data.length > 1 //no header ... to enable header we need 2 rows
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

		return
	}

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