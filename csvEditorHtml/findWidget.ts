/// <reference path="util.ts" />
/// <reference path="types.d.ts" />
/// <reference path="progressbar.ts" />


class FindWidget {

	findWidget: HTMLDivElement
	findWidgetStartSearch: HTMLSpanElement
	findWidgetInput: HTMLInputElement
	findWWidgetErrorMessage: HTMLDivElement
	findWidgetInfo: HTMLSpanElement
	findWidgetOutdatedSearch: HTMLSpanElement
	findWidgetCancelSearch: HTMLSpanElement

	findWidgetOptionMatchCase: HTMLDivElement
	findWidgetOptionWholeCell: HTMLDivElement
	findWidgetOptionWholeCellTrimmed: HTMLDivElement
	findWidgetOptionRegex: HTMLDivElement

	findWidgetPrevious: HTMLDivElement
	findWidgetNext: HTMLDivElement
	findWidgetGripperIsMouseDown: boolean
	findWidgetDownPointOffsetInPx: number

	findWidgetInputValueCache: string


	//cache the state for query method to not interact with dom
	findOptionMatchCaseCache = false
	findOptionMatchWholeCellCache = false
	findOptionTrimCellCache = false
	findOptionUseRegexCache = false

	//store old toggle state to show refresh search only when options really change
	findOptionMatchCasePreviousCache = false
	findOptionMatchWholeCellPreviousCache = false
	findOptionTrimCellPreviousCache = false
	findOptionUseRegexPreviousCache = false

	/**
	 * we need this to be sure if we need to show the outdated search indicator
	 * this should be reset when we re-searched
	 */
	tableHasChangedAfterSearch = false

	findWidgetQueryCancellationToken: { isCancellationRequested: boolean } = {
		isCancellationRequested: false
	}


	findWidgetCurrRegex: RegExp | null = null

	findMatchCellClass = 'search-result-cell'
	//we swap .search-result-cell with this class so we don't need to redo the search after reopening the find widget
	findOldMatchCellClass = 'old-search-result-cell'

	onWindowResizeThrottled: () => void
	onWindowResizeThrottledBound: () => void
	onSearchInputPreDebounced: (e: KeyboardEvent | null) => void
	onSearchInputPreDebouncedBound: (e: KeyboardEvent | null) => void
	onDocumentRootKeyDownBound: (e: ExtendedKeyboardEvent) => void

	onFindWidgetDragEndBound: (e: MouseEvent) => void
	onFindWidgetDragBound: (e: MouseEvent) => void

	/**
	 * stores the last find results
	 */
	lastFindResults: HandsontableSearchResult[] = []
	currentFindIndex = 0


	findWidgetProgressbar: Progressbar

	constructor() {

		this.findWidget = _getById('find-widget') as HTMLDivElement
		this.findWidgetStartSearch = _getById('find-widget-start-search') as HTMLSpanElement
		this.findWidgetInput = _getById('find-widget-input') as HTMLInputElement
		this.findWWidgetErrorMessage = _getById('find-widget-error-message') as HTMLDivElement
		this.findWidgetInfo = _getById('find-widget-info') as HTMLSpanElement
		this.findWidgetOutdatedSearch = _getById('find-widget-outdated-search') as HTMLSpanElement
		this.findWidgetCancelSearch = _getById('find-widget-cancel-search') as HTMLSpanElement

		this.findWidgetOptionMatchCase = _getById('find-window-option-match-case') as HTMLDivElement
		this.findWidgetOptionWholeCell = _getById('find-window-option-whole-cell') as HTMLDivElement
		this.findWidgetOptionWholeCellTrimmed = _getById('find-window-option-whole-cell-trimmed') as HTMLDivElement
		this.findWidgetOptionRegex = _getById('find-window-option-regex') as HTMLDivElement

		this.findWidgetPrevious = _getById('find-widget-previous') as HTMLDivElement
		this.findWidgetNext = _getById('find-widget-next') as HTMLDivElement
		this.findWidgetGripperIsMouseDown = false
		this.findWidgetDownPointOffsetInPx = 0 //gripper relative to the find widget
		this.findWidgetInputValueCache = ''

		this.onWindowResizeThrottled = throttle(this.onWindowResize, 200)
		this.onSearchInputPreDebounced = debounce(this.onSearchInputPre, 200)

		this.onWindowResizeThrottledBound = this.onWindowResizeThrottled.bind(this)
		this.onSearchInputPreDebouncedBound = this.onSearchInputPre.bind(this)
		this.onDocumentRootKeyDownBound = this.onDocumentRootKeyDown.bind(this)

		//event 100ms throttle feels ugly...
		this.onFindWidgetDragEndBound = this.onFindWidgetDragEnd.bind(this)
		this.onFindWidgetDragBound = this.onFindWidgetDrag.bind(this)

		this.findWidgetProgressbar = new Progressbar('find-widget-progress-bar')
	}


