
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
 * @param {number} index 
 */
function removeColumn(index: number) {
	hot.alter('remove_col', index)

	//we could get 0 cols...
	checkIfHasHeaderReadOptionIsAvailable()
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

	//we could get 0 cols...
	checkIfHasHeaderReadOptionIsAvailable()

	const pos = hot.getSelected() //undefined or [[startRow, startCol, endRow, endCol], ...] (could select not connected cells...)
	if (pos && pos.length === 1) { //only 1 row selected
		hot.selectCell(pos[0][0], numCols)
	}
}


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
}


/**
 * parses and displays the given data (csv)
 * @param {string} content 
 */
function readDataAgain(content: string, csvReadOptions: CsvReadOptions) {
	const _data = parseCsv(content, csvReadOptions)

	if (!_data) {
		displayData(_data, [], [])
	}
	else {
		displayData(_data[1], _data[0], _data[2])
	}


	//might be bigger than the current view
	onResizeGrid()
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
		el.setAttribute('disabled', '')
	}
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
		displayOrHideCommentsSections(false)

		toggleReadOptions(true)
		toggleWriteOptions(true)
		togglePreview(true)
		toggleBeforeComments(true)
		toggleAfterComments(true)

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
	})

	const copyWriteOptions = {
		...defaultCsvReadOptions
	}

	setCsvWriteOptionsInitial({
		...copyWriteOptions,
		comments: initialConfig.writeOption_comment,
		delimiter: initialConfig.writeOption_delimiter,
		header: initialConfig.writeOption_hasHeader === 'true' ? true : false,
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
		case 'remember': {
			//TODO
			toggleReadOptions(true)
			break
		}
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
		case 'remember': {
			//TODO
			toggleWriteOptions(true)
			break
		}
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
		case 'remember': {
			//TODO
			togglePreview(true)
			break
		}
		default: {
			_error(`unknown previewOptionsAppearance: ${initialConfig.previewOptionsAppearance}`)
			break;
		}
	}

}

/**
 * called after parsing data
 */
function setupAndApplyInitialConfigPart2(beforeComments: string[], afterComments: string[], initialConfig: CsvEditSettings | undefined) {

	window.addEventListener('message', (event) => {
		handleVsCodeMessage(event)
	})

	if (initialConfig === undefined) {

		//probably in browser here...we already done all stuff
		return
	}

	//apply settings from extension

	switch (initialConfig.beforeCommentsAppearance) {
		case 'always': // display but collapsed
		case 'alwaysExpanded': {
			toggleBeforeComments(initialConfig.beforeCommentsAppearance === 'always')
			break
		}
		case 'never': {
			toggleBeforeComments(false)
			displayOrHideBeforeComments(true)
			break
		}
		case 'onlyOnContent':
		case 'onlyOnContentExpanded': {

			//expand, if we show it manually we probably want to add comments...
			toggleBeforeComments(false)

			if (beforeComments.length === 0) {
				displayOrHideBeforeComments(true)
			}
			break
		}
		default: {
			_error(`unknown beforeCommentsAppearance: ${initialConfig.beforeCommentsAppearance}`)
			break;
		}
	}

	switch (initialConfig.afterCommentsAppearance) {
		case 'always': // display but collapsed
		case 'alwaysExpanded': {
			toggleAfterComments(initialConfig.afterCommentsAppearance === 'always')
			break
		}
		case 'never': {
			toggleAfterComments(false)
			displayOrHideAfterComments(true)
			break
		}
		case 'onlyOnContent':
		case 'onlyOnContentExpanded': {

			//expand, if we show it manually we probably want to add comments...
			toggleAfterComments(false)

			if (beforeComments.length === 0) {
				displayOrHideAfterComments(true)
			}
			break
		}
		default: {
			_error(`unknown afterCommentsAppearance: ${initialConfig.afterCommentsAppearance}`)
			break;
		}
	}

}