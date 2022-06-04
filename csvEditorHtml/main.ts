/// <reference path="findWidget.ts" />


const defaultInitialVars: InitialVars = {
	isWatchingSourceFile: false,
	sourceFileCursorLineIndex: null,
	sourceFileCursorColumnIndex: null,
	isCursorPosAfterLastColumn: false,
	openTableAndSelectCellAtCursorPos: 'initialOnly_correctRowAlwaysFirstColumn',
}

declare var acquireVsCodeApi: any
declare var initialContent: string
declare var initialConfig: EditCsvConfig | undefined

declare var initialVars: InitialVars

let vscode: VsExtension | undefined = undefined

if (typeof acquireVsCodeApi !== 'undefined') {
	vscode = acquireVsCodeApi()
}

if (typeof initialConfig === 'undefined') {
	// tslint:disable-next-line:no-duplicate-variable
	var initialConfig = undefined as EditCsvConfig | undefined
	// tslint:disable-next-line:no-duplicate-variable
	var initialVars = {
		...defaultInitialVars
	}
}

const csv: typeof import('papaparse') = (window as any).Papa
//handsontable instance
let hot: import('../thirdParty/handsontable/handsontable') | null

//add toFormat to big numbers
//@ts-ignore
toFormat(Big)

/**
 * the default csv content to used if we get empty content
 * handson table will throw if we pass in a 1D array because it expects an object?
 */
const defaultCsvContentIfEmpty = `,\n,`

/**
 * TODO check
 * stores the header row after initial parse...
 * if we have header rows in data (checked) we set this to the header row
 * if we uncheck header row read option then we use this to insert the header row again as data row
 * can be null if we have 0 rows
 * {string[] | null}
 */
let headerRowWithIndex: HeaderRowWithIndex | null = null
let lastClickedHeaderCellTh: Element | null = null
let editHeaderCellTextInputEl: HTMLInputElement | null = null
let editHeaderCellTextInputLeftOffsetInPx: number = 0
let handsontableOverlayScrollLeft: number = 0
let _onTableScrollThrottled: ((this: HTMLDivElement, e: Event) => void) | null = null

let hiddenPhysicalRowIndices: number[] = []

let copyPasteRowLimit = 10_000_000
let copyPasteColLimit = 10_000_000


type HeaderRowWithIndexUndoStackItem = {
	action: 'added' | 'removed'
	visualIndex: number
	headerData: Array<string | null>
}
let headerRowWithIndexUndoStack: Array<HeaderRowWithIndexUndoStackItem> = []
let headerRowWithIndexRedoStack: Array<HeaderRowWithIndexUndoStackItem> = []

/**
 * this is part of the output from papaparse
 * for each column 
 * 	true: column was originally quoted
 * 	false: was not quoted
 * 
 * this is expanded via {@link _normalizeDataArray} so we have information about every column
 * see {@link parseCsv} for quoting rules (e.g. header rows, ...)
 * 
 * so this is set in {@link displayData} and should be kept up-to-date because it's used for unparsing
 */
let columnIsQuoted: boolean[]

//csv reader options + some ui options
//this gets overwritten with the real configuration in setCsvReadOptionsInitial
let defaultCsvReadOptions: CsvReadOptions = {
	header: false, //always use false to get an array of arrays
	comments: '#',
	delimiter: '', //auto detect
	newline: '', //auto detect
	quoteChar: '"',
	escapeChar: '"',
	skipEmptyLines: true,
	dynamicTyping: false,
	_hasHeader: false,
}


//this gets overwritten with the real configuration in setCsvWriteOptionsInitial
let defaultCsvWriteOptions: CsvWriteOptions = {
	header: false,
	comments: '#',
	delimiter: '', //'' = use from input, will be set from empty to string when exporting (or earlier)
	newline: '', //set by editor
	quoteChar: '"',
	escapeChar: '"',
	quoteAllFields: false,
	quoteEmptyOrNullFields: false,
	retainQuoteInformation: true,
}
//will be set when we read the csv content
let newLineFromInput = '\n'

//we need to store this because for collapsed columns we need to change the selection
//and we need to know if we we need to change the column or not
let lastHandsonMoveWas: 'tab' | 'enter' | null = null

/**
 * true: the cell/row color is changed if the first cell is a comment, (might have negative impact on performance e.g. for large data sets),
 * false: no additional highlighting (comments are still treated as comments)
 */
let highlightCsvComments: boolean = true

/**
 * true: new columns will get true as quote information (also for added columns via expanding),
 * false: new columns will get false as quote information
 */
let newColumnQuoteInformationIsQuoted: boolean = false

/**
 * true: cell content is wrapped and the row height is changed,
 * false: no wrapping (content is hidden)
 */
