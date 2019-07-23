

/**
 * the settings for the plugin
 */
type CsvEditSettings = {

	/**
	 * * true: the cell/row color is changed if the first cell is a comment, (might have negative impact on performance e.g. for large data sets), false: no additional highlighting (comments are still treated as comments)
	 */
	highlightCsvComments: boolean

	/**
	 * if one edits a cell in the last row and presses enter what the editor should do
	 * 
	 * default: default of handson table
	 * createRow: create a new row
	 */
	lastRowEnterBehavior: 'default' | 'createRow'

	/**
	 * if one edits a cell in the last column and presses tab what the editor should do
	 * 
	 * default: default of handson table
	 * createColumn: create a new column
	 */
	lastColumnTabBehavior: 'default' | 'createColumn'

	/**
	 * the appearance of the read option section
	 * expanded: read options will always start expanded
	 * collapsed: read options will always start collapsed
	 * remember: read options will use the last state (across all edit session, we use the latest)
	 */
	readOptionsAppearance: 'expanded' | 'collapsed' //| 'remember'
	/**
	 * the appearance of the write option section
	 * 
	 * 
	 * same as readOptionsAppearance but for write options
	 */
	writeOptionsAppearance: 'expanded' | 'collapsed' //| 'remember'
	/**
	 * the appearance of the preview section
	 * 
	 * 
	  same as readOptionsAppearance but for preview
	 */
	previewOptionsAppearance: 'expanded' | 'collapsed' //| 'remember'



	/**
	 * the delimiter to use, empty string to auto detect
	 */
	readOption_delimiter: string

	/**
	 * the string used as comment, empty string to thread every line as data line (no comments)
	 */
	readOption_comment: string

	/**
	 * the string used to quote fields
	 */
	readOption_quoteChar: string

	/**
	 * the string used to escape the quote character within a field
	 */
	readOption_escapeChar: string

	/**
 * true: first row is the header row
 * false: first row is a normal data row
 * 
 * we use a string in case we want to add other options...
 */
	readOption_hasHeader: 'true' | 'false'


	/**
	 * true: export header as row
	 * false: not
	 * 
	 * we use a string in case we want to add other options...
	 */
	writeOption_hasHeader: 'true' | 'false'

	/**
	 * the delimiter to use, empty string to auto detect
	 */
	writeOption_delimiter: string

	/**
	 * the string used as comment, empty string to exclude comments
	 */
	writeOption_comment: string

	/**
	 * the string used to quote fields
	 */
	writeOption_quoteChar: string

	/**
	 * the string used to escape the quote character within a field
	 */
	writeOption_escapeChar: string

	/**
	 * normally the columns are auto sized, if we click on the handle when it has auto size then its with is set to this value (in px). Useful if we have a very wide column (wider than the screen and quickly want to shrink it)
	 */
	doubleClickColumnHandleForcedWith: number

	/**
	 * true: opens the source file after apply, false: keep the editor displayed
	 */
	openSourceFileAfterApply: boolean

	/**
	 * true: select the text inside the cell (note you can also select the cell and start typings to overwrite the cell value), false: cursor starts at the end of the text
	 */
	selectTextAfterBeginEditCell: boolean

	/**
	 * true: to always quote fields, false: not (only if necessary)
	 */
	quoteAllFields: boolean

	/**
	 * true: Initially hides rows with comments found in the table, false: not hide rows with comments
	 */
	initiallyHideComments: boolean
}

/* --- frontend settings --- */


type CsvReadOptions = {
	/**
	 * always use false to get an array of arrays
	 */
	header: false,
	/**
	 * the string used for comments in the input
	 * or false to treat comments as normal rows
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
	 * the escape char
	 */
	escapeChar: string
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
	_hasHeader: boolean
}


type CsvWriteOptions = {
	/**
	 * true to write a header to the file
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
	/**
	 * the escape string used to escape the quote char
	 */
	escapeChar: string

	/**
	 * true: to always quote fields, false: not (only if necessary)
	 */
	quoteAllFields: boolean
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
 * used to update the csv string we use to build the table (changes will be lost!!)
 */
type CsvUpdateMessage = {
	command: 'csvUpdate'
	csvContent: string | StringSlice
}

/**
 * the web view should call the handler of the apply button (emulate press)
 */
type RequestApplyPressMessage = {
	command: "applyPress"
}
/**
 * the web view should call the handler of the apply and save button (emulate press)
 */
type RequestApplyAndSavePressMessage = {
	command: 'applyAndSavePress'
}
type ReceivedMessageFromVsCode = CsvUpdateMessage | RequestApplyPressMessage | RequestApplyAndSavePressMessage

/**
 * send by the webview indicating that it has rendered and the webview has set up the listener to receive content
 */
type ReadyMessage = {
	command: 'ready'
}

/**
 * msg from the webview when it finished rendering and can receive messages
 */
type DisplayMessageBoxMessage = {
	command: 'msgBox'
	type: 'info' | 'warn' | 'error'
	content: string
}

type OverwriteFileMessage = {
	command: 'apply'
	csvContent: string
	saveSourceFile: boolean
}

type CopyToClipboardMessage = {
	command: 'copyToClipboard'
	text: string
}

type PostMessage = ReadyMessage | DisplayMessageBoxMessage | OverwriteFileMessage | CopyToClipboardMessage

type VsState = {
	readOptionIsCollapsed: boolean
	writeOptionIsCollapsed
	previewIsCollapsed: boolean
}

type VsExtension = {
	postMessage: (message: PostMessage) => void
	setState: (newState: VsState) => void
	getState: () => VsState | undefined
}


type HandsontableMergedCells = {
	/**
	 * zero based start index
	 */
	row: number
	/**
	 * zero based start index
	 */
	col: number

	/**
	 * the length in rows to span
	 */
	rowspan: number
	/**
	 * the length in cols to span
	 */
	colspan: number
}

type StringSlice = {
	text: string
	sliceNr: number
	totalSlices: number
}

type HeaderRowWithIndex = {
	row: Array<string | null>
	physicalIndex: number
}

type MergedCellDef = {
	row: number
	col: number
	rowspan: number
	colspan: number
}
