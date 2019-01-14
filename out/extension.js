"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const csv = require("papaparse");
const path = require("path");
//see https://www.ag-grid.com/javascript-grid-features/
//see https://handsontable.com/examples?manual-resize&manual-move&conditional-formatting&context-menu&filters&dropdown-menu&headers
//see https://github.com/jjuback/gc-excelviewer/blob/master/src/extension.ts
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    const previewCsvCommand = vscode.commands.registerCommand('edit-csv.preview', (url) => {
        if (!vscode.window.activeTextEditor) {
            vscode.window.showInformationMessage("Open a csv file first to show the csv editor.");
            return;
        }
        const initialText = vscode.window.activeTextEditor.document.getText();
        const title = 'CSV';
        const panel = vscode.window.createWebviewPanel('csv-editor', title, getCurrentViewColumn(), {
            enableFindWidget: true,
            enableCommandUris: true,
            enableScripts: true,
        });
        panel.onDidDispose(() => {
            panel.dispose();
        }, null, context.subscriptions);
        const parseResult = csv.parse(initialText, {
            comments: '#',
            header: false
        });
        panel.webview.html = createHtml(context, initialText);
    });
    context.subscriptions.push(previewCsvCommand);
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
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
function createHtml(context, content) {
    //TODo include papaparse
    // let path1= 'vscode-resource:' + path.join(context.extensionPath, 'node_modules/ag-grid-community/dist/ag-grid-community.js')
    // let css = 'vscode-resource:' + path.join(context.extensionPath, 'node_modules/ag-grid-community/dist/styles/ag-grid.css')
    // let theme = 'vscode-resource:' + path.join(context.extensionPath, 'node_modules/ag-grid-community/dist/styles/ag-theme-balham.css')
    let path1 = 'vscode-resource:' + path.join(context.extensionPath, 'node_modules/handsontable/dist/handsontable.js');
    let css = 'vscode-resource:' + path.join(context.extensionPath, 'node_modules/handsontable/dist/handsontable.css');
    //	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource:; script-src vscode-resource:; style-src vscode-resource:;">
    return `
	<!DOCTYPE html>
	<html>
	<head>
	
		<link rel="stylesheet" href="${css}">
		<script src="${path1}"></script>
	</head>
	<body>

		<button>has header row</button>

		<div id="csv" class="ag-theme-balham"></div>

		<script>

		var data = [
			["", "Ford", "Tesla", "Toyota", "Honda"],
			["2017", 10, 11, 12, 13],
			["2018", 20, 11, 14, 13],
			["2019", 30, 15, 12, 13]
		];

		var container = document.getElementById('csv');
		var hot = new Handsontable(container, {
			data: data,
			rowHeaders: true,
			colHeaders: ['t1', 't2', 't3'],
			fillHandle: false
		});

		console.log(hot.getData())
		console.log(JSON.stringify(hot.getData()))

		</script>
	</body>
	`;
}
//# sourceMappingURL=extension.js.map