let enableWrapping: boolean = true

/**
 * true: borders are set to 0 (in css). This helps if you encounter some border color issues,
 * false: normal borders
 */
let disableBorders: boolean = false

/**
 * fixes the first X rows so they will stay in view even if you scroll
 */
let fixedRowsTop: number = 0

/**
 * fixes the first X columns so they will stay in view even if you scroll
 */
let fixedColumnsLeft: number = 0

/**
 * true: we started with has header option enabled which caused an event
 *   because we change the table when removing the header row from the table body we need to clear the undo...
 * false: nothing to do
 */
let isFirstHasHeaderChangedEvent = true
/**
 * the initial width for columns, 0 or a negative number will disable this and auto column size is used on initial render
 */
let initialColumnWidth: number = 0

/**
 * this is only needed if we want to display header rows but we have only 1 row...
 * handsontable always needs at least one row so we cannot remove the first row and use it as header
 * so we store here that we want to set the first row as header row immediately after we have at least 2 rows
 * true: use the first row as header row immediately after we have at least 2 rows
 * false: do not use the first row as header (also false we have toggle has header option and have >= 2 rows)
 */
let shouldApplyHasHeaderAfterRowsAdded = false

/**
 * table is editable or not, also disables some related ui, e.g. buttons
 * set via {@link EditCsvConfig.initiallyIsInReadonlyMode}
 */
let isReadonlyMode = false

/**
 * stores the widths of the handsontable columns
 * THIS is always synced with the ui
 * it allows us to modify the widths better e.g. restore widths...
 * 
 * uses visual column indices!
 * 
 * inspired by https://github.com/YaroslavOvdii/fliplet-widget-data-source/blob/master/js/spreadsheet.js (also see https://github.com/Fliplet/fliplet-widget-data-source/pull/81/files)
 */
let allColWidths: number[] = []
//afterRender is called directly after we render the table but we might want to apply old col widths here
let isInitialHotRender = true

const csvEditorWrapper = _getById('csv-editor-wrapper')
const csvEditorDiv = _getById('csv-editor')
const helModalDiv = _getById('help-modal')
const askReadAgainModalDiv = _getById('ask-read-again-modal')
const askReloadFileModalDiv = _getById('ask-reload-file-modal')
const sourceFileChangedDiv = _getById('source-file-changed-modal')

//we also have some css that rely on these ids
const readContent = _getById('read-options-content')
const writeContent = _getById('write-options-content')
const previewContent = _getById('preview-content')

const btnApplyChangesToFileAndSave = _getById(`btn-apply-changes-to-file-and-save`)

const readDelimiterTooltip = _getById('read-delimiter-tooltip')
const readDelimiterTooltipText = "Empty to auto detect"

const receivedCsvProgBar = _getById('received-csv-prog-bar') as HTMLProgressElement
const receivedCsvProgBarWrapper = _getById('received-csv-prog-bar-wrapper') as HTMLDivElement
const statusInfo = _getById('status-info') as HTMLSpanElement

const fixedRowsTopInfoSpan = _getById('fixed-rows-top-info') as HTMLDivElement
const fixedRowsTopIcon = _getById('fixed-rows-icon') as HTMLSpanElement
const fixedRowsTopText = _getById('fixed-rows-text') as HTMLSpanElement

const fixedColumnsTopInfoSpan = _getById('fixed-columns-top-info') as HTMLDivElement
const fixedColumnsTopIcon = _getById('fixed-columns-icon') as HTMLSpanElement
const fixedColumnsTopText = _getById('fixed-columns-text') as HTMLSpanElement

const showCommentsBtn = _getById('show-comments-btn') as HTMLButtonElement
const hideCommentsBtn = _getById('hide-comments-btn') as HTMLButtonElement

const newlineSameSsInputOption = _getById('newline-same-as-input-option') as HTMLOptionElement
const newlineSameSsInputOptionText = `Same as input`
updateNewLineSelect()

//add this to the first wrong column
const warningTooltipTextWhenCommentRowNotFirstCellIsUsed = `Please use only the first cell in comment row (others are not exported)`

const unsavedChangesIndicator = _getById('unsaved-changes-indicator') as HTMLSpanElement
const reloadFileSpan = _getById('reload-file') as HTMLSpanElement //reread the file content...

const sourceFileUnwatchedIndicator = _getById('source-file-unwatched-indicator') as HTMLSpanElement


const hasHeaderReadOptionInput = _getById('has-header') as HTMLInputElement
const hasHeaderLabel = _getById(`has-header-label`) as HTMLLabelElement

