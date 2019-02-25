
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
function parseCsv(content: string, csvReadOptions: CsvReadOptions): [string[], string[][], string[]] | null {


	if (content === '') {
		content = defaultCsvContentIfEmpty
	}

	const parseResult = csv.parse(content, {
		...csvReadOptions,
		comments: csvReadOptions.comments === false ? '' : csvReadOptions.comments,
	})

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

	readDelimiterTooltip.setAttribute('data-tooltip', `${readDelimiterTooltipText} (detected: ${defaultCsvWriteOptions.delimiter})`)

	const commentLinesBefore = []
	const commentLinesAfter = []

	if (csvReadOptions.comments) {

		let lines = content.split(newLineFromInput)
		let inBeforeLineRange = true
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();

			if (inBeforeLineRange) {

				if (line.startsWith(csvReadOptions.comments)) {
					commentLinesBefore.push(line.substring(csvReadOptions.comments.length))
					continue
				}

				if (line === '') {
					continue
				}

				inBeforeLineRange = false
			}
			else {

				if (line.startsWith(csvReadOptions.comments)) {
					commentLinesAfter.push(line.substring(csvReadOptions.comments.length))
					continue
				}
			}
		}
	}

	return [
		commentLinesBefore,
		parseResult.data,
		commentLinesAfter
	]
}


/**
 * 
 * @returns {string[][]} the current data in the handson table
 */
function getData(): string[][] {
	//hot.getSourceData() returns the original data (e.g. not sorted...)
	return hot.getData()
}

/**
 * return the data in the handson table as a string (with respect to the write options)
 * if comments are enabled the commentLinesBefore and commentLinesAfter are also used
 * @param {any} csvWriteOptions 
 * @returns {string} 
 */
function getDataAsCsv(csvWriteOptions: CsvWriteOptions): string {
	const data = getData()

	if (csvWriteOptions.newline === '') {
		csvWriteOptions.newline = newLineFromInput
	}

	if (csvWriteOptions.header) {

		//write the header...

		const colHeaderCells = hot.getColHeader() as string[]
		//@ts-ignore
		if (hot.getSettings().colHeaders === defaultColHeaderFunc) {
			//default headers... because the actual header string is html we need to generate the string only column headers
			data.unshift(colHeaderCells.map((p: string, index: number) => getSpreadsheetColumnLabel(index)))
		}
		else {
			data.unshift(colHeaderCells)
		}
	}

	
	const _conf: import('papaparse').UnparseConfig = {
		...csvWriteOptions,
		quotes: csvWriteOptions.quoteAllFields,
	}

	//not documented in papaparse...
	//@ts-ignore
	_conf['skipEmptyLines'] = false

	let dataAsString = csv.unparse(data, _conf)

	if (csvWriteOptions.comments) {

		const beforeCommentsTextarea = _getById(beforeCommentsTextareaId) as HTMLTextAreaElement
		const afterCommentsTextarea = _getById(afterCommentsTextareaId) as HTMLTextAreaElement

		const commentLinesBefore = beforeCommentsTextarea.value.length > 0
			? beforeCommentsTextarea.value.split('\n')
			: []
		const commentLinesAfter = afterCommentsTextarea.value.length > 0
			? afterCommentsTextarea.value.split('\n')
			: []

		if (commentLinesBefore.length > 0) {
			dataAsString = commentLinesBefore.map(p => csvWriteOptions.comments + p).join(csvWriteOptions.newline) + csvWriteOptions.newline + dataAsString
		}

		if (commentLinesAfter.length > 0) {
			dataAsString = dataAsString + csvWriteOptions.newline + commentLinesAfter.map(p => csvWriteOptions.comments + p).join(csvWriteOptions.newline)
		}

	}

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
 * called from ui
 * @param saveSourceFile 
 */
function postApplyContent(saveSourceFile: boolean) {
	const csvContent = getDataAsCsv(defaultCsvWriteOptions)

	//used to clear focus... else styles are not properly applied
	//@ts-ignore
	if (document.activeElement !== document.body) document.activeElement.blur();

	_postApplyContent(csvContent, saveSourceFile)
}
/**
 * called to save the current edit state back to the file
 * @param csvContent 
 * @param saveSourceFile 
 */
function _postApplyContent(csvContent: string, saveSourceFile: boolean) {

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

function handleVsCodeMessage(event: { data: ReceivedMessageFromVsCode }) {
	const message = event.data

	switch (message.command) {

		case 'csvUpdate': {

			initialContent = message.csvContent
			resetData(initialContent, defaultCsvReadOptions)

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