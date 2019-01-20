


type CsvReadOptions = {
	/**
	 * always use false to get an array of arrays
	 */
	header: false,
	/**
	 * the string used for comments in the input
	 * or false to skip comments
	 */
	comments: false | string,
	/**
	 * the delimiter, use '' for auto detect
	 */
	delimiter: string,
	/**
	 * the new line string, use '' for auto detect
	 */
	newline: string,
	/**
	 * the quote string
	 */
	quoteChar: string,
	/**
	 * if false we have invalid rows ... always only 1 col
	 */
	skipEmptyLines: true,
	/**
	 * keep everything as strings
	 */
	dynamicTyping: false,
	/**
	 * ui props, not part of papaparse options
	 * used to determine if we check/uncheck the has header read option
	 */
	_hasHeader: false
}


type CsvWriteOptions = {
	/**
	 * true to write a header file
	 */
	header: boolean
	/**
	 * the string used to start comments
	 * or false to exclude comments
	 */
	comments: false | string
	/**
	 * the delimiter
	 */
	delimiter: string
	/**
	 * the new line string
	 * or same as input
	 */
	newline: '\n' | '\r\n' | string
	/**
	 * the quote string
	 */
	quoteChar: string
}

type MiscOptions = {

	/**
	 * then we double click on the resize handle auto size is used...
	* if we have a large column and double click on that we want to shrink it to this value...
	* use falsy value to not change the column size
	* double click again will use auto size
	 */
	doubleClickMinColWidth: number
}



/**
 * a message from vs code/extension to the webview
 */
type ShowMessage = {
	command: 'message'
}


type CsvUpdateMessage = {
	command: 'csvUpdate'
	csvContent: string
}


type ReceivedMessageFromVsCode = ShowMessage |  CsvUpdateMessage


type DisplayErrorMessage = {
	command: 'error'
	content: string
}

type OverwriteFileMessage = {
	command: 'commit'
	csvContent: string
	saveSourceFile: boolean
}

type PostMessage = DisplayErrorMessage | OverwriteFileMessage

type VsExtension = {
	postMessage: (message: PostMessage) => void
}