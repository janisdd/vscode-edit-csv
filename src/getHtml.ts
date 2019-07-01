import * as vscode from 'vscode';
import * as path from 'path';
import { getExtensionConfiguration } from './configurationHelper';

/**
 * returns a local file path relative to the extension root dir
 * @param filePath 
 */
export function getResourcePath(context: vscode.ExtensionContext, filePath: string): string {
	//fix for windows because there path.join will use \ as separator and when we inline this string in html/js
	//we get specials strings e.g. c:\n
	return `vscode-resource:${path.join(context.extensionPath, filePath).replace(/\\/g, '/')}`
}

/**
 * creates the html for the csv editor
 * @param context 
 * @param initialContent 
 */
export function createEditorHtml(context: vscode.ExtensionContext, initialContent: string): string {

	const _getResourcePath = getResourcePath.bind(undefined, context)

	let handsontableCss = _getResourcePath('node_modules/handsontable/dist/handsontable.min.css')
	let handsontableJs = _getResourcePath('node_modules/handsontable/dist/handsontable.min.js')
	// let papaparseJs = _getResourcePath('node_modules/papaparse/papaparse.js')
	let papaparseJs = _getResourcePath('thirdParty/papaparse.min.js')
	let fontAwesomeCss = _getResourcePath('node_modules/@fortawesome/fontawesome-free/css/all.min.css')
	//we need to load the font manually because the url() seems to not work properly with vscode-resource
	const iconFont = _getResourcePath('node_modules/@fortawesome/fontawesome-free/webfonts/fa-solid-900.woff2')
	let bulmaCss = _getResourcePath('node_modules/bulma/css/bulma.min.css')
	let bulmaExtensionCss = _getResourcePath('node_modules/bulma-extensions/dist/css/bulma-extensions.min.css')

	const mainCss = _getResourcePath('csvEditorHtml/main.css')
	const darkThemeCss = _getResourcePath('csvEditorHtml/dark.css')
	const lightThemeCss = _getResourcePath('csvEditorHtml/light.css')
	const hightContrastThemeCss = _getResourcePath('csvEditorHtml/high_contrast.css')

	//scripts
	const ioJs = _getResourcePath('csvEditorHtml/out/io.js')
	const uiJs = _getResourcePath('csvEditorHtml/out/ui.js')
	const utilJs = _getResourcePath('csvEditorHtml/out/util.js')
	const mainJs = _getResourcePath('csvEditorHtml/out/main.js')

	const config = getExtensionConfiguration()

	return `
	<!DOCTYPE html>
	<html>
	<head>
		<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: data:; script-src vscode-resource: 'unsafe-inline'; style-src vscode-resource: 'unsafe-inline'; font-src vscode-resource:;">

		<style>
			@font-face {
				font-family: 'Font Awesome 5 Free';
				font-weight: 900;
				src: url("${iconFont}") format("woff2");
			}
		</style>

		<link rel="stylesheet" href="${handsontableCss}">
		<script src="${handsontableJs}"></script>
		<script src="${papaparseJs}"></script>
	
		<link rel="stylesheet" href="${fontAwesomeCss}">
	
		<link rel="stylesheet" href="${bulmaCss}">
		<link rel="stylesheet" href="${bulmaExtensionCss}">
		<link rel="stylesheet" href="${mainCss}">
		<link rel="stylesheet" href="${darkThemeCss}">
		<link rel="stylesheet" href="${lightThemeCss}">
		<link rel="stylesheet" href="${hightContrastThemeCss}">
	</head>
	<body>
	
	<div class="page full-h">

		<div class="all-options">

			<div class="options-bar">
				<div class="flexed">
					<div class="options-title clickable" onclick="toggleReadOptions()">Read options <i id="read-options-icon"
							class="fas fa-chevron-right"></i></div>
				</div>

				<div id="read-options-content" class="options-content">
					<div>

						<div class="field">
							<input id="has-header" type="checkbox" name="has-header" class="switch is-rounded" checked="checked"
								onchange="applyHasHeader()">
							<label for="has-header">
								<span>Has header</span>
							</label>
							<span class="tooltip is-tooltip-right is-tooltip-multiline"
								data-tooltip="The first row is used as header. Note that changing this option will also change the write header option.">
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
								<input id="delimiter-string" class="input" type="text" placeholder="auto"
									oninput="setDelimiterString()">
							</div>

							<div class="field mar-left">
								<label>
									<span>Comment</span>
									<span class="tooltip is-tooltip-multiline"
										data-tooltip="Comments before and after csv data are preserved. Comments between data rows are ignored. Empty to treat every line as data (no comments).">
										<i class="fas fa-question-circle"></i>
									</span>
								</label>
								<input id="comment-string" class="input" type="text" placeholder="Empty for no comments"
									oninput="setCommentString()">
							</div>
						</div>

						<!-- quote and escape -->
						<div class="flexed">
							<div class="field">
								<label>
									<span>QuotChar</span>
								</label>
								<input id="quote-char-string" class="input" type="text" oninput="setQuoteCharString()">
							</div>

							<div class="field mar-left">
								<label>
									<span>EscapeChar</span>
								</label>
								<input id="escape-char-string" class="input" type="text" oninput="setEscapeCharString()">
							</div>
						</div>


						<button class="button is-light" onclick="toggleAskReadAgainModal(true)">
							<span>Reset data</span>
							<span class="tooltip  mar-left-half is-tooltip-multiline is-tooltip-right"
								data-tooltip="The input file content was stored locally and used as data. Thus this view is independent of the source file">
								<i class="fas fa-question-circle"></i>
							</span>
						</button>

					</div>
				</div>
			</div>

			<div class="options-bar">
				<div>
					<div class="options-title clickable" onclick="toggleWriteOptions()">Write options <i id="write-options-icon"
							class="fas fa-chevron-right"></i></div>
				</div>

				<div id="write-options-content" class="options-content">
					<div class="field">
						<input id="has-header-write" type="checkbox" name="has-header-write" class="switch is-rounded"
							checked="checked" onchange="setHasHeaderWrite()">
						<label for="has-header-write">
							<span>Write header</span>
						</label>
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
							<input id="delimiter-string-write" class="input" type="text" placeholder="auto"
								oninput="setDelimiterStringWrite()">
						</div>

						<div class="field mar-left">
							<label for="comment-string-write">
								<label>
									<span>Comment</span>
									<span class="tooltip is-tooltip-multiline"
										data-tooltip="Empty for no comments. Comments before and after csv data are written if char is present. Empty to exclude comments.">
										<i class="fas fa-question-circle"></i>
									</span>
								</label>
							</label>
							<input id="comment-string-write" class="input" type="text" placeholder="Empty for no comments"
								oninput="setCommentStringWrite()">
						</div>
					</div>

					<!-- quote and escape -->
					<div class="flexed">
						<div class="field">
							<label>
								<span>QuotChar</span>
							</label>
							<input id="quote-char-string-write" class="input" type="text" oninput="setQuoteCharStringWrite()">
						</div>

						<div class="field mar-left">
							<label>
								<span>EscapeChar</span>
							</label>
							<input id="escape-char-string-write" class="input" type="text" oninput="setEscapeCharStringWrite()">
						</div>
					</div>

					<div class="flexed">

						<div class="field">
							<input id="quote-all-fields-write" type="checkbox" name="quote-all-fields-write" class="switch is-rounded"
								checked="checked" onchange="setQuoteAllFieldsWrite()">
							<label for="quote-all-fields-write">
								<span>Quote all fields</span>
							</label>
						</div>

					</div>

					<!-- see help modal why -->
					<div class="field" style="display: none;">
						<label for="comment-string-write">NewLine</label>
						<div class="select">
							<select id="newline-select-write" onchange="setNewLineWrite()">
								<option value="">Same as input</option>
								<option value="crlf">Windows (CRLF)</option>
								<option value="lf">Linux/Mac (LF)</option>
							</select>
						</div>
					</div>

				</div>
			</div>

			<div class="options-bar" style="flex: 1;">
				<div>
					<div class="options-title">
						<span class="clickable" onclick="togglePreview()">Preview</span>
						<span><button class="button is-light is-small" style="vertical-align: middle;"
								onclick="generateCsvPreview()">Generate</button></span>
						<span class="clickable" onclick="togglePreview()">
							<i id="preview-icon" class="fas fa-chevron-right"></i>
						</span>

						<span class="mar-left-half clickable" onclick="copyPreviewToClipboard()"
							title="Creates the preview and copies it to the clipboard">
							<i id="preview-copy-icon" class="fas fa-paste"></i>
						</span>
					</div>

				</div>

				<div id="preview-content" class="options-content">
					<textarea id="csv-preview" class="textarea preview-csv-textarea"></textarea>
				</div>

			</div>
		</div>

		<div class="table-action-buttons">

			<div class="separated-btns">
				<button class="button is-outlined" onclick="addRow()">
					<span class="icon is-small">
						<i class="fas fa-plus"></i>
					</span>
					<span>Add row</span>
				</button>

				<button class="button is-outlined" onclick="addColumn()">
					<span class="icon is-small">
						<i class="fas fa-plus"></i>
					</span>
					<span>Add column</span>
				</button>

				<button class="button is-outlined mar-left" onclick="postApplyContent(true)">
					<span class="icon is-small">
						<i class="fas fa-save"></i>
					</span>
					<span>Apply and save</span>
					<span class="tooltip is-tooltip-multiline mar-left-half"
						data-tooltip="Applies the csv content back to the source file and saves the source file">
						<i class="fas fa-question-circle"></i>
					</span>
				</button>

				<button class="button is-outlined" onclick="postApplyContent(false)">
					<span class="icon is-small">
						<i class="fas fa-reply"></i>
					</span>
					<span>Apply</span>
					<span class="tooltip mar-left-half" data-tooltip="Applies the csv content back to the source file">
						<i class="fas fa-question-circle"></i>
					</span>
				</button>

				<div id="status-info-wrapper">
					<div>
						<span id="status-info"></span>
					</div>
				</div>

				<div>
					<button style="margin-right: 1em" class="button is-outlined" onclick="trimAllCells()">
						<span class="icon is-small">
							<i class="fas fa-hand-scissors"></i>
						</span>
						<span>Trim</span>
						<span class="tooltip mar-left-half is-tooltip-multiline is-tooltip-left" data-tooltip="Trims ever cell in the Table (removes leading and trailing spaces, tabs, ...). This Will also clear  Undo/Redo!">
							<i class="fas fa-question-circle"></i>
						</span>
					</button>
	
					<button class="button is-outlined" onclick="toggleHelpModal(true)">
						<span class="icon is-small">
							<i class="fas fa-question"></i>
						</span>
						<span>Help</span>
					</button>
				</div>
				
		</div>
			<div id="received-csv-prog-bar-wrapper">
				<progress id="received-csv-prog-bar" class="progress is-info" value="50" max="100"></progress>
			</div>
		</div>

		

		<!-- main editor/grid area -->
		<div id="csv-editor-wrapper" class="csv-editor-wrapper">
			<div id="csv-editor"></div>
		</div>

	</div>

	<div id="help-modal" class="modal help-modal">
		<div class="modal-background"></div>
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
							<li>Cell values are always trimmed</li>
						<li>If you edit an unnamed (csv) file and close it then the editor will be closed too (unsaved changes will
							be lost)!</li>
						<li>Sorting state is exported</li>
						<li>All cell values are strings thus sorting might behave differently than expected</li>
						<li>Copy & Past use tab (<div class="keys">⇥</div>) as separator (same as excel)</li>
						<li>You cannot change the new line character (because vs code automatically converts it to the file setting i think)
						</li>
						<li>If a row has more cell than the others empty cells are added to match the row with the highest cell count</li>
						<li>Extension configuration is only applied for new editors</li>
					</ul>
				</div>


			</div>
		</div>
		<button class="modal-close is-large" aria-label="close" onclick="toggleHelpModal(false)"></button>
	</div>

	<div id="ask-read-again-modal" class="modal help-modal">
		<div class="modal-background"></div>
		<div class="modal-content">
			<div class="box">
				<h3 class="title is-3">Reset data</h3>

				<p>
					Are you sure you want to overwrite the table?
					This will use the initial data when you opened the csv editor and discard all changes!
				</p>

				<div style="margin-top: 1em">
					<button class="button is-warning" onclick="resetDataFromResetDialog()">
						<span>Reset</span>
					</button>

					<button style="margin-left: 0.5em" class="button is-outlined" onclick="toggleAskReadAgainModal(false)">
						<span>Cancel</span>
					</button>
				</div>

			</div>
		</div>
		<button class="modal-close is-large" aria-label="close" onclick="toggleAskReadAgainModal(false)"></button>
	</div>


	<script>
	var initialConfig = ${JSON.stringify(config)};
</script>

	 <script src="${ioJs}"></script>
	 <script src="${utilJs}"></script>
	 <script src="${uiJs}"></script>
		<script src="${mainJs}"></script>
		
	</body>
</html>`
}