	/**
	* shows or hides the find widget 
	* @param show 
	*/
	showOrHideWidget(show: boolean) {
		if (!hot) return

		let currIsSown = this.isFindWidgetDisplayed()

		if (currIsSown === show) {
			//e.g. when we focuse a cell and the find widget is already displayed then we want to focus again
			if (show) {
				setTimeout(() => {
					this.findWidgetInput.focus()
				}, 0)
			}
			return
		}

		this.findWidget.style.display = show ? 'flex' : 'none'

		if (show) {

			//we cleared the search input but didn't search
			if (this.findWidgetInput.value === '' && this.findWidgetInputValueCache !== '') {
				this.findWidgetInput.value = this.findWidgetInputValueCache
			}

			//when the last search was cancelled then we don't want to show highlighted cells
			//because the plugin might have already assigned the found css class to some cells
			//and we only hide those when we cancel

			//when we searched and found results we want't to re-show them
			if (this.lastFindResults.length > 0) {
				hot.updateSettings({
					search: {
						isSuspended: false
					}
				} as any, false)
			}

			//handsontable probably tries to grab the focus...
			setTimeout(() => {
				this.findWidgetInput.focus()
			}, 0);

		} else {

			if (this.getIsSearchCancelDisplayed()) {
				//search is in progress...
				this.onCancelSearch()
				//when we cancel via esc we don't want to hide the find widget
				this.findWidget.style.display = 'flex'
			} else {
				//search has already finished... just hide old result
				hot.updateSettings({
					search: {
						isSuspended: true
					}
				} as any, false)
			}

		}
	}

	isFindWidgetDisplayed(): boolean {
		return this.findWidget.style.display !== 'none'
	}

	/**
	* toggles the find widget visibility
	*/
	toggleFindWidgetVisibility() {
		this.showOrHideWidget(this.findWidget.style.display === 'none')
	}

	/**
	 * prepares the find widget (re-setup all listeners...)
	 */
	setupFind() {
		Mousetrap.unbind(['meta+f', 'ctrl+f'])
		Mousetrap.bindGlobal(['meta+f', 'ctrl+f'], (e) => {
			e.preventDefault()
			this.showOrHideWidget(true)
		})

		this.findWidgetInput.removeEventListener('keyup', this.onSearchInputPreDebouncedBound)
		this.findWidgetInput.addEventListener('keyup', this.onSearchInputPreDebouncedBound)

		document.documentElement.removeEventListener('keydown', this.onDocumentRootKeyDownBound)
		document.documentElement.addEventListener('keydown', this.onDocumentRootKeyDownBound)

		Mousetrap.unbind('esc')
		Mousetrap.bindGlobal('esc', (e) => {
			this.showOrHideWidget(false)
		})


		Mousetrap.bindGlobal('f3', (e) => {
			if (this.isFindWidgetDisplayed() === false && this.lastFindResults.length === 0) return
			this.gotoNextFindMatch()
		})

		Mousetrap.unbind('shift+f3')
		Mousetrap.bindGlobal('shift+f3', (e) => {
			if (this.isFindWidgetDisplayed() === false && this.lastFindResults.length === 0) return
			this.gotoPreviousFindMatch()
		})

		window.removeEventListener('resize', this.onWindowResizeThrottledBound)
		window.addEventListener('resize', this.onWindowResizeThrottledBound)
	}


