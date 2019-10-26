
/*
 * everything for communication or read / write
 */


/**
* parses the content as csv
* also fills the commentLinesBefore and commentLinesAfter array if comments is enabled
* commentLinesAfter contains all comments after the commentLinesBefore (this includes comments in the data)
* on error the errors are displayed and null is returned
* @param {string} content 
* @returns {[string[], string[][], string[]]| null} [0] comments before, [1] csv data, [2] comments after
*/
function parseCsv(content: string, csvReadOptions: CsvReadOptions): string[][] | null {

	if (content === '') {
		content = defaultCsvContentIfEmpty
	}

	//comments are parses as normal text, only one cell is added
	const parseResult = csv.parse(content, {
		...csvReadOptions,
		comments: false, //false gives use all lines we later check each line if it's a comment to merge the cells in that row
		rowInsertCommentLines_commentsString: typeof csvReadOptions.comments === 'string' ? csvReadOptions.comments : null,
		// fastMode: false //monkeypatch must work with normal and fast mode...
	} as any)

	

	if (parseResult.errors.length === 1 && parseResult.errors[0].type === 'Delimiter' && parseResult.errors[0].code === 'UndetectableDelimiter') {
		//this is ok papaparse will default to ,
	}
	else {
		if (parseResult.errors.length > 0) {
			for (let i = 0; i < parseResult.errors.length; i++) {
				const error = parseResult.errors[i];

				if (error.type === 'Delimiter' && error.code === 'UndetectableDelimiter') {
					//
					continue;
				}

				if (error.row) {
					_error(`${error.message} on line ${error.row}`)
					continue
				}

				_error(`${error.message}`)
			}

			return null
		}
	}

	defaultCsvWriteOptions.delimiter = parseResult.meta.delimiter
	newLineFromInput = parseResult.meta.linebreak

	readDelimiterTooltip.setAttribute('data-tooltip', `${readDelimiterTooltipText} (detected: ${defaultCsvWriteOptions.delimiter.replace("\t", "⇥")})`)

	return parseResult.data
}


/**
 * 
 * @returns {string[][]} the current data in the handson table
 */
function getData(): string[][] {
	//hot.getSourceData() returns the original data (e.g. not sorted...)

	if (!hot) throw new Error('table was null')

	return hot.getData()
}

/**
 * if we have an header row already it is ignored here!!
 */
function getFirstRowWithIndex(skipCommentLines: boolean = true): HeaderRowWithIndex | null {
	if (!hot) return null

	const rowCount = hot.countRows()
	if (rowCount === 0) return null

	let firstDataRow: string[] = []
	let rowIndex = -1

	for (let i = 0; i < rowCount; i++) {
		const row = hot.getDataAtRow(i)
		if (row.length === 0) continue
		
		if (skipCommentLines && isCommentCell(row[0], defaultCsvReadOptions)) continue

		firstDataRow = [...row] //make a copy to not get a reference
		rowIndex = i
		break
	}

	if (rowIndex === -1) {
		return null
	}

	return {
		physicalIndex: rowIndex,
		row: firstDataRow
	}
}

function getFirstRowWithIndexByData(data: string[][], skipCommentLines: boolean = true): HeaderRowWithIndex | null {

	const rowCount = data.length
	if (rowCount === 0) return null

	let firstDataRow: string[] = []
	let rowIndex = -1

	for (let i = 0; i < rowCount; i++) {
		const row = data[i]
		if (row.length === 0) continue
		
		if (skipCommentLines && isCommentCell(row[0], defaultCsvReadOptions)) continue

		firstDataRow = [...row] //make a copy to not get a reference
		rowIndex = i
		break
	}

	if (rowIndex === -1) {
		return null
	}

	return {
		physicalIndex: rowIndex,
		row: firstDataRow
	}
}

/**
 * return the data in the handson table as a string (with respect to the write options)
 * if comments are enabled the commentLinesBefore and commentLinesAfter are also used
 * @param {any} csvReadOptions used to check if a row is a comment
 * @param {any} csvWriteOptions 
 * @returns {string} 
 */
function getDataAsCsv(csvReadOptions: CsvReadOptions, csvWriteOptions: CsvWriteOptions): string {
	const data = getData()

	if (csvWriteOptions.newline === '') {
		csvWriteOptions.newline = newLineFromInput
	}

	const _conf: import('papaparse').UnparseConfig = {
		...csvWriteOptions,
		quotes: csvWriteOptions.quoteAllFields,
	}

	if (csvWriteOptions.header) {

		//write the header...
		if (!hot) throw new Error('table was null')

		if (headerRowWithIndex === null) {
			const colHeaderCells = hot.getColHeader() as string[]
			//default headers... because the actual header string is html we need to generate the string only column headers
			data.unshift(colHeaderCells.map((p: string, index: number) => getSpreadsheetColumnLabel(index)))
		}
		else {

			if (headerRowWithIndex === null) {
				throw new Error('header row was null')
			}

			data.unshift(headerRowWithIndex.row.map<string>((val) => val !== null ? val : ''))
		}
	}

	for (let i = 0; i < data.length; i++) {
		const row = data[i];

		if (row[0] === null) continue //e.g. when we add a new empty row

		if (typeof csvReadOptions.comments === 'string'
			&& typeof csvWriteOptions.comments === 'string'
			&& isCommentCell(row[0], csvReadOptions)) { 
			//this is a comment

			//we expanded comment rows to have the max length
			//we monkeypatched papaparse so that comments are treated as normal text (1 cell)
			//so just take the first cell/column

			const index = row[0].indexOf(csvReadOptions.comments)
			//trim left else papaparse (and probably other programs) will not recognize the comment anymore...
			row[0] = `${row[0].substring(0, index)}${csvWriteOptions.comments}${row[0].substring(index+csvReadOptions.comments.length)}`.trimLeft().replace(/\n/mg, "")

		}

	}


	//not documented in papaparse...
	//@ts-ignore
	_conf['skipEmptyLines'] = false
	//a custom param
	//@ts-ignore
	_conf['rowInsertCommentLines_commentsString'] = typeof csvWriteOptions.comments === 'string' ? csvWriteOptions.comments : null

	let dataAsString = csv.unparse(data, _conf)

	return dataAsString
}


