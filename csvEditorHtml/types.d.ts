
/**
 * some initial vars from the extension when the webview is created
 */
type InitialVars = {
	/**
	 * true: the extension is watching the source file for changes
	 * false: not (e.g. file is not in the workspace or something other)
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
	 * true: information about quoted fields are retained during parsing (for more details see readme), false: information about quoted field is discarded
	 */
	retainQuoteInformation: boolean

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
	 * true: the source csv file is watched for changes. If changes happen the user is notified (maybe the table is automatically reloaded when the table has no changes). false: not watched the source csv file
	 */
	shouldWatchCsvSourceFile: boolean

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
	 * the paste mode/behavior
	 * note that the normal processing is done by handsontable (sheet.js) and we just join the cells back again
	 *
	 * normal: normal paste (rows and columns are respected),
	 * onlyKeepRowSeparators: only keep row separators (ignore column separators) (every row will have 1 column),
	 * onlyKeepColumnSeparators: only keep column separators (ignore row separators) (only 1 row will be pasted),
	 * ignoreAllSeparators: always paste into a single cell (ignoring row and column separator)"
	 */
	pasteMode: "normal" | "onlyKeepRowSeparators" | "onlyKeepColumnSeparators" | "ignoreAllSeparators"

	/**
	 * sets the font family usesd in the table
	 * default: use the default font
	 * sameAsCodeEditor: use the same font family as the code editor
	 */
	fontFamilyInTable: "default" | "sameAsCodeEditor"
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

	/**
	 * true: information about quoted fields are retained during parsing and written to output(for more details see readme), false: information about quoted field is discarded
	 */
	retainQuoteInformation: boolean
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

type PostMessage = ReadyMessage | DisplayMessageBoxMessage | OverwriteFileMessage | CopyToClipboardMessage | SetEditorHasChangesMessage

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
	outLineIndexToCsvLineIndexMapping: number[] | null
	outColumnIndexToCsvColumnIndexMapping: number[][] | null
	originalContent: string
}

type NumbersStyle = {
	key: 'en' | 'non-en'
	regex: RegExp
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



interface ParseResult {
	data: Array<any>;
	errors: Array<ParseError>;
	meta: ParseMeta;
	outLineIndexToCsvLineIndexMapping: number[] | undefined
	outColumnIndexToCsvColumnIndexMapping: number[][] | undefined
}

interface ParseConfig {
	calcLineIndexToCsvLineIndexMapping: boolean
	calcColumnIndexToCsvColumnIndexMapping: boolean
}

type HotCellPos = {
	rowIndex: number
	colIndex: number
}

type HotViewportOffsetInPx = {
	top: number
	left: number
}