	//--- events

	onDocumentRootKeyDown(e: ExtendedKeyboardEvent) {

		if (this.isFindWidgetDisplayed() && document.activeElement === this.findWidgetInput) {

			//when the find widget is displayed AND has focus do not pass the event to handsontable
			//else we would input into the cell editor...
			//see editorManager.js > init (`instance.runHooks('afterDocumentKeyDown', event);`) > _baseEditor.js > beginEditing (`this.focus();`) > textEditor.js > focus
			//when we don't stopImmediatePropagation then check: focus a cell, open the search and start typing would input into the cell editor

			//whitelist so that we e.g. allow to show the cmd palette in vs code
			if (
				// (e.metaKey && e.key === 'p') || //macos
				// (e.ctrlKey && e.key === 'p') || //windows / linux
				(e.key === 'F1') || //mac / windows /linux shows also command palette
				(e.metaKey || e.ctrlKey) //mac and windows / linux command platte 
			) {
				//@ts-ignore
				let xyz = 1
			} else {
				e.stopImmediatePropagation()
			}

			//but we need to be able to close the find...
			if (e.key === 'Escape') {
				Mousetrap.trigger('esc')
			} else if (e.key === 'F3') {

				Mousetrap.trigger(e.shiftKey ? 'shift+f3' : 'f3')
			}
			else if (e.key === 'F2') {
				//focus cell so we can input

				if (hot && this.lastFindResults.length > 0) {
					let match = this.lastFindResults[this.currentFindIndex]
					hot.selectCell(match.row, match.col)
					hot.scrollViewportTo(match.row)
				}
			} else if (e.key === 'Enter') {
				//allow manual refresh result
				this.refreshCurrentSearch()
			}
		}

	}


	/**
	 * called on every keydown
	 * currently not use because we don't start a new search on keydown
	 */
	onSearchInputPre(e: KeyboardEvent | null) {

		// let forceSearch = false

		// if (e) {
		// 	//allow to quickly refresh search
		// 	if (e.key === 'Enter') {
		// 		forceSearch = true
		// 	} else {
		// 	//don't trigger on meta/super and escape but this should already be caught by value changed check below
		// 	if (
		// 		e.key.indexOf('Meta') !== -1 || e.key.indexOf('Escape') !== -1
		// 	) return
		// 	}
		// } 

		if (e && e.key !== 'Enter') return

		//actually enter is now captured by this.onDocumentRootKeyDownBound and on enter it calls this.refreshCurrentSearch
		//so this is actually never called?!?
		//and we no longer search directly after debounced input, only after enter!

		//because we debounced the input we sometimes get an input "f" here when we repeatedly open and close the find widget
		//so only fire when the input value really changed
		// if (this.findWidgetInput.value === this.findWidgetInputValueCache && forceSearch === false) return

		// if (this.findWidgetInput.value === '') return

		// this.findWidgetInputValueCache = this.findWidgetInput.value

		// this.onSearchInput(false, true, null)
	}


