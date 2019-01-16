

function getData() {
	//hot.getSourceData() returns the original data (e.g. not sorted...)
	return hot.getData()
}

function getDataAsCsv() {
	const data = getData()

	if (csvWriteOptions.newline === '') {
		csvWriteOptions.newline = newLineFromInput
	}

	console.log(csvWriteOptions);
	
	let dataAsString = csv.unparse(data, csvWriteOptions)

	console.log(dataAsString)
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
