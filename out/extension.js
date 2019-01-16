"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
//see https://www.ag-grid.com/javascript-grid-features/
//see https://handsontable.com/examples?manual-resize&manual-move&conditional-formatting&context-menu&filters&dropdown-menu&headers
//see https://github.com/jjuback/gc-excelviewer/blob/master/src/extension.ts
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    const editCsvCommand = vscode.commands.registerCommand('edit-csv.edit', (url) => {
        if (!vscode.window.activeTextEditor) {
            vscode.window.showInformationMessage("Open a csv file first to show the csv editor.");
            return;
        }
        const initialText = vscode.window.activeTextEditor.document.getText();
        const title = `CSV edit ${vscode.window.activeTextEditor.document.fileName}`;
        const panel = vscode.window.createWebviewPanel('csv-editor', title, getCurrentViewColumn(), {
            enableFindWidget: true,
            enableCommandUris: true,
            enableScripts: true,
        });
        panel.onDidDispose(() => {
            panel.dispose();
        }, null, context.subscriptions);
        panel.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case "error": {
                    vscode.window.showErrorMessage(message.content);
                    break;
                }
                case "overwrite": {
                    break;
                }
                default: {
                    vscode.window.showErrorMessage(`Received unknown post message from extension: ${JSON.stringify(message)}`);
                    break;
                }
            }
        }, undefined, context.subscriptions);
        panel.webview.html = createHtml(context, initialText);
    });
    context.subscriptions.push(editCsvCommand);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
function getCurrentViewColumn() {
    return vscode.window.activeTextEditor && vscode.window.activeTextEditor.viewColumn
        ? vscode.window.activeTextEditor.viewColumn
        : vscode.ViewColumn.One;
}
/**
 * returns a local file path relative to the extension root dir
 * @param filePath
 */
