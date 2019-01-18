"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
//see https://www.ag-grid.com/javascript-grid-features/
//see https://handsontable.com/examples?manual-resize&manual-move&conditional-formatting&context-menu&filters&dropdown-menu&headers
//see https://github.com/jjuback/gc-excelviewer/blob/master/src/extension.ts
const debounceDocumentChangeInMs = 1000;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    let InstanceManager = {};
    const editCsvCommand = vscode.commands.registerCommand('edit-csv.edit', (url) => {
        if (!vscode.window.activeTextEditor) {
            vscode.window.showInformationMessage("Open a csv file first to show the csv editor.");
            return;
        }
        const uri = vscode.window.activeTextEditor.document.uri;
        const initialText = vscode.window.activeTextEditor.document.getText();
        const title = `CSV edit ${vscode.window.activeTextEditor.document.fileName}`;
        let panel = vscode.window.createWebviewPanel('csv-editor', title, getCurrentViewColumn(), {
            enableFindWidget: true,
            enableCommandUris: true,
            enableScripts: true,
            retainContextWhenHidden: true
        });
        panel.onDidDispose(() => {
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
        InstanceManager[uri.toString()] = {
            panel,
            uri
        };
    });
    const askRefresh = function (instance) {
        const options = ['Yes', 'No'];
        vscode.window.showInformationMessage('The source file changed or was saved. Would you like to overwrite your csv edits with the new content?', {
            modal: false,
        }, ...options)
            .then((picked) => {
            if (!picked)
                return;
            picked = picked.toLowerCase();
            if (picked === 'no')
                return;
            //update
            console.log('update');
            if (!vscode.window.activeTextEditor)
                return;
            const newContent = vscode.window.activeTextEditor.document.getText();
            //see https://github.com/Microsoft/vscode/issues/47534
            // const msg = {
            // 	command: 'csvUpdate',
            // 	csvContent: newContent
            // }
            // instance.panel.webview.postMessage(msg)
            instance.panel.webview.html = createHtml(context, newContent);
        });
    };
    vscode.workspace.onDidChangeTextDocument(debounce((args) => {
        if (!isCsvFile(args.document))
            return;
        const instance = InstanceManager[args.document.uri.toString()];
        if (!instance)
            return;
        const cop = args;
        askRefresh(instance);
    }, debounceDocumentChangeInMs));
    vscode.workspace.onDidSaveTextDocument(debounce((args) => {
        if (!isCsvFile(args.document))
            return;
        if (args.contentChanges.length === 0)
            return;
        const instance = InstanceManager[args.document.uri.toString()];
        if (!instance)
            return;
        askRefresh(instance);
    }, debounceDocumentChangeInMs));
    vscode.workspace.onDidChangeConfiguration((args) => {
        //not needed because this changes only initial configuration...
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
function createHtml(context, initialContent) {
    const _getResourcePath = getResourcePath.bind(undefined, context);
    let handsontableCss = _getResourcePath('node_modules/handsontable/dist/handsontable.css');
    let handsontableJs = _getResourcePath('node_modules/handsontable/dist/handsontable.js');
    let papaparseJs = _getResourcePath('node_modules/papaparse/papaparse.js');
    let fontAwesomeCss = _getResourcePath('node_modules/@fortawesome/fontawesome-free/css/all.css');
    let bulmaCss = _getResourcePath('node_modules/bulma/css/bulma.min.css');
    let bulmaExtensionCss = _getResourcePath('node_modules/bulma-extensions/dist/css/bulma-extensions.min.css');
    const mainCss = _getResourcePath('csvEditorHtml/main.css');
    const darkThemeCss = _getResourcePath('csvEditorHtml/dark.css');
    const lightThemeCss = _getResourcePath('csvEditorHtml/light.css');
    const hightContrastThemeCss = _getResourcePath('csvEditorHtml/high_contrast.css');
    //scripts
    const ioJs = _getResourcePath('csvEditorHtml/out/io.js');
    const uiJs = _getResourcePath('csvEditorHtml/out/ui.js');
    const utilJs = _getResourcePath('csvEditorHtml/out/util.js');
    const mainJs = _getResourcePath('csvEditorHtml/out/main.js');
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
				

					<button class="button is-light" onclick="readDataAgain(initialContent, csvReadOptions)">
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
				<div  class="options-title">
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

	<button class="button is-white is-outlined is-small" onclick="toggleHelpModal(true)">
		<span class="icon is-small">
				<i class="fas fa-question"></i>
			</span>
		<span>Help</span>
	</button>
</div>

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
					<li>Click row/column header (not the text) to select then drag to rearrange</li>
					<li>Resize row/column</li>
					<li><div class="keys">Home</div> to move to the first cell in a row</li>
					<li><div class="keys">End</div> to move to the last cell in a row</li>

					<li><div class="keys">Ctrl</div>+<div class="keys">Home</div> to move to the first cell in a column</li>
					<li><div class="keys">Ctrl</div>+<div class="keys">End</div> to move to the last cell in a column</li>
					<li><div class="keys">Esc</div> to cancel editing and close cell editor</li>
					<li><div class="keys">Ctrl</div>+<div class="keys">Enter</div> to add a line break</li>

					<li>To delete a row/column hover over it and click the trash-icon</li>

					<li>Double click on a column resize handle to fit content, double click on an auto sized column to set width to 200px</li>

				</ul>

				For a full list of shortcuts see <a target="_blank" href="https://handsontable.com/docs/6.2.2/tutorial-keyboard-navigation.html">https://handsontable.com/docs/6.2.2/tutorial-keyboard-navigation.html</a>
		</div>

		<h3 class="title is-3">Hints</h3>
		<div class="content">
				<ul>
						<li>Sorting state is exported</li>
					<li>Copy & Past use tab (<div class="keys">⇥</div>) as separator (same as excel)</li>
				</ul>
		</div>
			

	</div>
</div>
<button class="modal-close is-large" aria-label="close" onclick="toggleHelpModal()"></button>
</div>

</div>
	<script>
		//make sure we escape here via json...
		var initialContent = ${JSON.stringify(initialContent)};
	</script>
	 <script src="${ioJs}"></script>
	 <script src="${uiJs}"></script>
	 <script src="${utilJs}"></script>
		<script src="${mainJs}"></script>
	</body>
	`;
}
//from https://davidwalsh.name/javascript-debounce-function
function debounce(func, wait, immediate = false) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate)
                func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow)
            func.apply(context, args);
    };
}
//inspired from https://github.com/jjuback/gc-excelviewer/blob/master/src/extension.ts
function isCsvFile(document) {
    if (!document)
        return false;
    let lang = document.languageId.toLowerCase();
    let allowed = ['csv', 'csv (semicolon)', 'tsv', 'plaintext'];
    return allowed.find(p => p === lang) && document.uri.scheme !== 'csv-edit';
}
//# sourceMappingURL=extension.js.map