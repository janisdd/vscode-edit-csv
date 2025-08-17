/**
 * some initial vars from the extension when the webview is created
 */
type InitialVars = {
	/**
	 * if the source csv file should be watched for changes (only to set the ui)
	 * the state is determined by {@link EditCsvConfig.shouldWatchCsvSourceFile}
	 */
	isWatchingSourceFile: boolean
	/**
	 * the cursor line position in the source file (if set we want to pre select this line in the table)
	 */
	sourceFileCursorLineIndex: number | null
	/**
	 * the cursor column position in the source file (if set we want to pre select this column in the table)
	 * clamped to line length - 1
	 * 
	 * for this we actually need {@link sourceFileCursorLineIndex} because we might have a multi text line csv row (we need to add the lengths)
	 */
	sourceFileCursorColumnIndex: number | null

	/**
	 * true: cursor is after the last column pos (not a real string index)
	 */
	isCursorPosAfterLastColumn: boolean


	/**
	 * if the table should be opened at the cursor position and select the corresponding csv cell
	 */
	openTableAndSelectCellAtCursorPos: EditCsvConfig['openTableAndSelectCellAtCursorPos']

	/**
	 * the detected os
	 * used for e.g. key bindings (specifically open detected link in browser)
	 */
	os: 'win' | 'mac' | 'linux' | 'web'
}

/**
 * type used for overwriting the configuration/settings
 * if we supply the setting, we need to have the right type
 */
type EditCsvConfigOverwrite = {
	[key in keyof Omit<EditCsvConfig, 'hideOpenCsvEditorUiActions'>]?: Omit<EditCsvConfig, 'hideOpenCsvEditorUiActions'>[key]
}

/**
 * the settings for the plugin
 */