	/**
	 * called to start the search
	 * @param isOpeningFindWidget 
	 * @param jumpToResult 
	 * @param pretendedText if this is a string we search synchronous!
	 */
	async onSearchInput(isOpeningFindWidget: boolean, jumpToResult: boolean, pretendedText: string | null) {

		if (!hot) return

		//when we open the find widget and input is empty then didn't do anything
		if (isOpeningFindWidget === true && this.findWidgetInput.value === "") {
			this.findWidgetInput.focus()
			return
		}

		this.showOrHideOutdatedSearchIndicator(false)

		if (this.findOptionUseRegexCache) {
			let regexIsValid = this.refreshFindWidgetRegex(false)

			if (!regexIsValid) {
				this.findWidgetInput.focus()
				return
			}
		}

		this.findOptionMatchCasePreviousCache = this.findOptionMatchCaseCache
		this.findOptionMatchWholeCellPreviousCache = this.findOptionMatchWholeCellCache
		this.findOptionTrimCellPreviousCache = this.findOptionTrimCellCache
		this.findOptionUseRegexPreviousCache = this.findOptionUseRegexCache
		this.tableHasChangedAfterSearch = false

		let searchPlugin = hot.getPlugin('search')

		if (pretendedText === null) {

			this.findWidgetProgressbar.setValue(0)
			this.findWidgetProgressbar.show()


			this.findWidgetQueryCancellationToken.isCancellationRequested = false
			this.enableOrDisableFindWidgetInput(false)
			this.showOrHideSearchCancel(true)
			this._enabledOrDisableFindWidgetInteraction(false)

			// console.time('query')

			//when we increment to e.g. only update after 10% then the time will improve!
			//@ts-ignore
			this.lastFindResults = await searchPlugin.queryAsync(this.findWidgetInput.value, this.findWidgetQueryCancellationToken, this._onSearchProgress.bind(this), 5) //updat every 5 %
			this._getRealIndicesFromFindResult()

			//old sync way
			//@ts-ignore
			// this.lastFindResults = searchPlugin.query(this.findWidgetInput.value)
			// console.timeEnd('query')

		} else {
			//@ts-ignore
			this.lastFindResults = searchPlugin.query(pretendedText)
			this._getRealIndicesFromFindResult()
		}

		// console.log(`this.lastFindResults`, this.lastFindResults)

		statusInfo.innerText = `Rendering table...`

		if (this.lastFindResults.length === 0) {

			if (this.findWidgetQueryCancellationToken.isCancellationRequested === false) {
				this.findWidgetInfo.innerText = `No results`
			} else {
				this.findWidgetInfo.innerText = `Cancelled`
			}
		}

		if (jumpToResult && this.lastFindResults.length > 0) {
			//jump to the first found match
			this.gotoFindMatchByIndex(0)
		}

		//in a new macro task so that we can see the 100% progress (hot.render will block and take some time)
		setTimeout(() => {
			//to render highlighting

			//when we cancel the search we clear the old result by suspending the plugin...
			//because the plugin already assigned the result class to some cells

			//this will also re-render the table...
			hot!.updateSettings({
				search: {
					isSuspended: this.lastFindResults.length === 0
				}
			} as any, false)

			//...so this is not needed
			// hot!.render()
		}, 0)

		//render will auto focus the editor (hot input textarea)
		//see copyPaste.js > onAfterSelectionEnd > `this.focusableElement.focus();`
		//and
		//see selection.js > setRangeEnd(coords) > `this.runLocalHooks('afterSetRangeEnd', coords);` > ... > textEditor.js > focus > `this.TEXTAREA.select();`

		//this should run after all handsontable hooks... and the search input should keep focus
		//hide the progress bar after we re-render the table (this macro task will be queued after the previous)
		setTimeout(() => {
			this.findWidgetQueryCancellationToken.isCancellationRequested = false
			statusInfo.innerText = ``
			this.enableOrDisableFindWidgetInput(true)
			this._enabledOrDisableFindWidgetInteraction(true)

			if (this.lastFindResults.length === 0) {
				this.findWidgetNext.classList.add('div-disabled')
				this.findWidgetPrevious.classList.add('div-disabled')
			}

			this.findWidgetProgressbar.hide()
			this.findWidgetInput.focus()
		}, 0)
	}

	/**
	 * sets the physical row indices for {@link lastFindResults}
	 * this is needed because when we use the next/previous btns we jump to the cell index and after sorting the 
	 * visual index might have changed
	 * 
	 * @note one thing to keep in mind is that the order of the results depend on the current sorting
	 */
	_getRealIndicesFromFindResult() {

		if (!hot) return
		//actually this is pretty fast... e.g. for 2 million rows it took only ~700ms

		for (let i = 0; i < this.lastFindResults.length; i++) {
			const findResult = this.lastFindResults[i];
			findResult.rowReal = hot.toPhysicalRow(findResult.row)
			findResult.colReal = hot.toPhysicalColumn(findResult.col)
		}
		// console.log(this.lastFindResults)
	}