const leftSidePanelToggle = document.getElementById('left-panel-toggle')
if (vscode && !leftSidePanelToggle) throw new Error(`element with id 'left-panel-toggle' not found`) //null is ok for browser
const leftPanelToggleIconExpand = document.getElementById(`left-panel-toggle-icon-expand`) as HTMLElement //<i>
if (vscode && !leftPanelToggleIconExpand) throw new Error(`element with id 'left-panel-toggle-icon-expand' not found`) //null is ok for browser
const sideBarResizeHandle = _getById(`side-panel-resize-handle`) as HTMLDivElement
//--- side stats
const sidePanel = _getById(`side-panel`) as HTMLDivElement
const statSelectedRows = _getById(`stat-selected-rows`) as HTMLDivElement
const statSelectedCols = _getById(`stat-selected-cols`) as HTMLDivElement
const statRowsCount = _getById(`stat-rows-count`) as HTMLDivElement
const statColsCount = _getById(`stat-cols-count`) as HTMLDivElement
const statSelectedCellsCount = _getById(`stat-selected-cells-count`) as HTMLDivElement
const statSelectedNotEmptyCells = _getById(`stat-selected-not-empty-cells`) as HTMLDivElement
const statSumOfNumbers = _getById(`stat-sum-of-numbers`) as HTMLDivElement

const numbersStyleEnRadio = _getById(`numbers-style-en`) as HTMLInputElement //radio
const numbersStyleNonEnRadio = _getById(`numbers-style-non-en`) as HTMLInputElement //radio

const isReadonlyModeToggleSpan = _getById(`is-readonly-mode-toggle`) as HTMLSpanElement

//--- find widget controls

const findWidgetInstance = new FindWidget()

setupSideBarResizeHandle()


/* main */

//used to restore cell selection and scroll pos
let previousSelectedCell: HotCellPos | null = null
let previousViewportOffsets: HotViewportOffsetInPx | null = null

//set defaults when we are in browser
setCsvReadOptionsInitial(defaultCsvReadOptions)
setCsvWriteOptionsInitial(defaultCsvWriteOptions)

if (typeof initialContent === 'undefined') {
	// tslint:disable-next-line:no-duplicate-variable
	var initialContent = ''
}

if (initialContent === undefined) {
	initialContent = ''
}

// initialContent = `123,wet
// 4,5`

// initialContent =
// 	`
// #test , wer
// # wetwet
// 1,2,3
// 4,5,6,7,8
// 4,5,6,7,8

// `

if (!vscode) {
	console.log("initialConfig: ", initialConfig)
	console.log("initialContent: " + initialContent)
}

//set values from extension config
setupAndApplyInitialConfigPart1(initialConfig, initialVars)

setupGlobalShortcutsInVs()

//see readDataAgain
let _data = parseCsv(initialContent, defaultCsvReadOptions)

//when we get data from vs code we receive it via messages
if (_data && !vscode) {

	let _exampleData: string[][] = []
	let initialRows = 5
	let initialCols = 5

	_exampleData = [...Array(initialRows).keys()].map(p =>
		[...Array(initialCols).keys()].map(k => '')
	)

	//@ts-ignore
	// _exampleData = Handsontable.helper.createSpreadsheetData(100, 20)
	// _exampleData = Handsontable.helper.createSpreadsheetData(1000, 20)
	// _exampleData = Handsontable.helper.createSpreadsheetData(10000, 21)
	// _exampleData = Handsontable.helper.createSpreadsheetData(100000, 20)

	_data = {
		columnIsQuoted: _exampleData[0].map(p => false),
		data: _exampleData
	}

	displayData(_data, defaultCsvReadOptions)
}

if (vscode) {

	receivedCsvProgBarWrapper.style.display = "block"

	window.addEventListener('message', (e) => {
		handleVsCodeMessage(e)
	})
	_postReadyMessage()
	// console.log(JSON.stringify(vscode.getState()))
}


//-------------------------------------------------- global shortcuts 
//only in vs code not in browser

//register this before handsontable so we can first apply our actions
function setupGlobalShortcutsInVs() {
	if (vscode) {
		Mousetrap.bindGlobal(['meta+s', 'ctrl+s'], (e) => {
			e.preventDefault()

			if (hot) {
				let editor = hot.getActiveEditor() as any
				// see https://handsontable.com/docs/6.2.2/tutorial-cell-editor.html
				if (editor.isOpened()) {
					editor.finishEditing(false)
				}
			}

			postApplyContent(true)
		})
	}

	Mousetrap.bindGlobal(['ctrl+ins'], (e) => {
		insertRowBelow()
	})
	Mousetrap.bindGlobal(['ctrl+shift+ins'], (e) => {
		insertRowAbove()
	})

	//---- some shortcuts are also in ui.ts where the handsontable instance is created...
	//needed for core handsontable shortcuts e.g. that involve arrow keys


}