type EditCsvConfig = {

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
	 * if a cell in the last row (or first) is selected and one presses arrow down or (enter in cell editor), what should happen?
	 * 
	 * wrap: the next cell in the first row (or last) should be selected (wrap)
	 * stop: the selection should stay the same (stop)
	 */
	lastRowOrFirstRowNavigationBehavior: 'wrap' | 'stop'

	/**
	 * if a cell in the last column (or first) is selected and one presses arrow right or tab, what should happen?
	 * wrap: the first cell in the next row should be selected (wrap)
	 * stop: the selection should stay the same (stop)
	 */
	lastColumnOrFirstColumnNavigationBehavior: 'wrap' | 'stop'

	/**
	 * the appearance of the (top) option bar
	 * expanded: option bar will always start expanded
	 * collapsed: option bar will always start collapsed
	 * remember: option bar will use the last state (across all edit session, we use the latest)
	 */
	optionsBarAppearance: 'expanded' | 'collapsed' //| 'remember'

	/**
	 * the delimiter to use, empty string to auto detect
	 */
	readOption_delimiter: string

	/**
	 * the delimiters to guess automatically
	 */
	readOption_delimitersToGuess: string[]

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
 * Allowing both has some problems when when toggling this option in the ui...
 * 
 * we use a string in case we want to add other options...
 */
	readOption_hasHeader: 'true' | 'false'

	/**
	 * true: tries to guess if the csv file has a header line, false: not.
	 * Note: This only sets the has header option to true, but never to false
	 */
	tryToGuessHasHeader: boolean

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
	 * normally the rows are auto sized. If we click on the handle when it has auto size, its height is set to this value (in px). Useful if we have a very tall rows (wider than the screen and quickly want to shrink it). Also controls which size is displayed in the context menu for resizing rows (Default value gives you 5 rows with the default font size).
	 */
	doubleClickRowHandleForcedHeight: number

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
	 * whether null, undefined and empty values should be quoted (takes precedence over quoteAllFields)
	 * true: quote null, undefined and empty string values (takes precedence over quoteAllFields), false: not
	 * we use an enum in case we later want to add some values (e.g. take retain quote information into account)
	 */
	quoteEmptyOrNullFields: 'true' | 'false',

	/**
	 * true: initially hides rows with comments found in the table, false: not hide rows with comments
	 */
	initiallyHideComments: boolean

	/**
	 * true: cell content is wrapped and the row height is changed, false: no wrapping (content is hidden)
	 */
	enableWrapping: boolean

	/**
	 * the initial width for columns, 0 or a negative number will disable this and auto column size is used on initial render
	 */
	initialColumnWidth: number

	/**
	 * true: auto sizing columns will ignore comments, false: auto sizing columns will take comments into account
	 * e.g. with double click on column handle
	 * NOTE that cell values are trimmend and checked if the value starts with the comment string
	 */
	autoColumnWidthsIgnoreComments: boolean

	/**
	 * determines how the quote information is tracked across cells. NOTE: This only sets quotes for cells, but never prevents quotes from being added (so as not to interfere with other quote-related settings)
	 * 
	 * none: do not retain any quote information
	 * determineByColumns: is determined by the first cell in the same column (as the cell in question)
	 * full: track the quote information for every cell individually
	 */
	retainQuoteInformation: 'none' | 'determinedByColumns' | 'full'

	/**
	 * true: if a csv field begins with whitespace, it should always be enclosed in quotes, false: not"
	 */
	forceQuoteLeadingWhitespace: boolean

	/**
	 * true: if a csv field ends with whitespace, it should always be enclosed in quotes, false: not
	 */
	forceQuoteTrailingWhitespace: boolean

	/**
	 * true: new columns will get true as quote information (also for added columns via expanding), false: new columns will get false as quote information
	 */
	newColumnQuoteInformationIsQuoted: boolean

	/**
	 * true: borders are set to 0 (in css). This helps if you encounter some border color issues, false: normal borders
	 */
	disableBorders: boolean

	/**
	 * the first X rows are pinned so they will stay in view even if you scroll. This option and readOption_hasHeader are mutually exclusive
	 */
	initiallyFixedRowsTop: number

	/**
	 * the first X columns are pinned so they will stay in view even if you scroll. This option and readOption_hasHeader are mutually exclusive
	 */
	initiallyFixedColumnsLeft: number

	/**
	 * the font size in px, 0 or -x to sync the font size with the editor, +x to overwrite the font size (changing will rerender the table)
	 */
	fontSizeInPx: number

	/**
	 * true: show column names with letters e.g. A, B, ..., Z (like Excel), false: use numbers for column names e.g. 1, 2, ...
	 */
	showColumnHeaderNamesWithLettersLikeExcel: boolean //we use the bloaty name because we want to find (via search) this with something like "excel" or "letters"

	/**
	 * if the source csv file should be watched for changes
	 * 
	 * no: do not watch the source csv file for changes
	 * yesAndNotify: the source csv file is watched for changes and you will be notified if the source file is changed
	 * yesAndAutoReload: the source csv file is watched for changes and new data is automatically loaded, overwriting existing changes (no undo!)
	 * 
	 */
	shouldWatchCsvSourceFile: 'no' | 'yesAndNotify' | 'yesAndAutoReload'

	/**
	 * the appearance of the side panel
	 * expanded: side panel will always start expanded
	 * collapsed: side panel will always start collapsed
	 */
	sidePanelAppearance: 'expanded' | 'collapsed'

	/**
	 * the initial numbers style for the side panel (can be changed later through the ui)
	 * en: decimal separator is '.' e.g. 3.14
	 * non-en: decimal separator is ',' e.g. 3,14
	 */
	initialNumbersStyle: 'en' | 'non-en'

	/**
	 * which cell should be focused or selected when a new row is inserted (above or below)
	 * focusFirstCellNewRow: focus the first cell in the new row: 
	 * keepRowKeepColumn: keep the currently selected cell
	 */
	insertRowBehavior: 'focusFirstCellNewRow' | 'keepRowKeepColumn'

	/**
	 * which cell should be focused or selected when a new column is inserted (left or right)
	 * keepRowFocusNewColumn: we stay in the same row but the cell in the new column is selected
	 * keepRowKeepColumn: keep the currently selected cell
	 */
	insertColBehavior: 'keepRowFocusNewColumn' | 'keepRowKeepColumn'

	/**
	 * table should start in readonly mode?
	 * true: table is view only,
	 * false: edit mode (normal)
	 * NOTE that initial fixes (e.g. all rows should have the same length) are applied because readonly is only applied after/during the table is created
	 */
	initiallyIsInReadonlyMode: boolean

	/**
	 * false: hide the edit csv button and the file context menu action to open the editor (useful if you want to call this extension from another extension and show a custom button), 
	 * true: show them
	 * 
	 * NOTE this can be set via other extension BUT has no effect (!) as the setting is used stored in the users config by vs code
	 */
	hideOpenCsvEditorUiActions: boolean

	/**
	 * if the table should be opened at the cursor position and select the corresponding csv cell
	 *
	 * initialOnly_correctRowAlwaysFirstColumn: (initial only) select the correct row at the cursor position but always select the first column
	 * initialOnly_correctRowAndColumn: only opens the table at the cursor position (cell) the first time the table is opened
	 * never: open the table at the top left corner
	 */
	openTableAndSelectCellAtCursorPos: "initialOnly_correctRowAlwaysFirstColumn" | "initialOnly_correctRowAndColumn" | "never"

	/**
	 * the paste mode
	 * note that the normal processing is done by handsontable (sheet.js) and we just join the cells back again
	 *
	 * normal: normal paste (rows and columns are respected),
	 * onlyKeepRowSeparators: only keep row separators (ignore column separators) (every row will have 1 column),
	 * onlyKeepColumnSeparators: only keep column separators (ignore row separators) (only 1 row will be pasted),
	 * ignoreAllSeparators: always paste into a single cell (ignoring row and column separator)"
	 */
	pasteMode: "normal" | "onlyKeepRowSeparators" | "onlyKeepColumnSeparators" | "ignoreAllSeparators"

	/**
	 * the paste behavior
	 * the paste behaviour to be used (what should happen to the old content)
	 *
	 * overwrite: pasting content overwrites the existing content
	 * overwriteExceptEmpty: pasting content overwrites the existing content except for empty cells (in the pasting content)
	 * shift_down: pasting content shifts the existing content (cells) down
	 * shift_right: pasting content shifts the existing content (cells) to the right
	 */
	pasteBehavior: "overwrite" | "overwriteExceptEmpty" | "shift_down" | "shift_right"

	/**
	 * the paste scroll behavior
	 * 
	 * scrollToLastPastedCell: scrolls to the laste pasted cell
	 * scrollToFirstPastedCell: scrolls to the first pasted cell
	 * dontScroll: don't scroll to the pasted cells
	 * 
	 * note: the cells are always selected after pasting
	 */
	pasteScrollBehavior: "scrollToLastPastedCell" | "scrollToFirstPastedCell" | "dontScroll"

	/**
	 * sets the font family usesd in the table
	 * default: use the default font
	 * sameAsCodeEditor: use the same font family as the code editor
	 */
	fontFamilyInTable: "default" | "sameAsCodeEditor"

	/**
	 * true: shows a delete column button in the column header (on hover), false: not
	 */
	showDeleteColumnHeaderButton: boolean

	/**
	 * true: shows a delete row button in the row header (on hover), false: not
	 */
	showDeleteRowHeaderButton: boolean

	/**
	 * Decides how to handle final new lines when writing the csv data back to the source file
	 * 
	 * sameAsSourceFile: If the source csv file had a new line at the end, the resulting csv will also have one. Otherwise, no final new line will be inserted after the data.
	 * add: Will add a final new line after the csv data
	 * remove: Will not write a final new line after the csv data
	 */
	finalNewLine: "sameAsSourceFile" | "add" | "remove"

	/**
	 * the color used for text in the dark theme (some valid css string)
	 */
	darkThemeTextColor: string
	/**
	 * the color used for text in the light theme  (some valid css string)
	 */
	lightThemeTextColor: string

	/**
	 * true: if a cell contains urls, the urls are displayed as urls and can be clicked on. false: all urls are rendered as normal text
	 */
	convertUrlsToLinkTags: boolean

	/**
	 * Determines whether a handle is displayed on the cell to automatically fill the content
	 * none: Disables drag to auto fill
	 * copyOnly: Adds a drag handle for copying data
	 * excelLike: Adds a drag handle for filling data like excel (numbers, months, dates). Defaults to copying if nothing can be interpolated.
	 */
	dragToAutoFill: "none" | "copyOnly" | "excelLike"

	/**
	 * Specifies the column names that are to be hidden initially (the first row is used, ignoring comment rows)
	 */
	initiallyHiddenColumnNames: string[]

	/**
	 * Specifies the number of column names that are to be hidden initially
	 * vs code does not convert the number strings to real numbers....
	 * 
	 * we use numbers not indices because the columns show numbers not indices
	 */
	initiallyHiddenColumnNumbers: string[]

	/**
	 * Determines whether the save buttons should also indicate unsaved changes (true) or not (false)
	 */
	useSaveButtonsAsAdditionalUnsavedChangesIndicator: boolean

	/**
	 * The string used to join multiple column header names when copying column header names
	 */
	copyColumnHeaderNamesSeparator: string
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

	delimitersToGuess: string[],
	/**
	 * the new line string, use '' for auto detect
	 */
	newline: '' | '\n' | '\r' | '\r\n',
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
	 * also when unparsing empty rows become real rows...
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
	 * this does not apply for null, undefined and empty strings,
	 * {@link quoteEmptyOrNullFields}
	 */
	quoteAllFields: boolean

	/**
	 * true: quote null, undefined and empty strings
	 * this setting takes precedence over {@link quoteAllFields}
	 */
	quoteEmptyOrNullFields: boolean
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

type RequestChangeFontSiteInPxMessage = {
	command: 'changeFontSizeInPx'
	fontSizeInPx: number
}

type SourceFileChangedMessage = {
	command: 'sourceFileChanged'
}

type ReceivedMessageFromVsCode = CsvUpdateMessage | RequestApplyPressMessage | RequestApplyAndSavePressMessage | RequestChangeFontSiteInPxMessage | SourceFileChangedMessage

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

type SetEditorHasChangesMessage = {
	command: 'setHasChanges'
	hasChanges: boolean
}

type SetMultipleCursorsMessage = {
	command: 'setMultipleCursors'
	positions: FilePosition[]
}

type CursorsPosition = {
	startLine: number
	startColumn: number
	endLine: number
	endColumn: number
}

//string index
type FilePosition = {
	startPos: number
	endPos: number
}

type PostMessage = ReadyMessage | DisplayMessageBoxMessage | OverwriteFileMessage | CopyToClipboardMessage | SetEditorHasChangesMessage | SetMultipleCursorsMessage

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

type HandsontableSelection = {
	start: {
		row: number
		col: number
	}
	end: {
		row: number
		col: number
	}
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

/*
 * see https://handsontable.com/docs/6.2.2/demo-searching.html
 */
type HandsontableSearchResult = {
	/**
	 * the visual index
	 */
	row: number

	/**
	 * the physical row index (needed because the visual index depends on sorting (and maybe virtual rendering?))
	 */
	rowReal: number
	/**
 	 * the visual index
	 */
	col: number

	/**
	 * the physical col index (needed because the visual index depends on sorting (and maybe virtual rendering?))
	 */
	colReal: number

	/**
	 * the cell data if any
	 * from source this is: this.hot.getDataAtCell(rowIndex, colIndex);
	 */
	data: null | undefined | string
}

type HeaderRowWithIndex = {
	/**
	 * entries can be null e.g. for new columns
	 * for null we display the column name 'column X' where X is the number of the column
	 * however, after opening the cell editor null becomes the empty string (after committing the value)...
	 * these are visual indices as we use this for rendering...
	 */
	row: Array<string | null>
	/**
	 * the physical row index of the header row
	 * this is needed if we want to insert the header row back into the table (or remove)
	 */
	physicalIndex: number
}

type MergedCellDef = {
	row: number
	col: number
	rowspan: number
	colspan: number
}

/**
 * [row, col, oldValue, newValue]
 */
type CellChanges = [number, number | string, string, string]

type Point = {
	x: number
	y: number
}

type ExtendedCsvParseResult = {
	data: string[][]
	columnIsQuoted: boolean[]
	cellIsQuotedInfo: boolean[][]
	outLineIndexToCsvLineIndexMapping: number[] | null
	outColumnIndexToCsvColumnIndexMapping: number[][] | null
	originalContent: string
	/**
	 * true: original content has a final new line (LR or CRLF does not matter)
	 */
	hasFinalNewLine: boolean
}

type NumbersStyle = {
	key: 'en' | 'non-en'
	regex: RegExp
	/**
	 * same as regex but must match whole string
	 */
	regexStartToEnd: RegExp
	thousandSeparator: RegExp
	/**
	 * the idea is to replace the thousand separators with the empty string (we normally also allow a single whitespace as separator)... else:
	 * e.g. we have en (1.23) and a cell values is 1,2,3
	 * when we just replace the thousand separator (,) with the empty string we get 123
	 * but actually we only use the first number so we expect 1
	 * 
	 * when replacing only this regex e.g. /((\.)\d{3})+/
	 * 1.000,123 -> 1000,123
	 * 1.000 --> 1000
	 * 1.000.000 -> 1000000
	 * 1,2,3 -> 1,2,3
	 * 1,200,3 -> 1200,3 (hm... maybe this should be 2003? for now it's easier the match from left to right and replace)
	 */
	thousandSeparatorReplaceRegex: RegExp
}

type KnownNumberStylesMap = {
	['en']: NumbersStyle
	['non-en']: NumbersStyle
}
type EditHeaderCellAction = {
	actionType: 'changeHeaderCell'
	change: [0, colIndex: number, beforeValue: string, afterValue: string]
}
type RemoveColumnAction = {
	actionType: 'remove_col'
	amount: number
	index: number
	indexes: number[]
	//a table with the removed data
	data: string[][]
}

type InsertColumnAction = {
	actionType: 'insert_col'
}



//TODO remove
interface ParseResult {
	data: Array<any>;
	errors: Array<ParseError>;
	meta: ParseMeta;
	outLineIndexToCsvLineIndexMapping: number[] | undefined
	outColumnIndexToCsvColumnIndexMapping: number[][] | undefined
	
	columnIsQuoted: boolean[]
	cellIsQuotedInfo: boolean[][]
}

type HotCellPos = {
	rowIndex: number
	colIndex: number
}

type HotViewportOffsetInPx = {
	top: number
	left: number
}

type UrlInStringCoords = {
	url: string
	startIndex: number
	endIndex: number
}

type GetDataAsCsvResult = {
	csv: string
	meta: {
		outCsvFieldToInputPositionMapping: FieldPosition[][];
	}
}