	_onSearchProgress(index: number, maxIndex: number, percentage: number) {
		this.findWidgetProgressbar.setValue(percentage)
		if (index >= maxIndex) {
			this._onSearchFinished()
		}
	}

	_onSearchFinished() {
		//this.findWidgetQueryCancellationToken.isCancellationRequested = false is done in search func
		this.showOrHideSearchCancel(false)
	}

	onCancelSearch() {
		this.findWidgetQueryCancellationToken.isCancellationRequested = true
		this._onSearchFinished()

		if (!hot) return

		hot.updateSettings({
			search: {
				isSuspended: true
			}
		} as any, false)
	}


	//--- find widget options

	toggleFindWindowOptionMatchCase() {
		this.setFindWindowOptionMatchCase(this.findWidgetOptionMatchCase.classList.contains(`active`) ? false : true)
	}

	setFindWindowOptionMatchCase(enabled: boolean) {

		if (enabled) {
			this.findWidgetOptionMatchCase.classList.add(`active`)
		} else {
			this.findWidgetOptionMatchCase.classList.remove(`active`)
		}

		this.findOptionMatchCaseCache = enabled

		//we have an old search
		if (this.findWidgetInputValueCache !== '') {

			//if the table has changes and we set the option to the previous state...
			//then do not clear the outdated indicator because of the table changes!

			if (this._hasAnyFindOptionChanged()) {
				this.showOrHideOutdatedSearchIndicator(true)
			} else {

				//we set the option to the previous state
				if (this.tableHasChangedAfterSearch) {

				} else {
					this.showOrHideOutdatedSearchIndicator(false)
				}
			}
		}

		//don't auto refresh
		// this.refreshCurrentSearch()
	}

	toggleFindWindowOptionWholeCell() {
		this.setFindWindowOptionWholeCell(this.findWidgetOptionWholeCell.classList.contains(`active`) ? false : true)
	}


	setFindWindowOptionWholeCell(enabled: boolean) {
		if (enabled) {
			this.findWidgetOptionWholeCell.classList.add(`active`)
		} else {
			this.findWidgetOptionWholeCell.classList.remove(`active`)
		}

		this.findOptionMatchWholeCellCache = enabled

		//we have an old search
		if (this.findWidgetInputValueCache !== '') {

			//if the table has changes and we set the option to the previous state...
			//then do not clear the outdated indicator because of the table changes!

			if (this._hasAnyFindOptionChanged()) {
				this.showOrHideOutdatedSearchIndicator(true)
			} else {

				//we set the option to the previous state
				if (this.tableHasChangedAfterSearch) {

				} else {
					this.showOrHideOutdatedSearchIndicator(false)
				}
			}
		}

		//don't auto refresh
		// this.refreshCurrentSearch()
	}

	toggleFindWindowOptionMatchTrimmedCell() {
		this.setFindWindowOptionMatchTrimmedCell(this.findWidgetOptionWholeCellTrimmed.classList.contains(`active`) ? false : true)
	}

	setFindWindowOptionMatchTrimmedCell(enabled: boolean) {

		if (enabled) {
			this.findWidgetOptionWholeCellTrimmed.classList.add(`active`)
		} else {
			this.findWidgetOptionWholeCellTrimmed.classList.remove(`active`)
		}

		this.findOptionTrimCellCache = enabled

		//we have an old search
		if (this.findWidgetInputValueCache !== '') {

			//if the table has changes and we set the option to the previous state...
			//then do not clear the outdated indicator because of the table changes!

			if (this._hasAnyFindOptionChanged()) {
				this.showOrHideOutdatedSearchIndicator(true)
			} else {

				//we set the option to the previous state
				if (this.tableHasChangedAfterSearch) {

				} else {
					this.showOrHideOutdatedSearchIndicator(false)
				}
			}
		}

		//don't auto refresh
		// this.refreshCurrentSearch()
	}

