import * as vscode from 'vscode';
import * as path from 'path';
import { getExtensionConfiguration } from './configurationHelper';

/**
 * returns a local file path relative to the extension root dir
 * @param filePath 
 */
export function getResourcePath(context: vscode.ExtensionContext, filePath: string): string {
	return `vscode-resource:${path.join(context.extensionPath, filePath)}`
}

/**
 * creates the html for the csv editor
 * @param context 
 * @param initialContent 
 */
export function createEditorHtml(context: vscode.ExtensionContext, initialContent: string): string {

	const _getResourcePath = getResourcePath.bind(undefined, context)

	let handsontableCss = _getResourcePath('node_modules/handsontable/dist/handsontable.css')
	let handsontableJs = _getResourcePath('node_modules/handsontable/dist/handsontable.js')
	let papaparseJs = _getResourcePath('node_modules/papaparse/papaparse.js')
	let fontAwesomeCss = _getResourcePath('node_modules/@fortawesome/fontawesome-free/css/all.css')
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
		<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource:; script-src vscode-resource: 'unsafe-inline'; style-src vscode-resource: 'unsafe-inline'; font-src vscode-resource:;">

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
				<div>
					<div class="options-title clickable" onclick="toggleReadOptions()">Read options <i id="read-options-icon" class="fas fa-chevron-right"></i></div>
				</div>

				<div id="read-options-content" class="options-content">
					<div>

						<div class="field">
							<input id="has-header" type="checkbox" name="has-header" class="switch is-rounded" checked="checked" onchange="setHasHeader()">
							<label for="has-header">
								<span>Has header</span>
							</label>
							<span class="tooltip is-tooltip-right is-tooltip-multiline" data-tooltip="The first row is used as header. Note that changing this option will also change the write header option.">
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

						<div class="flexed">
							<div class="field">
								<label>
									<span>Delimiter</span>
									<span class="clickable tooltip" data-tooltip="Set to tab character" onclick="setReadDelimiter('\t')">⇥</span>
									<span class="tooltip" data-tooltip="Empty to auto detect">
										<i class="fas fa-question-circle"></i>
									</span>
								</label>
								<input id="delimiter-string" class="input" type="text" placeholder="auto" oninput="setDelimiterString()">
							</div>

							<div class="field mar-left">
								<label>
									<span>Comment</span>
									<span class="tooltip is-tooltip-multiline" data-tooltip="Comments before and after csv data are preserved. Comments between data rows are ignored. Empty to treat every line as data (no comments).">
										<i class="fas fa-question-circle"></i>
									</span>
								</label>
								<input id="comment-string" class="input" type="text" placeholder="Empty for no comments" oninput="setCommentString()">
							</div>
						</div>


						<button class="button is-light" onclick="readDataAgain(initialContent, defaultCsvReadOptions)">
							<span>Read again</span>
							<span class="tooltip  mar-left-half is-tooltip-multiline is-tooltip-right" data-tooltip="The input file content is saved locally and read again. Thus this view is independent of the source file">
								<i class="fas fa-question-circle"></i>
							</span>
						</button>

					</div>
				</div>
			</div>

			<div class="options-bar">
				<div>
					<div class="options-title clickable" onclick="toggleWriteOptions()">Write options <i id="write-options-icon" class="fas fa-chevron-right"></i></div>
				</div>

				<div id="write-options-content" class="options-content">
					<div class="field">
						<input id="has-header-write" type="checkbox" name="has-header-write" class="switch is-rounded" checked="checked"
						 onchange="setHasHeaderWrite()">
						<label for="has-header-write">
							<span>Write header</span>
						</label>
						<span class="tooltip is-tooltip-bottom" data-tooltip="Checked: writes the header row, unchecked: not">
							<i class="fas fa-question-circle"></i>
						</span>
					</div>

					<div class="flexed">
						<div class="field">
							<label for="delimiter-string-write">
								<label>
									<span>Delimiter</span>
									<span class="clickable tooltip" data-tooltip="Set to tab character" onclick="setWriteDelimiter('\t')">⇥</span>
									<span class="tooltip" data-tooltip="Empty to use delimiter from read">
										<i class="fas fa-question-circle"></i>
									</span>
								</label>
							</label>
							<input id="delimiter-string-write" class="input" type="text" placeholder="auto" oninput="setDelimiterStringWrite()">
						</div>

						<div class="field mar-left">
							<label for="comment-string-write">
								<label>
									<span>Comment</span>
									<span class="tooltip is-tooltip-multiline" data-tooltip="Empty for no comments. Comments before and after csv data are written if char is present. Empty to exclude comments.">
										<i class="fas fa-question-circle"></i>
									</span>
								</label>
							</label>
							<input id="comment-string-write" class="input" type="text" placeholder="Empty for no comments" oninput="setCommentStringWrite()">
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


					<div>
						<button id="toggle-comments-sections" class="button is-light" onclick="displayOrHideCommentsSections(false)">
							<span>Show Comments sections</span>
						</button>
					</div>

				</div>
			</div>

			<div class="options-bar" style="flex: 1;">
				<div>
					<div class="options-title">
						<span class="clickable" onclick="togglePreview()">Preview</span>
						<span><button class="button is-light is-small" style="vertical-align: middle;" onclick="generateCsvPreview()">Generate</button></span>
						<span class="clickable" onclick="togglePreview()">
							<i id="preview-icon" class="fas fa-chevron-right"></i>
						</span>
					</div>

				</div>

				<div id="preview-content" class="options-content">
					<textarea id="csv-preview" class="textarea preview-csv-textarea"></textarea>
				</div>

			</div>
		</div>

		<div class="table-action-buttons">
			<button class="button is-outlined" onclick="addRow()">
				<span class="icon is-small">
					<i class="fas fa-plus"></i>
				</span>
				<span>Add row</span>
			</button>

			<button class="button  is-outlined" onclick="addColumn()">
				<span class="icon is-small">
					<i class="fas fa-plus"></i>
				</span>
				<span>Add column</span>
			</button>

			<button style="margin-left: 3em;" class="button  is-outlined" onclick="postCommitContent(true)">
				<span class="icon is-small">
					<i class="fas fa-save"></i>
				</span>
				<span>Commit and save</span>
				<span class="tooltip is-tooltip-multiline mar-left-half" data-tooltip="Commits the csv content back to the source file and saves the source file">
					<i class="fas fa-question-circle"></i>
				</span>
			</button>

			<button class="button  is-outlined" onclick="postCommitContent(false)">
				<span class="icon is-small">
					<i class="fas fa-reply"></i>
				</span>
				<span>Commit</span>
				<span class="tooltip mar-left-half" data-tooltip="Commits the csv content back to the source file">
					<i class="fas fa-question-circle"></i>
				</span>
			</button>

			<button style="float: right;" class="button  is-outlined" onclick="toggleHelpModal(true)">
				<span class="icon is-small">
					<i class="fas fa-question"></i>
				</span>
				<span>Help</span>
			</button>

		</div>

		<!-- comments BEFORE csv content -->
		<div id="comments-before-option" class="options-bar">
			<div class="options-title clickable" onclick="toggleBeforeComments()">
				<span>Comments before</span>
				<span>
					<i id="comments-before-content-icon" class="fas fa-chevron-right"></i>
				</span>
			</div>
			<div id="comments-before-content">
				<textarea id="comments-before" rows="3" class="textarea"></textarea>
			</div>
		</div>

		<!-- main editor/grid area -->
		<div id="csv-editor-wrapper" class="csv-editor-wrapper">
			<div id="csv-editor"></div>
		</div>

		<!-- comments AFTER csv content -->
		<div id="comments-after-option" class="options-bar">
			<div class="options-title clickable" onclick="toggleAfterComments()"">
				<span> Comments after</span> 
				<span>
						<i id="comments-after-content-icon" class="fas fa-chevron-right"></i>
				</span>
			</div>
			<div id="comments-after-content">
				<textarea  id="comments-after" rows="3" class="textarea"></textarea>
			</div>
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
						<li>Click row/column header (not the text) to select then drag to rearrange</li>
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
							<div class="keys">Ctrl</div>+<div class="keys">Enter</div> to add a line break
						</li>

						<li>To delete a row/column hover over it and click the trash-icon</li>

						<li>Double click on a column resize handle to fit content, double click on an auto sized column to set width to
							200px</li>

					</ul>

					For a full list of shortcuts see <a target="_blank" href="https://handsontable.com/docs/6.2.2/tutorial-keyboard-navigation.html">https://handsontable.com/docs/6.2.2/tutorial-keyboard-navigation.html</a>
				</div>

				<h3 class="title is-3">Hints</h3>
				<div class="content">
					<ul>
						<li>If you close the source csv file the editor will be closed too (unsaved changes will be lost)!</li>
						<li>Sorting state is exported</li>
						<li>Copy & Past use tab (<div class="keys">⇥</div>) as separator (same as excel)</li>
						<li>Comment between csv rows get removed</li>
						<li>Comments before and after csv content is preserved (if write comment option has a value)</li>
						<li>You cannot change the new line character because vs code automatically converts it to the file setting</li>
					</ul>
				</div>


			</div>
		</div>
		<button class="modal-close is-large" aria-label="close" onclick="toggleHelpModal()"></button>
	</div>

</div>
	<script>
		var initialConfig = ${JSON.stringify(config)};
		//make sure we escape here via json e.g. if we have $\{\} in a csv file...
		var initialContent = ${JSON.stringify(initialContent)};
	</script>
	 <script src="${ioJs}"></script>
	 <script src="${uiJs}"></script>
	 <script src="${utilJs}"></script>
		<script src="${mainJs}"></script>
	</body>
	`
}