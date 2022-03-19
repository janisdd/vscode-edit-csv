
/*
 * everything for communication or read / write
 */


/**
* parses the content as csv
* on error the errors are displayed and null is returned
*/
function parseCsv(content: string, csvReadOptions: CsvReadOptions): ExtendedCsvParseResult | null {

	if (content === '') {
		content = defaultCsvContentIfEmpty
	}

	//comments are parses as normal text, only one cell is added
	const parseResult = csv.parse(content, {
		...csvReadOptions,
		//note this overwrites the comments string from the read config!
		comments: false, //false gives use all lines we later check each line if it's a comment to merge the cells in that row
		//left trimmed lines are comments and if !== null we want to include comments as one celled row (in the ui)
		//papaparse parses comments with this only if the begin with the comment string (no space before!!)
		rowInsertCommentLines_commentsString: typeof csvReadOptions.comments === 'string' && csvReadOptions.comments !== '' ? csvReadOptions.comments : null,
		// fastMode: false //monkeypatch must work with normal and fast mode...
		/**
		 * normally when parsing quotes are discarded as they don't change the retrieved data
		 * true: quote information are returned as part of the parse result, for each column:
		 * 	 true: column was quoted
		 * 	 false: column was not quoted
		 * false: quote information is returned as null or undefined (falsy)
		 * 
		 * to determine if a column is quoted we use the first cell only (if a column has no cells then it's not quoted)
		 * so if the first line has only 3 columns and all other more than 3 (e.g. 4) then all columns starting from 4 are treated as not quoted!!
		 * not that there is no difference if we have column headers (first row is used)
		 * comment rows are ignored for this
		 */
		retainQuoteInformation: true, //we keep true here and decide if we use it whe nwe output data
		calcLineIndexToCsvLineIndexMapping: initialVars.sourceFileCursorLineIndex !== null ? true : false,
		calcColumnIndexToCsvColumnIndexMapping: initialVars.sourceFileCursorColumnIndex !== null ? true : false,
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

				if (typeof error.row === 'number') {
					statusInfo.innerText = `Error`
					const errorMsg = `${error.message} on line ${error.row+1}`
					csvEditorDiv.innerText = errorMsg
					_error(errorMsg) //row is 0 based
					continue
				}

				statusInfo.innerText = `Error`
				const errorMsg = `${error.message}`
				csvEditorDiv.innerText = errorMsg
				_error(errorMsg)
			}

			return null
		}
	}

	defaultCsvWriteOptions.delimiter = parseResult.meta.delimiter
	newLineFromInput = parseResult.meta.linebreak
	updateNewLineSelect()

	readDelimiterTooltip.setAttribute('data-tooltip', `${readDelimiterTooltipText} (detected: ${defaultCsvWriteOptions.delimiter.replace("\t", "⇥")})`)

	//maybe use namespace merging? (didn't work or don't kow how)
	let _parseResult = parseResult as ParseResult
	return {
		data: parseResult.data,
		columnIsQuoted: (parseResult as any).columnIsQuoted,
		outLineIndexToCsvLineIndexMapping: _parseResult.outLineIndexToCsvLineIndexMapping ?? null,
		outColumnIndexToCsvColumnIndexMapping: _parseResult.outColumnIndexToCsvColumnIndexMapping ?? null,
		originalContent: content
	}
}

/*+
* updates the new line select option (same as input) {@link newlineSameSsInputOption} from {@link newLineFromInput}
*/
function updateNewLineSelect() {
	newlineSameSsInputOption.innerText = `${newlineSameSsInputOptionText} (${newLineFromInput === `\n` ? 'LF' : 'CRLF'})`
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
		//custom created option to handle null, undefined and empty string values
		//@ts-ignore
		quoteEmptyOrNullFields: csvWriteOptions.quoteEmptyOrNullFields,
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
	//rowInsertCommentLines_commentsString: trim left comment lines and only export first cell
	//@ts-ignore
	_conf['rowInsertCommentLines_commentsString'] = typeof csvWriteOptions.comments === 'string' ? csvWriteOptions.comments : null

	//@ts-ignore
	_conf['columnIsQuoted'] = csvWriteOptions.retainQuoteInformation ? columnIsQuoted : null

	let dataAsString = csv.unparse(data, _conf)

	return dataAsString
}


/* --- messages back to vs code --- */

/**
 * called to read the source file again
 * @param text 
 */
function postReloadFile() {

	if (!vscode) {
		console.log(`postReloadFile (but in browser)`)
		return
	}

	_postReadyMessage()
}

/**
 * called to display the given text in vs code 
 * @param text 
 */
var postVsInformation = (text: string) => {

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
var postVsWarning = (text: string) => {

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
var postVsError = (text: string) => {

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
		navigator.clipboard.writeText(text)
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

		case 'changeFontSizeInPx': {
			changeFontSizeInPx(message.fontSizeInPx)
			break
		}

		case 'sourceFileChanged': {

			const hasAnyChanges = getHasAnyChangesUi()

			if (!hasAnyChanges && !isReadonlyMode) {
				//just relaod the file because we have no changes anyway...
				reloadFileFromDisk()
				return
			}

			toggleSourceFileChangedModalDiv(true)
			break
		}

		default: {
			_error('received unknown message from vs code')
			notExhaustiveSwitch(message)
			break
		}
	}

}
function onReceiveCsvContentSlice(slice: StringSlice) {

	// console.log(`received slice ${slice.sliceNr}/${slice.totalSlices}`)
	if (slice.sliceNr === 1) {
		initialContent = ''
		statusInfo.innerText = `Receiving csv...`
		csvEditorDiv.innerText = ``
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

	//TODO as we don't longer use undo/redo with has header option this might not be necessary any longer...
	//we need to change defaultCsvReadOptions because the undo/redo might mess up our
	//defaultCsvReadOptions._hasHeader state... so ensure it's in sync with the ui
	if (hasHeaderReadOptionInput.checked) {
		isFirstHasHeaderChangedEvent = true
		defaultCsvReadOptions._hasHeader = true
	} else {
		isFirstHasHeaderChangedEvent = false
		defaultCsvReadOptions._hasHeader = false
	}

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

function notExhaustiveSwitch(x: never): never {
	throw new Error('not exhaustive switch')
}
