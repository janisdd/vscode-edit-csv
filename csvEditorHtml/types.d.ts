

/**
 * the settings for the plugin
 */
type CsvEditSettings = {

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
	 * the appearance of the before comments section if it is not displayed initially you can still display it manually
	 * always: always visible but collapsed 
	 * alwaysExpanded: always visible but expanded
	 * onlyOnContent: displayed if we have before comments but collapsed
	 * onlyOnContentExpanded: displayed if we have before comments but expanded
	 * never: never displayed but comments are still respected (we use write options to decide this)
	 */
	beforeCommentsAppearance: 'always' | 'alwaysExpanded' | 'onlyOnContent' | 'onlyOnContentExpanded' | 'never'
	/**
	 * the appearance of the read option section if it is not displayed initially you can still display it manually
	 * 
	 * same as beforeCommentsAppearance but for after comments
	 */
	afterCommentsAppearance: 'always' | 'alwaysExpanded' | 'onlyOnContent' | 'onlyOnContentExpanded' | 'never'

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
	 * true: opens the source file after commit, false: keep the editor displayed
	 */
	openSourceFileAfterCommit: boolean

	/**
	 * true: select the text inside the cell (note you can also select the cell and start typings to overwrite the cell value), false: cursor starts at the end of the text
	 */
	selectTextAfterBeginEditCell: boolean

	/**
	 * 
	 */
	quoteAllFields: boolean
}

/* --- frontend settings --- */


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


type CsvUpdateMessage = {
	command: 'csvUpdate'
	csvContent: string
}

/**
 * the web view should call the handler of the commit button (emulate press)
 */
type RequestCommitPressMessage = {
	command: 'commitPress'
}
/**
 * the web view should call the handler of the commit and save button (emulate press)
 */
type RequestCommitAndSavePressMessage = {
	command: 'commitAndSavePress'
}
type ReceivedMessageFromVsCode = CsvUpdateMessage | RequestCommitPressMessage | RequestCommitAndSavePressMessage


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