	toggleFindWindowOptionRegex() {
		this.setFindWindowOptionRegex(this.findWidgetOptionRegex.classList.contains(`active`) ? false : true)
	}

	/**
 * also refreshes the {@link findWidgetCurrRegex} when enabled (in {@link onSearchInput})
 * @param enabled 
 */
	setFindWindowOptionRegex(enabled: boolean) {

		if (enabled) {
			this.findWidgetOptionRegex.classList.add(`active`)
			this.refreshFindWidgetRegex(false)
		} else {
			this.findWidgetOptionRegex.classList.remove(`active`)
			this.refreshFindWidgetRegex(true)
		}

		this.findOptionUseRegexCache = enabled

		//we have an old search
		if (this.findWidgetInputValueCache !== '') {

			//if the table has changes and we set the option to the previous state...
			//then do not clear the outdated indicator because of the table changes!

			if (this._hasAnyFindOptionChanged()) {
				this.showOrHideOutdatedSearchIndicator(true)
			} else {

				//we set the option to the previous state
				if (this.tableHasChangedAfterSearch) {

				} else {
					this.showOrHideOutdatedSearchIndicator(false)
				}
			}
		}

		//don't auto refresh
		// this.refreshCurrentSearch()
	}


	/**
	 * returns true if any find option was changed after the last search
	 */
	_hasAnyFindOptionChanged(): boolean {

		if (this.findOptionMatchCasePreviousCache !== this.findOptionMatchCaseCache) return true

		if (this.findOptionMatchWholeCellPreviousCache !== this.findOptionMatchWholeCellCache) return true

		if (this.findOptionTrimCellPreviousCache !== this.findOptionTrimCellCache) return true

		if (this.findOptionUseRegexPreviousCache !== this.findOptionUseRegexCache) return true

		return false
	}

	/**
	 * refreshes the {@link findWidgetCurrRegex} from the {@link findWidgetInput}
	 * @returns true: the find widget regex is valid (!= null), false: regex is invalid
	 */
	refreshFindWidgetRegex(forceReset: boolean): boolean {

		if (forceReset) {
			this.findWidgetCurrRegex = null
			this.findWWidgetErrorMessage.innerText = ''
			this.findWidgetInput.classList.remove('error-input')
			return false
		}

		try {
			//global flag is not needed here because we only want the first match
			this.findWidgetCurrRegex = new RegExp(this.findWidgetInput.value, '')
			this.findWWidgetErrorMessage.innerText = ''
			this.findWidgetInput.classList.remove('error-input')

			return true

		} catch (error) {
			console.log(`error:`, error.message)
			this.findWidgetCurrRegex = null
			this.findWWidgetErrorMessage.innerText = error.message
			this.findWidgetInput.classList.add('error-input')

			return false
		}
	}

	/**
	 * enables or disables the find options (and the next/previous btns)
	 * @param enable 
	 */
	_enabledOrDisableFindWidgetInteraction(enable: boolean) {

		const disabledClass = 'div-disabled'
		if (enable) {
			this.findWidgetOptionMatchCase.classList.remove(disabledClass)
			this.findWidgetOptionWholeCell.classList.remove(disabledClass)
			this.findWidgetOptionWholeCellTrimmed.classList.remove(disabledClass)
			this.findWidgetOptionRegex.classList.remove(disabledClass)
			this.findWidgetPrevious.classList.remove(disabledClass)
			this.findWidgetNext.classList.remove(disabledClass)
		} else {


			this.findWidgetOptionMatchCase.classList.add(disabledClass)
			this.findWidgetOptionWholeCell.classList.add(disabledClass)
			this.findWidgetOptionWholeCellTrimmed.classList.add(disabledClass)
			this.findWidgetOptionRegex.classList.add(disabledClass)
			this.findWidgetPrevious.classList.add(disabledClass)
			this.findWidgetNext.classList.add(disabledClass)
		}
	}

