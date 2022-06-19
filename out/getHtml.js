"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEditorHtml = exports.getResourcePath = void 0;
const vscode = require("vscode");
const path = require("path");
/**
 * returns a local file path relative to the extension root dir
 * @param filePath
 */
function getResourcePath(webview, context, filePath) {
    //fix for windows because there path.join will use \ as separator and when we inline this string in html/js
    //we get specials strings e.g. c:\n
    // return `vscode-resource:${path.join(context.extensionPath, filePath).replace(/\\/g, '/')}`
    return `${webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, filePath).replace(/\\/g, '/')))}`;
}
exports.getResourcePath = getResourcePath;
/**
 * creates the html for the csv editor
 *
 * this is copied from csvEditorHtml/index.html
 * @param context
 */
function createEditorHtml(webview, context, config, initialVars) {
    const _getResourcePath = getResourcePath.bind(undefined, webview, context);
    let handsontableCss = _getResourcePath('thirdParty/handsontable/handsontable.min.css');
    // let handsontableCss = _getResourcePath('thirdParty/handsontable/handsontable.css')
    let handsontableJs = _getResourcePath('thirdParty/handsontable/handsontable.min.js');
    // let handsontableJs = _getResourcePath('thirdParty/handsontable/handsontable.js')
    let papaparseJs = _getResourcePath('thirdParty/papaparse/papaparse.min.js');
    // let papaparseJs = _getResourcePath('thirdParty/papaparse/papaparse.js')
    const mousetrapJs = _getResourcePath('thirdParty/mousetrap/mousetrap.min.js');
    const mousetrapBindGlobalJs = _getResourcePath('thirdParty/mousetrap/plugins/global-bind/mousetrap-global-bind.min.js');
    const bigJs = _getResourcePath('thirdParty/big.js/big.min.js');
    const bigJsToFormat = _getResourcePath('thirdParty/toFormat/toFormat.min.js');
    let fontAwesomeCss = _getResourcePath('thirdParty/fortawesome/fontawesome-free/css/all.min.css');
    //we need to load the font manually because the url() seems to not work properly with vscode-resource
    const iconFont = _getResourcePath('thirdParty/fortawesome/fontawesome-free/webfonts/fa-solid-900.woff2');
    const mainCss = _getResourcePath('csvEditorHtml/main.css');
    const darkThemeCss = _getResourcePath('csvEditorHtml/dark.css');
    const lightThemeCss = _getResourcePath('csvEditorHtml/light.css');
    const hightContrastThemeCss = _getResourcePath('csvEditorHtml/high_contrast.css');
    const settingsOverwriteCss = _getResourcePath('csvEditorHtml/settingsOverwrite.css');
    //scripts
    const progressJs = _getResourcePath('csvEditorHtml/out/progressbar.js');
    const findWidgetJs = _getResourcePath('csvEditorHtml/out/findWidget.js');
    const ioJs = _getResourcePath('csvEditorHtml/out/io.js');
    const uiJs = _getResourcePath('csvEditorHtml/out/ui.js');
    const utilJs = _getResourcePath('csvEditorHtml/out/util.js');
    const mainJs = _getResourcePath('csvEditorHtml/out/main.js');
    const beforeDomLoadedJs = _getResourcePath('csvEditorHtml/out/beforeDomLoaded.js');
    const toolkit = _getResourcePath('node_modules/@vscode/webview-ui-toolkit/dist/toolkit.min.js');
    //use blocks so vs code adds folding
    let findWidgetHtml = ``;
    {
        // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
        findWidgetHtml = /*html*/ `
		<div id="find-widget" class="find-widget" style="display: none; right: 100px;">

		<div id="find-widget-progress-bar" class="progress-bar"></div>

		<div class="gripper" onmousedown="findWidgetInstance.onFindWidgetGripperMouseDown(event)">
			<i class="fas fa-grip-vertical"></i>
		</div>

		<div class="search-input-wrapper">
			<vscode-text-field id="find-widget-input" placeholder="Find..." class="input" title="Enter to start search">
			<span slot="end" style="width: 81px";>
					<!-- search options -->
				<div class="flexed find-options">
					<vscode-button appearance="icon" id="find-window-option-match-case" class="btn option" onclick="findWidgetInstance.toggleFindWindowOptionMatchCase()" title="Match case">
						<span>Aa</span>
					</vscode-button>

					<vscode-button appearance="icon" id="find-window-option-whole-cell" class="btn option" onclick="findWidgetInstance.toggleFindWindowOptionWholeCell()" title="Match whole cell value">
						<span>Abl</span>
					</vscode-button>

					<vscode-button appearance="icon" id="find-window-option-whole-cell-trimmed" class="btn option" onclick="findWidgetInstance.toggleFindWindowOptionMatchTrimmedCell()" title="Trims the cell value before comparing">
						<span>A</span>
					</vscode-button>

					<vscode-button appearance="icon" id="find-window-option-regex" class="btn option" onclick="findWidgetInstance.toggleFindWindowOptionRegex()" title="Use regular expression">
						<span>
							<i class="fas fa-square-full"></i>
							<i class="fas fa-asterisk"></i>
						</span>
					</vscode-button>
				</div>
			
			</span>
			</vscode-text-field>


			<div id="find-widget-error-message" class="error-message">
			</div>
		</div>

		<div class="info">
			<vscode-button appearance="icon" id="find-widget-start-search" class="clickable" style="margin-right: 3px;" onclick="findWidgetInstance.refreshCurrentSearch()"
				title="Start search (Enter)">
				<i class="fas fa-search"></i>
			</vscode-button>
			<span id="find-widget-info">0/0</span>
			<span id="find-widget-cancel-search" title="Cancel search (Escape)" class="clickable" onclick="findWidgetInstance.onCancelSearch()" style="display: none;">
				<i class="fas fa-hand-paper"></i>
			</span>
			<span id="find-widget-outdated-search" class="outdated-search clickable" style="display: none;" onclick="findWidgetInstance.refreshCurrentSearch()"
				title="The table has changed, thus the search is outdated. Click to refresh the search.">
				<i class="fas fa-exclamation-triangle"></i>
			</span>
		</div>	

		<!-- search navigation buttons-->
		<div class="find-navigation-actions">

			<vscode-button appearance="icon" id="find-widget-previous" class="clickable" onclick="findWidgetInstance.gotoPreviousFindMatch()" title="Previous match (⇧F3)">
				<span>
					<i class="fas fa-chevron-up"></i>
				</span>
			</vscode-button>
	
			<vscode-button appearance="icon" id="find-widget-next"  class="clickable" onclick="findWidgetInstance.gotoNextFindMatch()" title="Next match (F3)">
				<span>
					<i class="fas fa-chevron-down"></i>
				</span>
			</vscode-button>
	
			<vscode-button appearance="icon" class="clickable"  onclick="findWidgetInstance.showOrHideWidget(false)" title="Close (Escape)">
				<span>
					<i class="fas fa-times"></i>
				</span>
			</vscode-button>

		</div>

	</div>
		`;
    }
    let bodyPageHtml = ``;
    {
        bodyPageHtml = /*html*/ `
		<div class="page full-h">

			<div class="all-options">

				<table>
					<thead>
						<tr>
							<th>
								<div class="options-title clickable" onclick="toggleOptionsBar()">
									<span>
										<i id="options-bar-icon" class="fas fa-chevron-right"></i> Read options
									</span>
								</div>
							</th>
							<th>
								<div class="options-title clickable" onclick="toggleOptionsBar()">
										Write options
								</div>
							</th>
							<th style="width: 100%;">
								<div class="options-title">
										<div class="clickable" onclick="toggleOptionsBar()">Preview</div>

										<vscode-button appearance="icon" class="mar-left-half clickable" onclick="generateCsvPreview()" title="Refresh the preview">
										<span>
											<i class="fas fa-redo-alt"></i>
										</span>
										</vscode-button>
				
										<!-- no css tooltip because we want a delay-->
										<vscode-button appearance="icon" id="preview-copy-icon" class="mar-left-half clickable" onclick="copyPreviewToClipboard()" title="Creates the preview and copies it to the clipboard">
											<span>
												<i class="fas fa-paste"></i>
											</span>
										</vscode-button>
				
										<vscode-button appearance="icon" id="re-render-table-icon" class="mar-left-half clickable" onclick="reRenderTable()" style="margin-left: 2em;" title="Redraws the table. This can fix some measuring issues (e.g. after the font size changed)">
											<span>
												<i class="fas fa-ruler-combined"></i>
											</span>
										</vscode-button>

										<vscode-button appearance="icon" id="force-column-resize-icon" class="mar-left-half clickable" onclick="forceResizeColumns()" style="margin-left: 0.5em;" title="Resizes all column widths to match their content">
											<span>
												<i class="fas fa-arrows-alt-h"></i>
											</span>
										</vscode-button>

										<vscode-button appearance="icon" id="reload-file" class="clickable" onclick="preReloadFileFromDisk()" style="margin-left: 2em;" title="Reload the csv file content (from disk)">
											<span>
												<i class="fas fa-sync-alt"></i>
											</span>
										</vscode-button>

										<!-- fixed rows top -->
										<div class="flexed changeable-indicator" style="margin-left: 2em;">
											<div>
												<vscode-button appearance="icon" id="fixed-rows-icon" class="clickable" title="Set fixed rows top" onclick="_toggleFixedRowsText()">
													<span>
														<i class="rotated-90deg fas fa-align-left"></i>
													</span>
												</vscode-button>
												<span id="fixed-rows-text" style="margin-left: 0.5rem;" class="dis-hidden">fixed rows:</span>
											</div>
											<div id="fixed-rows-top-info" class="text" style="margin-left: 0.5rem;">0</div>
											<div class="changeable" style="margin-left: 0.5rem;">
												<span class="clickable" onclick="incFixedRowsTop()"><i class="fas fa-chevron-up"></i></span>
												<span class="clickable" onclick="decFixedRowsTop()"><i class="fas fa-chevron-down"></i></span>
											</div>
										</div>
										<!-- fixed columns left -->
										<div class="flexed changeable-indicator" style="margin-left: 1em;">
											<div>
												<vscode-button appearance="icon" id="fixed-columns-icon" class="clickable" title="Set fixed columns left" onclick="_toggleFixedColumnsText()">
													<span>
														<i class="fas fa-align-left"></i>
													</span>
												</vscode-button>
												<span id="fixed-columns-text" style="margin-left: 0.5rem;" class="dis-hidden">fixed columns:</span>
											</div>
											<div id="fixed-columns-top-info" class="text" style="margin-left: 0.5rem;">0</div>
											<div class="changeable" style="margin-left: 0.5rem;">
												<span class="clickable" onclick="incFixedColsLeft()"><i class="fas fa-chevron-up"></i></span>
												<span class="clickable" onclick="decFixedColsLeft()"><i class="fas fa-chevron-down"></i></span>
											</div>
										</div>
										<!-- toggle readonly mode -->
										<div class="flexed toggle-btn clickable" style="margin-left: 1em;">
											<vscode-button appearance="icon" id="is-readonly-mode-toggle" onclick="toggleReadonlyMode()" title="Toggls the readonly table mode (SET IN CODE AT STARTUP)">
												<span>
													<i class="fas fa-pen"></i>
													<i class="fas fa-slash"></i>
													<i class="fas fa-slash"></i>
												</span>
											</vscode-button>
										</div>

										<div id="source-file-unwatched-indicator" class="hoverable tooltip op-hidden is-tooltip-left is-tooltip-multiline" style="float: right;margin-right: 5px;"
											data-tooltip="The csv source file cannot be automatically reloaded if the file on disk is changed (because it's not in the current workspace). You will get notified if the file is changed but then you need to open/display the source csv file in vs code and manually refresh the table (refresh button). Alternatively just close this table and reopen it.">
											<span>
												<i class="fas fa-eye"></i>
											</span>
										</div>
										<div id="unsaved-changes-indicator" class="hoverable unsaved-changes-indicator op-hidden tooltip is-tooltip-left" style="float: right;margin-right: 10px;"
											data-tooltip="You might have unsaved changes">
											<span>
												<i class="fas fa-save"></i>
											</span>
										</div>
										
								</div>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>
									<div id="read-options-content" class="options-content on-readonly-disable-div">

										<div class="field same-line" style="display: none;">
												<label>Encoding</label>
												<div class="select">
													<vscode-dropdown id="read-option-encoding" style="width: 11rem;">
														<vscode-option id="read-option-encoding-auto" value="auto">Auto detect</vscode-option>
														<!-- options will be auto inserted here -->
													</vscode-dropdown>
												</div>
											</div>
					
											<div class="field">
												<vscode-checkbox id="has-header" type="checkbox" name="has-header" class="" checked="checked" onchange="tryApplyHasHeader(true, false)">
													<span id="has-header-label">Has header</span>
												</vscode-checkbox>
												<span class="tooltip is-tooltip-right is-tooltip-multiline"
													data-tooltip="The first row is used as header. Note that changing this option will also change the write header option. It will also clear the undo/redo stack! If the table has only one row this cannot be applies immediately, it will be applied if the table has more than 1 row.">
													<i class="fas fa-question-circle"></i>
												</span>
											</div>
					
											<!-- this makes the row data invalid if we have more than 1 col-->
											<!-- <div class="field">
													<input id="skip-empty-lines" type="checkbox" name="skip-empty-lines" class="switch is-rounded" checked="checked" onchange="setSkipEmptyLines()" disabled>
													<label for="skip-empty-lines">
														<span>Skip empty lines</span>
														<span class="tooltip is-tooltip-multiline" data-tooltip="If enabled empty lines will be used as row. Disabled because empty rows are invalid if we have more than 1 column.">
																<i class="fas fa-question-circle"></i>
														</span>
													</label>
											</div> -->
					
											<!-- delimiter and comment -->
											<div class="flexed">
												<div class="field">
													<label>
														<span>Delimiter</span>
														<span class="clickable tooltip" data-tooltip="Set to tab character"
															onclick="setReadDelimiter('\t')">⇥</span>
														<span id="read-delimiter-tooltip" class="tooltip" data-tooltip="Empty to auto detect">
															<i class="fas fa-question-circle"></i>
														</span>
													</label>
													<!--<vscode-text-field id="delimiter-string" class="input" type="text" placeholder="auto" oninput="setDelimiterString()" />-->
													<input id="delimiter-string" class="input vscode-text-field" type="text" placeholder="auto" oninput="setDelimiterString()" />
												</div>
					
												<div class="field mar-left-half">
													<label>
														<span>Comment</span>
														<span class="tooltip is-tooltip-multiline"
															data-tooltip="Comments before and after csv data are preserved. Comments between data rows are ignored. Empty to treat every line as data (no comments).">
															<i class="fas fa-question-circle"></i>
														</span>
													</label>
													<!--<vscode-text-field id="comment-string" class="input" type="text" placeholder="Empty for no comments" oninput="setCommentString()" />-->
													<input id="comment-string" class="input vscode-text-field" type="text" placeholder="Empty for no comments" oninput="setCommentString()" />
												</div>
											</div>
					
											<!-- quote and escape -->
											<div class="flexed">
												<div class="field">
													<label>
														<span>QuoteChar</span>
													</label>
													<!--<vscode-text-field id="quote-char-string" class="input" type="text" oninput="setQuoteCharString()" onchange="setQuoteCharString()" /> -->
													<input id="quote-char-string" class="input vscode-text-field" type="text" oninput="setQuoteCharString()" />
												</div>
					
												<div class="field mar-left-half">
												
													<label>
														<span>EscapeChar</span>
														<span class="tooltip is-tooltip-multiline"
															data-tooltip="The character used to escape the QuoteChar inside field values">
															<i class="fas fa-question-circle"></i>
														</span>
													</label>
													<!--<vscode-text-field id="escape-char-string" placeholder="Placeholder Text" class="input" type="text" oninput="setEscapeCharString()"/>-->
													<input id="escape-char-string" placeholder="Placeholder Text" class="input vscode-text-field" type="text" oninput="setEscapeCharString()" />
												</div>
											</div>

											<div>
												<vscode-button appearance="secondary" class="" style="height: 36px; margin-top: 1rem;" onclick="toggleAskReadAgainModal(true)">
													<span style="width: 14rem">Reset data and apply read options</span>

													<span slot="end" class="icon is-small">
														<span class="tooltip  mar-left-half is-tooltip-multiline is-tooltip-right"
															data-tooltip="The input file content was stored locally and is used as data. Thus this view is independent of the source file">
															<i class="fas fa-question-circle"></i>
														</span>
													</span>
												</vscode-button>
											</div>
									</div>
							</td>
							<td>
									<div id="write-options-content" class="options-content on-readonly-disable-div">

										<div class="field same-line" style="display: none;">
											<label>Encoding</label>
											<div class="select">
												<vscode-dropdown id="write-option-encoding" style="width: 11rem;">
													<vscode-option value="auto">Same as read</vscode-option>
												</vscode-dropdown>
											</div>
										</div>

										<div class="field">
											<vscode-checkbox id="has-header-write" type="checkbox" name="has-header-write" class="" checked="checked" onchange="setHasHeaderWrite()">
												<span>Write header</span>
											</vscode-checkbox>
											<span class="tooltip is-tooltip-bottom" data-tooltip="Checked: writes the header row, unchecked: not">
												<i class="fas fa-question-circle"></i>
											</span>
										</div>
						
										<!-- delimiter and comment -->
										<div class="flexed">
											<div class="field">
												<label for="delimiter-string-write">
													<label>
														<span>Delimiter</span>
														<span class="clickable tooltip" data-tooltip="Set to tab character"
															onclick="setWriteDelimiter('\t')">⇥</span>
														<span class="tooltip" data-tooltip="Empty to use delimiter from read">
															<i class="fas fa-question-circle"></i>
														</span>
													</label>
												</label>
												<!--<vscode-text-field id="delimiter-string-write" class="input" type="text" placeholder="auto" oninput="setDelimiterStringWrite()" />-->
												<input id="delimiter-string-write" class="input vscode-text-field"" type="text" placeholder="auto" oninput="setDelimiterStringWrite()" />
											</div>
					
											<div class="field mar-left-half">
												<label for="comment-string-write">
													<label>
														<span>Comment</span>
														<span class="tooltip is-tooltip-multiline"
															data-tooltip="Empty for no comments. Comments before and after csv data are written if char is present. Empty to exclude comments.">
															<i class="fas fa-question-circle"></i>
														</span>
													</label>
												</label>
												<!--<vscode-text-field id="comment-string-write" class="input" type="text" placeholder="Empty for no comments" oninput="setCommentStringWrite()" />-->
												<input id="comment-string-write" class="input vscode-text-field"" type="text" placeholder="Empty for no comments" oninput="setCommentStringWrite()" />
											</div>
										</div>
					
										<!-- quote and escape -->
										<div class="flexed">
											<div class="field">
												<label>
													<span>QuoteChar</span>
												</label>
												<!--<vscode-text-field id="quote-char-string-write" class="input" type="text" oninput="setQuoteCharStringWrite()" />-->
												<input id="quote-char-string-write" class="input vscode-text-field" type="text" oninput="setQuoteCharStringWrite()" />
											</div>
					
											<div class="field mar-left-half">
												<label>
													<span>EscapeChar</span>
													<span class="tooltip is-tooltip-multiline"
														data-tooltip="The character used to escape the QuoteChar inside field values">
														<i class="fas fa-question-circle"></i>
													</span>
												</label>
												<!--<vscode-text-field id="escape-char-string-write" class="input" type="text" oninput="setEscapeCharStringWrite()" />-->
												<input id="escape-char-string-write" class="input vscode-text-field" type="text" oninput="setEscapeCharStringWrite()" />
											</div>
										</div>
					
										<div class="flexed">
					
											<div class="field">
												<vscode-checkbox id="quote-all-fields-write" type="checkbox" name="quote-all-fields-write" class="" checked="checked" onchange="setQuoteAllFieldsWrite()">
												<span>Quote all fields</span>
												</vscode-checkbox>
											</div>
					
										</div>
					
										<!-- see help modal why -->
										<div class="flexed" style="display: none;">
											<div class="field same-line" title="End of line terminator">
												<label for="comment-string-write">EOL</label>
												<div class="select">
													<vscode-dropdown id="newline-select-write" onchange="setNewLineWrite()">
														<vscode-option id="newline-same-as-input-option" value="">Same as input</vscode-option>
														<vscode-option value="lf">Linux/Mac (LF)</vscode-option>
														<vscode-option value="crlf">Windows (CRLF)</vscode-option>
													</vscode-dropdown>
												</div>
											</div>
										</div>
						
										</div>
							</td>
							<td>
								<div id="preview-content" class="options-content">
										<vscode-text-area resize="vertical" id="csv-preview" style="display: block;" class="preview-csv-textarea" rows="11"></vscode-text-area>
									</div>
							</td>
						</tr>

					</tbody>
				</table>

			</div>

			<div class="table-action-buttons">

				<div class="separated-btns">

					<div class="side-panel-toggle-wrapper">
						<div id="left-panel-toggle" class="clickable" onclick="toggleSidePanel()">
							<i id="left-panel-toggle-icon-expand" class="fas fa-chevron-right left-panel-toggle-icon-expand"></i>
							<i class="fas fa-chevron-down left-panel-toggle-icon-collapse"></i>
						</div>
					</div>
					
					<vscode-button appearance="secondary" id="add-row-btn" class="on-readonly-disable-btn" onclick="addRow()">
						<span slot="start" class="icon is-small"><i class="fas fa-plus"></i></span>
						<span style="width: 4rem">Add row</span>
					</vscode-button>
					<div class="row-col-insert-btns">
					
						<vscode-button appearance="secondary" class="on-readonly-disable-btn" onclick="insertRowAbove()" title="Insert row above current row [ctrl+shift+alt+up, ctrl+shift+ins]">
							<i class="fas fas fa-caret-up "></i>
						</vscode-button>
						<vscode-button appearance="secondary" class="on-readonly-disable-btn" onclick="insertRowBelow() " title="Insert row below current row [ctrl+shift+alt+down, ctrl+ins]">
							<i class="fas fa-caret-down ad"></i>
						</vscode-button>
					</div>

					<vscode-button appearance="secondary" id="add-col-btn" class="on-readonly-disable-btn" onclick="addColumn()">
						<span slot="start" class="icon is-small"><i class="fas fa-plus"></i></span>
						<span style="width: 5rem">Add column</span>
					</vscode-button>
					<div class="row-col-insert-btns">
						<vscode-button appearance="secondary" class="on-readonly-disable-btn" onclick="insertColLeft()" title="Insert column left to current column [ctrl+shift+alt+left]">
							<i class="fas fas fa-caret-left"></i>
						</vscode-button>
						<vscode-button appearance="secondary" class="on-readonly-disable-btn" onclick="insertColRight()" title="Insert column right to current column [ctrl+shift+alt+right]">
							<i class="fas fa-caret-right"></i>
						</vscode-button>
					</div>

					<vscode-button appearance="secondary" id="btn-apply-changes-to-file-and-save" class="mar-left on-readonly-disable-btn" onclick="postApplyContent(true)">
						<span slot="start" class="icon is-small"><i class="fas fa-save"></i></span>
						<span style="width: 13rem">Apply changes to file and save</span>

						<span slot="end" class="icon is-small">
							<span class="tooltip is-tooltip-multiline mar-left-half"
								data-tooltip="Applies the csv content back to the source file and saves the source file (if something changed) [ctrl+s/cmd+s]">
								<i class="fas fa-question-circle"></i>
							</span>
						</span>
					</vscode-button>

					<vscode-button appearance="secondary" id="btn-apply-changes-to-file" class="on-readonly-disable-btn mar-left-half" onclick="postApplyContent(false)">
						<span slot="start" class="icon is-small"><i class="fas fa-reply"></i></span>
						<span style="width: 9rem">Apply changes to file</span>

						<span slot="end" class="icon is-small">
							<span class="tooltip mar-left-half is-tooltip-multiline" data-tooltip="Applies the csv content back to the source file (if something changed). After this the editor has no unsaved changes.">
								<i class="fas fa-question-circle"></i>
							</span>
						</span>
					</vscode-button>

					<div id="status-info-wrapper">
						<div>
							<span id="status-info"></span>
						</div>
					</div>

					<div class="flexed">

						<div>
							<vscode-button appearance="secondary" id="show-comments-btn" style="margin-right: 1em; height: 100%" onclick="showOrHideAllComments(true)">
								<span slot="start" class="icon is-small"><i class="far fa-comments"></i></span>
								<span style="width: 7rem">Show comments</span>
							</vscode-button>
							<vscode-button appearance="secondary" id="hide-comments-btn" style="margin-right: 1em; height: 100%" onclick="showOrHideAllComments(false)">
								<span slot="start" class="icon is-small"><i class="fas fa-comments"></i></span>
								<span style="width: 7rem">Hide comments</span>

								<span slot="end" class="icon is-small">
									<span class="tooltip mar-left-half is-tooltip-multiline is-tooltip-left"
										data-tooltip="Hides rows starting with a comment. The row headers will display an indicator if a row above or below is hidden. Hidden rows are also exported!">
										<i class="fas fa-question-circle"></i>
									</span>
								</span>
								</vscode-button>
						</div>

						<vscode-button appearance="secondary" style="margin-right: 1em" class="on-readonly-disable-btn" onclick="trimAllCells()">
							<span slot="start" class="icon is-small"><i class="fas fa-hand-scissors"></i></span>
							<span style="width: 2rem">Trim</span>

							<span slot="end" class="icon is-small">
								<span class="tooltip mar-left-half is-tooltip-multiline is-tooltip-left"
									data-tooltip="Trims every cell (including header row) in the table (removes leading and trailing spaces, tabs, ...). This will clear undo/redo stack!">
									<i class="fas fa-question-circle"></i>
								</span>
							</span>
						</vscode-button>

						<vscode-button appearance="secondary" class="" onclick="toggleHelpModal(true)">
							<span slot="start" class="icon is-small"><i class="fas fa-question"></i></span>
							<span style="width: 2rem">Help</span>
						</vscode-button>
					</div>

				</div>
				<div id="received-csv-prog-bar-wrapper">
					<progress id="received-csv-prog-bar" class="progress is-info" value="50" max="100"></progress>
				</div>
			</div>


			<!-- main editor/grid area -->
			<div class="side-paneled">
				<div id="side-panel" class="side-panel">

					<div id="side-panel-inner">

						<div class="stat">
							<div>Numbers sum
								<span class="tooltip is-tooltip-right is-tooltip-multiline"
									data-tooltip="The sum of numbers in the selected cells (only connected cells). Only the first number of a cell is used. Arbitrary-precision is powered by big.js">
									<i class="far fa-question-circle"></i>
								</span>
							</div>
							<div id="stat-sum-of-numbers">000</div>
						</div>

						<div class="stat">
							<div>Selected cells
								<span class="tooltip is-tooltip-right" data-tooltip="The number of selected cells">
									<i class="far fa-question-circle"></i>
								</span>
							</div>
							<div id="stat-selected-cells-count">000</div>
						</div>

						<div class="sub-stat">
							<div>Not empty
								<span class="tooltip is-tooltip-right is-tooltip-multiline" data-tooltip="The selected cells count where the value is not empty (whitespace is counted as value)">
									<i class="far fa-question-circle"></i>
								</span>
							</div>
							<div id="stat-selected-not-empty-cells">000</div>
						</div>

						<div class="stat">
							<div>Selected rows
								<span class="tooltip is-tooltip-right" data-tooltip="The selected rows count">
									<i class="far fa-question-circle"></i>
								</span>
							</div>

							<div id="stat-selected-rows">000</div>
						</div>

						<div class="stat">
							<div>Selected cols
								<span class="tooltip is-tooltip-right" data-tooltip="The selected columns count">
									<i class="far fa-question-circle"></i>
								</span>
							</div>
							<div id="stat-selected-cols">000</div>
						</div>

						<div class="stat divider"></div>

						<div class="stat">
							<div>Rows count</div>
							<div id="stat-rows-count">000</div>
						</div>

						<div class="stat">
							<div>Cols count</div>
							<div id="stat-cols-count">000</div>
						</div>

						<div class="stat divider"></div>

						<div class="stat">
							<div>Numbers style
								<span class="tooltip is-tooltip-right is-tooltip-multiline" data-tooltip="The number style only applies for the stats, does not affect sorting! Change before selecting cells.">
									<i class="far fa-question-circle"></i>
								</span>
							</div>
							<div class="control" style="padding-left: 0;">
							<vscode-radio-group>
								<vscode-radio id="numbers-style-en">
									<span>en: 3.14</span>
									<span class="tooltip is-tooltip-right is-tooltip-multiline" data-tooltip="Decimal separator: '.' Thousand separator: a single whitespace or ','">
										<i class="far fa-question-circle"></i>
									</span>
								</vscode-radio>
								<vscode-radio  id="numbers-style-non-en">
									<span>non-en: 3,14</span>
									<span class="tooltip is-tooltip-right is-tooltip-multiline" data-tooltip="Decimal separator: ',' Thousand separator: a single whitespace or '.'">
										<i class="far fa-question-circle"></i>
									</span>
								</vscode-radio>
							</vscode-radio-group>
							</div>
						</div>

						<div class="stat divider"></div>
						
						<!-- some day an ad can be placed here -->
						<!-- <div>
							<div style="border: 1px solid black; height: 300px;">
								AD HERE
							</div>
						</div> -->
					</div>

					<!-- place this inside to collapse this with the sidebar -->
					<div id="side-panel-resize-handle"></div>
				</div>

				<!-- main editor/grid area -->
				<div id="csv-editor-wrapper" class="csv-editor-wrapper">
					<div id="csv-editor">No data received</div>
				</div>

			</div>

		</div>
		`;
    }
    let helpModalHtml = ``;
    {
        helpModalHtml = /*html*/ `
		<div id="help-modal" class="modal">
		<div class="modal-background" onclick="toggleHelpModal(false)"></div>
		<div class="modal-content">
			<div class="box">

				<h3 class="title is-3">Features/Shortcuts</h3>
				<div class="content">
					<ul>
						<li>Undo/Redo</li>
						<li>Click on column header text to sort</li>
						<li>Click left next to the row/column header text to select then drag to rearrange</li>
						<li>Resize row/column</li>
						<li>
							<div class="keys">Home</div> to move to the first cell in a row
						</li>
						<li>
							<div class="keys">End</div> to move to the last cell in a row
						</li>

						<li>
							<div class="keys">Ctrl</div>+<div class="keys">Home</div> to move to the first cell in a column
						</li>
						<li>
							<div class="keys">Ctrl</div>+<div class="keys">End</div> to move to the last cell in a column
						</li>
						<li>
							<div class="keys">Esc</div> to cancel editing and close cell editor
						</li>
						<li>
							<div class="keys">Ctrl</div>+<div class="keys">Enter</div> to add a line break in a cell
						</li>

						<li>To delete a row/column hover over it and click the trash-icon</li>

						<li>Double click on a column resize handle to fit content, double click on an auto sized column to set width
							to
							200px (good for very wide columns)</li>

					</ul>

					For a full list of shortcuts see <a target="_blank"
						href="https://handsontable.com/docs/6.2.2/tutorial-keyboard-navigation.html">https://handsontable.com/docs/6.2.2/tutorial-keyboard-navigation.html</a>
				</div>

				<h3 class="title is-3">Hints</h3>
				<div class="content">
					<ul>
					<!-- turns out handsontable checks if the values are isNaN and if both are numbers they are parsed as floats and compared as floats ... so comparing numbers or text should be fine here -->
						<li>Sorting is not automatically updated after data has changed</li>
						<li>Sorting state is exported</li>
						<li>You can use ctrl/cmd click on a column header to sort by multiple columns</li>
						<li>The unsaved changes indicator is display on any change (never cleared until you apply the changes, even if you revert manually)</li>
						<li>When you see the unsaved changes indicator right after the table was loaded then some rows were expanded (to ensure all rows have the same length)</li>
						<li>You can right-click on the table to get a context menu</li>
						<li>Hidden rows are also exported</li>
						<li>Comment rows will export only the first cell/column. If you use a cell other than the first for comments the cell color will indicate this. </li>
						<li>If you edit an unnamed (csv) file and close it then the editor will be closed too (unsaved changes will
							be lost)!</li>
						<li>Copy & Past use tab (<div class="keys">⇥</div>) as separator (same as excel)</li>
						<li>You cannot change the new line character (because vs code automatically converts it to the file setting
							i think)
						</li>
						<li>If a row has more cell than the others empty cells are added to match the row with the highest cell
							count</li>
						<li>Extension configuration is only applied for new editors</li>
						<li>You can delete multiple rows/cols by selecting them via shift and right click then remove</li>
					</ul>
				</div>


			</div>
		</div>
		<button class="modal-close is-large clickable" aria-label="close" onclick="toggleHelpModal(false)">
			<i class="fas fa-times"></i>
		</button>
	</div>
		`;
    }
    let askReadAgainModalHtml = ``;
    {
        askReadAgainModalHtml = /*html*/ `
		<div id="ask-read-again-modal" class="modal modal-centered">
		<div class="modal-background"></div>
		<div class="modal-content">
			<div class="box">
				<h3 class="title is-3">Reset data and apply read options</h3>

				<p>
					Are you sure you want to overwrite the table with the initial content of the file? <br />
					This will use the initial data (when you opened the csv editor) and discard all changes applied to the table! <br />
					Note that this will not reread or reload the csv file content (a snapshot of the file was stored in memory when you opened the csv editor)!
				</p>

				<div style="margin-top: 1em">
					<vscode-button class="" onclick="resetDataFromResetDialog()">
						<span style="width: 3rem">Reset</span>
					</vscode-button>

					<vscode-button appearance="secondary" style="margin-left: 0.5em" class="" onclick="toggleAskReadAgainModal(false)">
						<span style="width: 3rem">Cancel</span>
					</vscode-button>
				</div>

			</div>
		</div>
		<button class="modal-close is-large clickable" aria-label="close" onclick="toggleAskReadAgainModal(false)">
			<i class="fas fa-times"></i>
		</button>
	</div>
	`;
    }
    let askReloadFileModalHtml = ``;
    {
        askReloadFileModalHtml = /*html*/ `
		<div id="ask-reload-file-modal" class="modal modal-centered">
		<div class="modal-background"></div>
		<div class="modal-content">
			<div class="box">
				<h3 class="title is-3">Reload file content and discard changes</h3>

				<p>
					Are you sure you want to read the source file again? <br />
					All changes to the table will be discarded! <br />
					<br />
					<i>This will also update the snapshot of the file that is used for the reset data feature.</i>
				</p>

				<div style="margin-top: 1em">
					<vscode-button class="" onclick="reloadFileFromDisk()">
						<span style="width: 3rem">Reload</span>
					</vscode-button>

					<vscode-button appearance="secondary" style="margin-left: 0.5em" class="" onclick="toggleAskReloadFileModalDiv(false)">
						<span style="width: 3rem">Cancel</span>
					</vscode-button>
				</div>

			</div>
		</div>
		<button class="modal-close is-large clickable" aria-label="close" onclick="toggleAskReloadFileModalDiv(false)">
			<i class="fas fa-times"></i>
		</button>
	</div>
		`;
    }
    let sourceFileChangedModalHtml = ``;
    {
        sourceFileChangedModalHtml = /*html*/ `
		<div id="source-file-changed-modal" class="modal modal-centered">
		<div class="modal-background"></div>
		<div class="modal-content">
			<div class="box">
				<h3 class="title is-3">Source file changed</h3>

				<p>
					The source file changed, thus the table is not up-to-date. <br />
					You can reload the file content which will discard all changes to the table! <br /><br />
					Or you can ignore the changes. <br />
					<br />
					<i>This will also update the snapshot of the file that is used for the reset data feature.</i>
				</p>

				<div style="margin-top: 1em">
					<vscode-button class="" onclick="reloadFileFromDisk()">
						<span style="width: 3rem">Reload</span>
					</vscode-button>

					<vscode-button appearance="secondary" style="margin-left: 0.5em" class="" onclick="toggleSourceFileChangedModalDiv(false)">
						<span style="width: 3rem">Ignore</span>
					</vscode-button>
				</div>

			</div>
		</div>
		<!-- user must choose -->
		<!--<button class="modal-close is-large clickable" aria-label="close" onclick="toggleSourceFileChangedModalDiv(false)">
			<i class="fas fa-times"></i>
		</button>-->
	</div>
		`;
    }
    return /*html*/ `
	<!DOCTYPE html>
	<html>
	<head>
		<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data:; script-src ${webview.cspSource} 'unsafe-inline'; style-src ${webview.cspSource} 'unsafe-inline'; font-src ${webview.cspSource};">

		<style>
			@font-face {
				font-family: 'Font Awesome 5 Free';
				font-weight: 900;
				src: url("${iconFont}") format("woff2");
			}
		</style>

		<link rel="stylesheet" href="${handsontableCss}">

		<link rel="stylesheet" href="${fontAwesomeCss}">

		<link rel="stylesheet" href="${mainCss}">
		<link rel="stylesheet" href="${darkThemeCss}">
		<link rel="stylesheet" href="${lightThemeCss}">
		<link rel="stylesheet" href="${hightContrastThemeCss}">
		<link rel="stylesheet" href="${settingsOverwriteCss}">
	</head>
	<body class="vs-code vs-code-settings-font-size">
	<script>
		var initialConfig = ${JSON.stringify(config)};
		var initialVars = ${JSON.stringify(initialVars)};
		</script>
		<script src="${beforeDomLoadedJs}"></script>
	
	${findWidgetHtml}

	${bodyPageHtml}

	${helpModalHtml}

	${askReadAgainModalHtml}

	${askReloadFileModalHtml}

	${sourceFileChangedModalHtml}


	<script async type="module" src="${toolkit}"></script>
	<script src="${handsontableJs}"></script>
	<script src="${papaparseJs}"></script>
	<script src="${mousetrapJs}"></script>
	<script src="${mousetrapBindGlobalJs}"></script>
	<script src="${bigJs}"></script>
	<script src="${bigJsToFormat}"></script>

	<script src="${progressJs}"></script>
	<script src="${findWidgetJs}"></script>
	<script src="${ioJs}"></script>
	<script src="${utilJs}"></script>
	<script src="${uiJs}"></script>
	<script src="${mainJs}"></script>

	</body>
</html>`;
}
exports.createEditorHtml = createEditorHtml;
//# sourceMappingURL=getHtml.js.map