/* --- messages back to vs code --- */

/**
 * called to display the given text in vs code 
 * @param text 
 */
function postVsInformation(text: string) {

	if (!vscode) {
		console.log(`postVsInformation (but in browser)`)
		return
	}

	vscode.postMessage({
		command: 'msgBox',
		type: 'info',
		content: text
	})
}
/**
 * called to display the given text in vs code 
 * @param text 
 */
function postVsWarning(text: string) {

	if (!vscode) {
		console.log(`postVsWarning (but in browser)`)
		return
	}

	vscode.postMessage({
		command: 'msgBox',
		type: 'warn',
		content: text
	})
}
/**
 * called to display the given text in vs code 
 * @param text 
 */
function postVsError(text: string) {

	if (!vscode) {
		console.log(`postVsError (but in browser)`)
		return
	}

	vscode.postMessage({
		command: 'msgBox',
		type: 'error',
		content: text
	})
}

/**
 * called to copy the text to the clipboard through vs code
 * @param text the text to copy
 */
function postCopyToClipboard(text: string) {

	if (!vscode) {
		console.log(`postCopyToClipboard (but in browser)`)
		return
	}

	vscode.postMessage({
		command: 'copyToClipboard',
		text
	})
}

/**
 * called to change the editor title through vs code
 * @param text the new title
 */
function postSetEditorHasChanges(hasChanges: boolean) {

	_setHasUnsavedChangesUiIndicator(hasChanges)

	if (!vscode) {
		console.log(`postSetEditorHasChanges (but in browser)`)
		return
	}

	vscode.postMessage({
		command: 'setHasChanges',
		hasChanges
	})
}

/**
 * called to save the current edit state back to the file
 * @param csvContent 
 * @param saveSourceFile 
 */
function _postApplyContent(csvContent: string, saveSourceFile: boolean) {

	_setHasUnsavedChangesUiIndicator(false)

	if (!vscode) {
		console.log(`_postApplyContent (but in browser)`)
		return
	}

	vscode.postMessage({
		command: 'apply',
		csvContent,
		saveSourceFile
	})
}

function _postReadyMessage() {
	if (!vscode) {
		console.log(`_postReadyMessage (but in browser)`)
		return
	}

	startReceiveCsvProgBar()

	vscode.postMessage({
		command: 'ready'
	})
}

function handleVsCodeMessage(event: { data: ReceivedMessageFromVsCode }) {
	const message = event.data

	switch (message.command) {

		case 'csvUpdate': {

			if (typeof message.csvContent === 'string') {
				onReceiveCsvContentSlice({
					text: message.csvContent,
					sliceNr: 1,
					totalSlices: 1
				})

			} else {
				onReceiveCsvContentSlice(message.csvContent)
			}

			break
		}

		case "applyPress": {
			postApplyContent(false)
			break
		}

		case 'applyAndSavePress': {
			postApplyContent(true)
			break
		}

		default: {
			_error('received unknown message from vs code')
			break
		}
	}

}
function onReceiveCsvContentSlice(slice: StringSlice) {

	// console.log(`received slice ${slice.sliceNr}/${slice.totalSlices}`)
	if (slice.sliceNr === 1) {
		initialContent = ''
		statusInfo.innerText = `Receiving csv...`
	}

	initialContent += slice.text
	receivedCsvProgBar.value = slice.sliceNr * 100 / slice.totalSlices
	// console.log(`% = ${receivedCsvProgBar.value}`)

	if (slice.sliceNr === slice.totalSlices) {
		// intermediateReceiveCsvProgBar() //now showing because ui thread is blocked

		stopReceiveCsvProgBar()

		startRenderData()
	}
}

/**
 * performs the last steps to actually show the data (set status, render table, ...)
 * also called on reset data
 */
function startRenderData(){

	statusInfo.innerText = `Rendering table...`

	call_after_DOM_updated(() => {

		resetData(initialContent, defaultCsvReadOptions)
		statusInfo.innerText = `Performing last steps...`
		
		//profiling shows that handsontable calls some column resize function which causes the last hang...
		//status display should be cleared after the handsontable operation so enqueue
		if (!defaultCsvReadOptions._hasHeader) { //when we apply header this will reset the status for us
			setTimeout(() => {
				statusInfo.innerText = '';
			}, 0)
		}
		
	})

}


//from https://www.freecodecamp.org/forum/t/how-to-make-js-wait-until-dom-is-updated/122067/2
function call_after_DOM_updated(fn: any) {
	var intermediate = function () { window.requestAnimationFrame(fn) }
	window.requestAnimationFrame(intermediate)
}