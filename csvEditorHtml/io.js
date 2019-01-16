
/*
 * everything for communication or read / write
 */

 /**
	* 
	* @returns {string[][]} the current data in the handson table
	*/
function getData() {
	//hot.getSourceData() returns the original data (e.g. not sorted...)
	return hot.getData()
}

/**
 * return the data in the handson table as a string (with respect to the write options)
 * if comments are enabled the commentLinesBefore and commentLinesAfter are also used
 * @param {any} csvWriteOptions 
 * @returns {string} 
 */
function getDataAsCsv(csvWriteOptions) {
	const data = getData()

	if (csvWriteOptions.newline === '') {
		csvWriteOptions.newline = newLineFromInput
	}

	console.log(csvWriteOptions);


	if (csvWriteOptions.header) {


		//write the header...
		if (hot.getSettings().colHeaders === defaultColHeaderFunc) {
			//default headers... because the actual header string is html we need to generate the string only column headers
			data.unshift(hot.getColHeader().map((p, index) => getSpreadsheetColumnLabel(index)))
		}
		else {
			data.unshift(hot.getColHeader())
		}
		


		
		
	}
	
	
	let dataAsString = csv.unparse(data, csvWriteOptions)

	if (csvWriteOptions.comments) {

		if (commentLinesBefore.length > 0) {
			dataAsString = commentLinesBefore.map(p => csvWriteOptions.comments + p).join(csvWriteOptions.newline) + csvWriteOptions.newline + dataAsString
		}
		
		if (commentLinesAfter.length > 0) {
			dataAsString = dataAsString + csvWriteOptions.newline + commentLinesAfter.map(p => csvWriteOptions.comments + p).join(csvWriteOptions.newline)
		}
		
	}

	return dataAsString
}



/**
 * parses the content as csv
 * also fills the commentLinesBefore and commentLinesAfter array if comments is enabled
 * on error the errors are displayed and null is returned
 * @param {string} content 
 * @returns {string[][] | null}
 */
function parseCsv(content, csvReadOptions) {

	const parseResult = csv.parse(content, csvReadOptions)

	if (parseResult.errors.length > 0) {
		//TODO display
		return null
	}
	csvWriteOptions.delimiter = parseResult.meta.delimiter
	newLineFromInput = parseResult.meta.linebreak

	if (csvReadOptions.comments) {
		commentLinesBefore = []
		commentLinesAfter = []
		let lines = content.split(newLineFromInput)
		let inBeforeLineRange = true
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];

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

	return parseResult.data
}

/* --- messages back to vs code --- */

function postVsError(text) {
	vscode.postMessage({
		command: 'error',
		content
	})
}

function postOverwriteFile(csvContent) {
	vscode.postMessage({
		command: 'overwrite',
		csvContent
	})
}