function getResourcePath(context, filePath) {
    return `vscode-resource:${path.join(context.extensionPath, filePath)}`;
}
function createHtml(context, content) {
    const _getResourcePath = getResourcePath.bind(undefined, context);
    let handsontableCss = _getResourcePath('node_modules/handsontable/dist/handsontable.css');
    let handsontableJs = _getResourcePath('node_modules/handsontable/dist/handsontable.js');
    let papaparseJs = _getResourcePath('node_modules/papaparse/papaparse.js');
    let fontAwesomeCss = _getResourcePath('node_modules/@fortawesome/fontawesome-free/css/all.css');
    let bulmaCss = _getResourcePath('node_modules/bulma/css/bulma.min.css');
    let bulmaExtensionCss = _getResourcePath('node_modules/bulma-extensions/dist/css/bulma-extensions.min.css');
    const mainCss = _getResourcePath('csvEditorHtml/main.css');
    const darkThemeCss = _getResourcePath('csvEditorHtml/dark.css');
    //scripts
    const ioJs = _getResourcePath('csvEditorHtml/io.js');
    const uiJs = _getResourcePath('csvEditorHtml/ui.js');
    const utilJs = _getResourcePath('csvEditorHtml/util.js');
    const mainJs = _getResourcePath('csvEditorHtml/main.js');
    //	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource:; script-src vscode-resource:; style-src vscode-resource:;">
    return `
	<!DOCTYPE html>
	<html>
	<head>
		<link rel="stylesheet" href="${handsontableCss}">
		<script src="${handsontableJs}"></script>
		<script src="${papaparseJs}"></script>
	
		<link rel="stylesheet" href="${fontAwesomeCss}">
	
		<link rel="stylesheet" href="${bulmaCss}">
		<link rel="stylesheet" href="${bulmaExtensionCss}">
		<link rel="stylesheet" href="${mainCss}">
		<link rel="stylesheet" href="${darkThemeCss}">
	</head>
	<body>
	
	
		<div class="page full-h">
	
		<div class="all-options">
	
				<div class="options-bar">
					<div>
							<div  class="options-title clickable" onclick="toggleReadOptions()">Read options <i id="read-options-icon" class="fas fa-chevron-right"></i></div>
					</div>
	
					<div id="read-options-content" class="options-content">
						<div>
	
								<div class="field">
										<input id="has-header" type="checkbox" name="has-header" class="switch is-rounded" checked="checked" onchange="setHasHeader()">
										<label for="has-header">
											<span>Has header</span>
											<span class="tooltip is-tooltip-right is-tooltip-multiline" data-tooltip="The first row is used as header. Note that changing this option will also change the write header option.">
													<i class="fas fa-question-circle"></i>
											</span>
										</label>
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
											<span class="clickable tooltip" data-tooltip="Set to tab character"  onclick="setReadDelimiter('\t')">⇥</span>
											<span class="tooltip" data-tooltip="Empty to auto detect">
													<i class="fas fa-question-circle"></i>
											</span>
										</label> 
										<input id="delimiter-string" class="input" type="text" placeholder="auto" oninput="setDelimiterString()">
									</div>
							
									<div class="field mar-left">
											<label>
												<span>Comment</span>
												<span class="tooltip is-tooltip-multiline" data-tooltip="Comments before and after csv data are preserved. Comments between data rows are ignored.">
														<i class="fas fa-question-circle"></i>
												</span>
											</label>
											<input id="comment-string" class="input" type="text" placeholder="Empty for no comments" oninput="setCommentString()">
									</div>
							</div>
						
	
							<button class="button is-light" onclick="readDataAgain(t1, csvReadOptions)">
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
							<div  class="options-title clickable" onclick="toggleWriteOptions()">Write options <i id="write-options-icon" class="fas fa-chevron-right"></i></div>
					</div>
	
					<div id="write-options-content" class="options-content">
							<div class="field">
								<input id="has-header-write" type="checkbox" name="has-header-write" class="switch is-rounded" checked="checked" onchange="setHasHeaderWrite()">
								<label for="has-header-write">
									<span>Write header</span>
									<span class="tooltip is-tooltip-bottom" data-tooltip="Checked: writes the header row, unchecked: not">
											<i class="fas fa-question-circle"></i>
									</span>
								</label>
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
																<span class="tooltip is-tooltip-multiline" data-tooltip="Empty for no comments. Comments before and after csv data are written if char is present">
																		<i class="fas fa-question-circle"></i>
																</span>
															</label>
												</label>
												<input id="comment-string-write" class="input" type="text" placeholder="Empty for no comments" oninput="setCommentStringWrite()">
										</div>
							</div>
					
							<div class="field">
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
	
			<div class="options-bar" style="flex: 1%;">
				<div>
						<div  class="options-title clickable" onclick="togglePreview()">Preview <i id="preview-icon" class="fas fa-chevron-right"></i></div>
				</div>
	
				<div id="preview-content" class="options-content">
					<button class="button is-light mar-bot" onclick="updateCsvPreview()">Generate</button>
					<textarea id="csv-preview" style="resize: horizontal;min-width: 200px;max-height: 120px;" class="textarea"></textarea>
				</div>
	
			</div>
	
		</div>
	
	
	
		<div class="csv-editor-wrapper">
	
				<button class="button is-white is-outlined is-small" onclick="addRow()">
						<span class="icon is-small">
								<i class="fas fa-plus"></i>
							</span>
						<span>Add row</span>
					</button>
	
					<button class="button is-white is-outlined is-small" onclick="addColumn()">
							<span class="icon is-small">
									<i class="fas fa-plus"></i>
								</span>
							<span>Add column</span>
						</button>
	
			<div id="csv-editor"></div>
			
		</div>
		
	</div>
	
	 <script src="${ioJs}"></script>
	 <script src="${uiJs}"></script>
	 <script src="${utilJs}"></script>
		<script src="${mainJs}"></script>
	</body>
	`;
}
//# sourceMappingURL=extension.js.map