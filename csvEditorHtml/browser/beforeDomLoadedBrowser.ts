
//--- should be called before all scripts

const themeDarkBgColor = `#003b49`
const themeLightBgColor = `#fdf6e3`
//things to execute after the dom has loaded but before other scripts run
const executeAfterDomLoadedQueue: Array<() => void> = []

//overwrite the empty initial config

var initialVars: InitialVars = {
	isWatchingSourceFile: false,
	sourceFileCursorLineIndex: null,
	sourceFileCursorColumnIndex: null,
	isCursorPosAfterLastColumn: false,
	openTableAndSelectCellAtCursorPos: 'initialOnly_correctRowAlwaysFirstColumn',
}

var initialConfig: EditCsvConfig | undefined = {
	highlightCsvComments: true,
	lastRowEnterBehavior: 'default',
	lastColumnTabBehavior: 'createColumn',
	lastRowOrFirstRowNavigationBehavior: 'wrap',
	lastColumnOrFirstColumnNavigationBehavior: 'wrap',
	optionsBarAppearance: "collapsed",
	readOption_comment: "#",
	readOption_quoteChar: '"',
	readOption_escapeChar: '"',
	readOption_delimiter: "",
	readOption_hasHeader: "false",
	writeOption_comment: "#",
	writeOption_delimiter: "",
	writeOption_quoteChar: '"',
	writeOption_escapeChar: '"',
	writeOption_hasHeader: "false",
	doubleClickColumnHandleForcedWith: 200,
	openSourceFileAfterApply: false,
	selectTextAfterBeginEditCell: false,
	quoteAllFields: false,
	quoteEmptyOrNullFields: 'false',
	initiallyHideComments: false,
	enableWrapping: true,
	initialColumnWidth: 0,
	retainQuoteInformation: true,
	newColumnQuoteInformationIsQuoted: false,
	disableBorders: false,
	initiallyFixedRowsTop: 0,
	initiallyFixedColumnsLeft: 0,
	fontSizeInPx: 16,
	showColumnHeaderNamesWithLettersLikeExcel: false,
	shouldWatchCsvSourceFile: true,
	sidePanelAppearance: 'expanded',
	initialNumbersStyle: 'en',
	insertRowBehavior: 'keepRowKeepColumn',
	insertColBehavior: 'keepRowKeepColumn',
	initiallyIsInReadonlyMode: false,
	hideOpenCsvEditorUiActions: false, //noop, has only effect if set inside the user settings (vs code extension)
	openTableAndSelectCellAtCursorPos: "never",
	pasteMode: 'normal',
	fontFamilyInTable: 'default',
}

function __getById(id: string): HTMLElement {
	const el = document.getElementById(id)

	if (!el) {
		_error(`could not find element with id '${id}'`)
		return null as any
	}

	return el
}
const sweetalert2DarkThemeLink = __getById(`sweetalert2-dark-theme-link`) as HTMLLinkElement

interface BrowserSettings {
	theme: 'dark' | 'light'
}

interface SiteSettings {
	version: string | undefined
	// csvEditSettings: CsvEditSettings | undefined
	browserSettings: BrowserSettings | undefined
}


interface SupportedEncoding {
	/** the display name with some addition information */
	name: string
	/** without additional information */
	internalName: string
	autoDetecting: boolean
}

function getTheme(): BrowserSettings['theme'] {
	const isDarkMode = document.body ? document.body.classList.contains('vscode-dark') : true
	return isDarkMode ? 'dark' : 'light'
}

/**
 * toggles the site theme
 */
function toggleTheme(isDark?: boolean) {
	const isDarkMode = document.body ? document.body.classList.contains('vscode-dark') : true

	if (isDarkMode) {

		if (isDark) return

		executeAfterDomLoaded(() => {
			document.body.classList.remove('vscode-dark')
			document.body.classList.add('vscode-light')
		})

		sweetalert2DarkThemeLink.disabled = false

		document.documentElement.style.setProperty(`--theme-bg-color`, themeLightBgColor)

	} else {

		//in light mode

		if (isDark === false) return

		executeAfterDomLoaded(() => {
			document.body.classList.remove('vscode-light')
			document.body.classList.add('vscode-dark')
		})

		sweetalert2DarkThemeLink.disabled = true

		document.documentElement.style.setProperty(`--theme-bg-color`, themeDarkBgColor)
	}

	executeAfterDomLoaded(() => {
		saveSettings()
	})
}

const settingsLocalStorageKey = `siteSettings`
function saveSettings() {

	const settings: SiteSettings = {
		// csvEditSettings: initialConfig,
		version: '1',
		browserSettings: {
			theme: getTheme()
		}
	}

	try {
		localStorage.setItem(settingsLocalStorageKey, JSON.stringify(settings))
	} catch (error) {
		console.log(`could not save site setting into local storage`, error)
		Swal.fire(`Save settings error`, `Could not save the site settings`, `error`)
	}

}

function loadSettings(): SiteSettings | null {

	const settingsJson = localStorage.getItem(settingsLocalStorageKey)
	if (!settingsJson) {
		console.log(`could not load site settings from local storage (null)`)
		return null
	}
	const _settings = JSON.parse(settingsJson) as SiteSettings

	//just take the values

	const settings: SiteSettings = {
		// csvEditSettings: initialConfig,
		version: _settings?.version,
		browserSettings: {
			theme: _settings?.browserSettings?.theme ?? 'dark'
		}
	}

	if (settings.browserSettings && (settings.browserSettings.theme !== 'dark' && settings.browserSettings.theme !== 'light')) {
		settings.browserSettings.theme = 'dark'
	}

	return settings
}

function applySettings(settings: SiteSettings | null) {
	if (!settings) return

	toggleTheme(settings.browserSettings?.theme !== 'light')
}


applySettings(loadSettings())


function executeAfterDomLoaded(handler: () => void) {

	if (document.body) {
		handler()
	} else {
		executeAfterDomLoadedQueue.push(handler)
	}
}