	/**
	 * enables or disables the find input
	 * @param isEnable 
	 */
	enableOrDisableFindWidgetInput(isEnable: boolean) {
		this.findWidgetInput.disabled = !isEnable
	}

	/**
	 * shows or or hides the is outdated search indicator
	 * @param isOutdated 
	 */
	showOrHideOutdatedSearchIndicator(isOutdated: boolean) {
		this.findWidgetOutdatedSearch.style.display = isOutdated ? 'block' : 'none'
	}

	/**
	 * refreshes the current search
	 * e.g. when the table has changed and we want to update the search
	 */
	refreshCurrentSearch() {
		this.findWidgetInputValueCache = this.findWidgetInput.value

		if (this.findWidgetInput.value === '') return

		this.onSearchInput(false, true, null)
	}

	/**
	 * shows or hides the cancel btn
	 * @param show 
	 */
	showOrHideSearchCancel(show: boolean) {
		this.findWidgetCancelSearch.style.display = show ? 'block' : 'none'
		this.findWidgetInfo.style.display = show ? 'none' : 'block'
		this.findWidgetStartSearch.style.display = show ? 'none' : 'block'
	}

	/**
	 * returns if the cancel btn is displayed
	 */
	getIsSearchCancelDisplayed() {
		return this.findWidgetCancelSearch.style.display === 'block'
	}

	//--- find matches

	/**
	 * moves to the previous match and selects that cell
	 */
	gotoPreviousFindMatch() {
		this.gotoFindMatchByIndex(this.currentFindIndex - 1)
	}

	/**
	 * moves to the next match and selects that cell
	 */
	gotoNextFindMatch() {
		this.gotoFindMatchByIndex(this.currentFindIndex + 1)
	}

	/**
	 * moves the table to the given find match by index
	 * also sets the {@link currentFindIndex}
	 * @param matchIndex if the index is invalid we cycle
	 */
	gotoFindMatchByIndex(matchIndex: number) {

		if (!hot) return

		if (matchIndex >= this.lastFindResults.length) {
			this.gotoFindMatchByIndex(0)
			return
		}

		if (matchIndex < 0) {
			this.gotoFindMatchByIndex(this.lastFindResults.length - 1)
			return
		}

		let match = this.lastFindResults[matchIndex]

		//make sure the cell is in view
		{
			const autoColumnSizePlugin = hot.getPlugin('autoColumnSize')
			const autoRowSizePlugin = hot.getPlugin('autoRowSize')

			const visualRowIndex = hot.toVisualRow(match.rowReal)
			const visualColIndex = hot.toVisualColumn(match.colReal)

			//what is bad that when we scroll to a cell that is outside of the view it will show up at the bottom (when scrolling down) or top (scrolling top)
			//but it would be good if we show the cell centered in the viewport when we scroll (to a new location)

			const _firstVisualRow = autoRowSizePlugin.getFirstVisibleRow()
			const _lastVisualRow = autoRowSizePlugin.getLastVisibleRow()

			const _firstVisualCol = autoColumnSizePlugin.getFirstVisibleColumn()
			const _lastVisualCol = autoColumnSizePlugin.getLastVisibleColumn()

			let virtualColumnIndexToScrollTo: number | undefined = undefined
			let virtualRowIndexToScrollTo: number | undefined = undefined

			let useAutoScroll = true
			let useAutoScrollRow = false;
			let useAutoScrollCol = false;

			//cell is outside if current viewport?
			if (visualRowIndex < _firstVisualRow || visualRowIndex > _lastVisualRow) {
				useAutoScroll = false
				useAutoScrollRow = true
			}
			if (visualColIndex < _firstVisualCol || visualColIndex > _lastVisualCol) {
				useAutoScroll = false
				useAutoScrollCol = true
			}

			if (getAreCommentsDisplayed() === false) {
				//comments are hidden but rows are displayed with 0 (or 0.x height) so they count as visible e.g. for autoRowSizePlugin.getFirstVisibleRow
				//so to make things easier use the sometimes ugly auto scroll (where the cell is not centered automatically)
				useAutoScroll = true
				useAutoScrollRow = false
				useAutoScrollCol = false
			}

			//scrolling with true is good because it will only scroll the table if the cell is out of view
			hot.selectCell(visualRowIndex, visualColIndex, undefined, undefined, useAutoScroll)

			if (useAutoScroll === false) {

				if (useAutoScrollRow) {
					//center row in view
					const rowsToSubtract = Math.floor((_lastVisualRow - _firstVisualRow) / 2)
					//keep the value in bounds, max must not be checked because even if the index is the last row we subtract >= 0
					const clampedVisualRowIndex = Math.max(visualRowIndex - rowsToSubtract, 0)
					virtualRowIndexToScrollTo = clampedVisualRowIndex
				}

				if (useAutoScrollCol) {
					//center col in view
					const rowsToSubtract = Math.floor((_lastVisualCol - _firstVisualCol) / 2)
					//keep the value in bounds, max must not be checked because even if the index is the last col we subtract >= 0
					const clampedVisualRowIndex = Math.max(visualColIndex - rowsToSubtract, 0)
					virtualColumnIndexToScrollTo = clampedVisualRowIndex
				}

				//when virtualRowIndexToScrollTo is undefined we stay in the same row
				hot.scrollViewportTo(virtualRowIndexToScrollTo, virtualColumnIndexToScrollTo)
			}
		}


		// hot.scrollViewportTo(visualRowIndex)
		this.findWidgetInfo.innerText = `${matchIndex + 1}/${this.lastFindResults.length}`
		this.currentFindIndex = matchIndex

		//we need to queue this else handsontable somehow grabs focus (focus the cell and input would go into the cell)...
		setTimeout(() => {
			this.findWidgetInput.focus()
		}, 0)
	}

