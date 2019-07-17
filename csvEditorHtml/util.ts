
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
 * ensures that all rows inside data have the same length
 * this also trims all cell values
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

		if (row.length > 0 && row[0].trim().startsWith(csvReadConfig.comments)) {
			commentIndices.push(i)
		}
	}
	return commentIndices
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

	if (!hot) throw new Error('table was null')

	hot.alter('remove_row', index)
	checkIfHasHeaderReadOptionIsAvailable()
}

/**
 * removes a column by index
 * @param {number} index the visual column index
 */
function removeColumn(index: number) {

	if (!hot) throw new Error('table was null')

	hot.alter('remove_col', index)

	//keep header in sync with the number of columns
	if (headerRow) {
		headerRow.splice(index,1)
	}

	//we could get 0 cols...
	checkIfHasHeaderReadOptionIsAvailable()

	rerenderColumns()
}

/**
 * after some actions e.g. inserting/removing rows we need to correct the header column text
 */
function rerenderColumns() {

	if (!hot) throw new Error('table was null')

	if (defaultCsvReadOptions._hasHeader && headerRow) {
		const data = headerRow

		hot.updateSettings({
			colHeaders: data.map((col, index) => defaultColHeaderFunc(index, col))
		}, false)

	} else {
		hot.updateSettings({
			colHeaders: defaultColHeaderFunc as any
		}, false)
	}
}

function commentValueRenderer(instance: Handsontable, td: HTMLTableDataCellElement, row: number, col: number, prop: any, value: string | null, cellProperties: any) {
	//@ts-ignore
	Handsontable.renderers.TextRenderer.apply(this, arguments);

	// console.log(value)

	if (cellProperties._isComment) {
		td.classList.add('comment-cell')
	} else {
		// td.style.backgroundColor = ''
	}

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
 * @returns false: force changes (settings want headers but is not possible with data), true: all ok
 */
function checkIfHasHeaderReadOptionIsAvailable(): boolean {

	const data = getData() //this also includes header rows

	const el = _getById('has-header') as HTMLInputElement

	let canSetOption = false

	if (defaultCsvReadOptions._hasHeader) {
		canSetOption = data.length >= 1 //we have +1 row because header option is enabled
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

	if (initialConfig.hideCommentsInitially) {
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