	/**
	 * start of moving the widget
	 * @param e
	 */
	onFindWidgetGripperMouseDown(e: MouseEvent) {
		e.preventDefault()
		this.findWidgetGripperIsMouseDown = true
		let xFromRight = document.body.clientWidth - e.clientX

		if (this.findWidget.style.right === null || this.findWidget.style.right === "") {
			return
		}

		let rightString = this.findWidget.style.right.substr(0, this.findWidget.style.right.length - 2)
		this.findWidgetDownPointOffsetInPx = xFromRight - parseInt(rightString)

		document.addEventListener('mouseup', this.onFindWidgetDragEndBound)
		document.addEventListener('mousemove', this.onFindWidgetDragBound)
	}

	/**
	 * moves the widget horizontally
	 * @param e 
	 */
	onFindWidgetDrag(e: MouseEvent) {
		e.preventDefault()

		let xFromRight = document.body.clientWidth - e.clientX
		let newRight = xFromRight - this.findWidgetDownPointOffsetInPx

		//keep the find widget in window bounds
		newRight = Math.max(newRight, 0)
		newRight = Math.min(newRight, document.body.clientWidth - this.findWidget.clientWidth)

		this.findWidget.style.right = `${newRight}px`
	}

	onFindWidgetDragEnd(e: MouseEvent) {
		this.findWidgetGripperIsMouseDown = false
		document.removeEventListener('mousemove', this.onFindWidgetDragBound)
		document.removeEventListener('mouseup', this.onFindWidgetDragEndBound)
	}

	/**
	 * ensures that the widget stays in window bounds
	 */
	onWindowResize() {

		//ensure the find widget is in bounds...
		if (this.findWidget.style.right === null || this.findWidget.style.right === "") {
			return
		}
		let rightString = this.findWidget.style.right.substr(0, this.findWidget.style.right.length - 2)
		let currRight = parseInt(rightString)

		currRight = Math.max(currRight, 0)
		currRight = Math.min(currRight, document.body.clientWidth - this.findWidget.clientWidth)
		this.findWidget.style.right = `${currRight}px`
	}


}