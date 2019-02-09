"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const util_1 = require("./util");
const getHtml_1 = require("./getHtml");
const instanceManager_1 = require("./instanceManager");
const configurationHelper_1 = require("./configurationHelper");
const debounceDocumentChangeInMs = 1000;
/**
 * for editor uris this is the scheme to use
 * so we can find editors
 */
exports.editorUriScheme = 'csv-edit';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    let instanceManager = new instanceManager_1.InstanceManager();
    // const initCommand = vscode.window.registerWebviewPanelSerializer('csv-edit.init', new CsvEditStateSerializer())
    const commitCsvCommand = vscode.commands.registerCommand('edit-csv.commit', () => {
        const instance = getActiveEditorInstance(instanceManager);
        if (!instance)
            return;
        const msg = {
            command: "commitPress"
        };
        instance.panel.webview.postMessage(msg);
    });
    const commitAndSaveCsvCommand = vscode.commands.registerCommand('edit-csv.commitAndSave', () => {
        const instance = getActiveEditorInstance(instanceManager);
        if (!instance)
            return;
        const msg = {
            command: "commitAndSavePress"
        };
        instance.panel.webview.postMessage(msg);
    });
    //called to get from an editor to the source file
    const gotoSourceCsvCommand = vscode.commands.registerCommand('edit-csv.goto-source', () => {
        if (vscode.window.activeTextEditor) { //a web view is no text editor...
            vscode.window.showInformationMessage("Open a csv editor first to show the source csv file");
            return;
        }
        openSourceFileFunc();
    });
    const editCsvCommand = vscode.commands.registerCommand('edit-csv.edit', () => {
        if (!vscode.window.activeTextEditor && instanceManager.hasActiveEditorInstance()) {
            //open source file ... probably better for usability when we use recently used
            openSourceFileFunc();
            return;
        }
        if (!vscode.window.activeTextEditor || !util_1.isCsvFile(vscode.window.activeTextEditor.document)) {
            vscode.window.showInformationMessage("Open a csv file first to show the csv editor");
            return;
        }
        const uri = vscode.window.activeTextEditor.document.uri;
        //check if we already got an editor for this file
        const oldInstance = instanceManager.findInstanceBySourceUri(uri);
        if (oldInstance) {
            //...then show the editor
            oldInstance.panel.reveal();
            //webview panel is not a document, so this does not work
            // vscode.workspace.openTextDocument(oldInstance.editorUri)
            // .then(document => {
            // 	vscode.window.showTextDocument(document)
            // })
            return;
        }
        //we have no old editor -> create new one
        createNewEditorInstance(context, vscode.window.activeTextEditor, instanceManager);
    });
    const openSourceFileFunc = () => {
        let instance;
        try {
            instance = instanceManager.getActiveEditorInstance();
        }
        catch (error) {
            vscode.window.showErrorMessage(`Could not find the source file for the editor (no instance found), error: ${error.message}`);
            return;
        }
        vscode.workspace.openTextDocument(instance.sourceUri)
            .then(document => {
            vscode.window.showTextDocument(document);
        });
    };
    //@ts-ignore
    // const askRefresh = function (instance: Instance) {
    // 	const options = ['Yes', 'No']
    // 	vscode.window.showInformationMessage('The source file changed or was saved. Would you like to overwrite your csv edits with the new content?',
    // 		{
    // 			modal: false,
    // 		}, ...options)
    // 		.then((picked) => {
    // 			if (!picked) return
    // 			picked = picked.toLowerCase()
    // 			if (picked === 'no') return
    // 			//update
    // 			console.log('update');
    // 			if (!vscode.window.activeTextEditor) {
    // 				vscode.workspace.openTextDocument(instance.sourceUri)
    // 					.then((document) => {
    // 						const newContent = document.getText()
    // 						instance.panel.webview.html = createEditorHtml(context, newContent)
    // 					})
    // 				return
    // 			}
    // 			const newContent = vscode.window.activeTextEditor.document.getText()
    // 			//see https://github.com/Microsoft/vscode/issues/47534
    // 			// const msg = {
    // 			// 	command: 'csvUpdate',
    // 			// 	csvContent: newContent
    // 			// }
    // 			// instance.panel.webview.postMessage(msg)
    // 			instance.panel.webview.html = createEditorHtml(context, newContent)
    // 		})
    // }
    //we could use this hook to check if the file was changed (outside of the editor) and show a message to the user
    //but we would need to distinguish our own changes from external changes...
    // vscode.workspace.onDidChangeTextDocument(debounce((args: vscode.TextDocumentChangeEvent) => {
    // 	//see https://github.com/Microsoft/vscode/issues/50344
    // 	//when dirty flag changes this is called
    // 	if (args.contentChanges.length === 0) {
    // 		return
    // 	}
    // 	if (!isCsvFile(args.document)) return //closed non-csv file ... we cannot have an editor for this document
    // 	console.log(`CHANGE ${args.document.uri.toString()}`);
    // }, debounceDocumentChangeInMs));
    //when an unnamed file is saved the new file (new uri) is opened
    //	when the extension calls save the new file is not displayed
    //	because we don't know the new uri we wait for new csv files to be opened and show them
    //TODO can be improved to not show any opened csv file (e.g. from other extensions to only write to a file)
    vscode.workspace.onDidOpenTextDocument((args) => {
        //when we know the old uri then we could update the instance manager and the panel (e.g. title)...
        //but for now we close the editor iff we saved an untitled file
        //when we save an unnamed (temp file) file a new file with the new uri is opened and saved
        //TODO i don't think we can get the old/new name of the file os wait for 
        //so just filter for csv file and show it 
        if (args.isUntitled || util_1.isCsvFile(args) === false || args.version !== 1)
            return;
        vscode.window.showTextDocument(args.uri);
    });
    // vscode.workspace.onDidSaveTextDocument(debounce((args: vscode.TextDocument) => {
    // }, debounceDocumentChangeInMs))
    //when an unnamed csv file is closed and we have an editor for it then close the editor
    //	this is because we currently not updating the editor (e.g. title, uris) after an unnamed file is saved
    vscode.workspace.onDidCloseTextDocument((args) => {
        if (args.uri.scheme === exports.editorUriScheme)
            return; //closed an editor nothing to do here... onDispose will handle it
        if (util_1.isCsvFile(args) && args.isUntitled && args.uri.scheme === "untitled") {
            const instance = instanceManager.findInstanceBySourceUri(args.uri);
            if (!instance)
                return;
            instance.panel.dispose();
        }
    });
    //not needed because this changes only initial configuration...
    // vscode.workspace.onDidChangeConfiguration((args) => {
    // })
    context.subscriptions.push(editCsvCommand);
    context.subscriptions.push(gotoSourceCsvCommand);
    context.subscriptions.push(commitCsvCommand);
    context.subscriptions.push(commitAndSaveCsvCommand);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
function getEditorTitle(document) {
    return `CSV edit ${document.fileName}`;
}
function createNewEditorInstance(context, activeTextEditor, instanceManager) {
    const uri = activeTextEditor.document.uri;
    const initialText = activeTextEditor.document.getText();
    const title = getEditorTitle(activeTextEditor.document);
    let panel = vscode.window.createWebviewPanel('csv-editor', title, util_1.getCurrentViewColumn(), {
        enableFindWidget: true,
        enableCommandUris: true,
        enableScripts: true,
        retainContextWhenHidden: true
    });
    let instance = {
        panel: null,
        sourceUri: uri,
        editorUri: uri.with({
            scheme: exports.editorUriScheme
        })
    };
    try {
        instanceManager.addInstance(instance);
    }
    catch (error) {
        vscode.window.showErrorMessage(`Could not create an editor instance, error: ${error.message}`);
        return;
    }
    //just set the panel if we added the instance
    instance.panel = panel;
    const config = configurationHelper_1.getExtensionConfiguration();
    panel.webview.onDidReceiveMessage((message) => {
        switch (message.command) {
            case "error": {
                vscode.window.showErrorMessage(message.content);
                break;
            }
            case "commit": {
                const { csvContent, saveSourceFile } = message;
                commitContent(instance, csvContent, saveSourceFile, config.openSourceFileAfterCommit);
                break;
            }
            default: {
                vscode.window.showErrorMessage(`Received unknown post message from extension: ${JSON.stringify(message)}`);
                break;
            }
        }
    }, undefined, context.subscriptions);
    panel.onDidDispose(() => {
        try {
            instanceManager.removeInstance(instance);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Could not destroy an editor instance, error: ${error.message}`);
        }
    }, null, context.subscriptions);
    panel.webview.html = getHtml_1.createEditorHtml(context, initialText);
}
function commitContent(instance, newContent, saveSourceFile, openSourceFileAfterCommit) {
    vscode.workspace.openTextDocument(instance.sourceUri)
        .then(document => {
        const edit = new vscode.WorkspaceEdit();
        var firstLine = document.lineAt(0);
        var lastLine = document.lineAt(document.lineCount - 1);
        var textRange = new vscode.Range(0, firstLine.range.start.character, document.lineCount - 1, lastLine.range.end.character);
        edit.replace(document.uri, textRange, newContent);
        vscode.workspace.applyEdit(edit)
            .then(editsApplied => {
            _afterEditsApplied(document, editsApplied, saveSourceFile, openSourceFileAfterCommit);
        });
        // vscode.window.showTextDocument(document)
        // 	.then(editor => {
        // 		editor.edit((builder) => {
        // 			var firstLine = document.lineAt(0);
        // 			var lastLine = document.lineAt(document.lineCount - 1);
        // 			var textRange = new vscode.Range(0,
        // 				firstLine.range.start.character,
        // 				document.lineCount - 1,
        // 				lastLine.range.end.character);
        // 			builder.replace(textRange, newContent)
        // 		})
        // 			.then(editsApplied => {
        // 				_afterEditsApplied(document, editsApplied, saveSourceFile)
        // 			})
        // 	})
    });
}
function _afterEditsApplied(document, editsApplied, saveSourceFile, openSourceFileAfterCommit) {
    const afterShowDocument = () => {
        if (!editsApplied) {
            vscode.window.showErrorMessage(`edits could not be applied`);
            return;
        }
        if (saveSourceFile) {
            document.save()
                .then(wasSaved => {
                if (!wasSaved) {
                    vscode.window.showErrorMessage(`Could not save csv file`);
                }
            }, (reason) => {
                console.warn(reason); //will be null e.g. no permission denied when saved manually
                vscode.window.showErrorMessage(`Error saving csv file`);
            });
        }
    };
    if (openSourceFileAfterCommit) {
        vscode.window.showTextDocument(document)
            .then(() => {
            afterShowDocument();
        });
    }
    else {
        afterShowDocument();
    }
}
/**
 * returns the active (editor) instance or null
 * error messages are already handled here
 * @param instanceManager
 */
function getActiveEditorInstance(instanceManager) {
    if (vscode.window.activeTextEditor) { //a web view is no text editor...
        vscode.window.showInformationMessage("Open a csv editor first to commit changes");
        return null;
    }
    let instance;
    try {
        instance = instanceManager.getActiveEditorInstance();
    }
    catch (error) {
        vscode.window.showErrorMessage(`Could not find the editor instance, error: ${error.message}`);
        return null;
    }
    return instance;
}
// class CsvEditStateSerializer  implements vscode.WebviewPanelSerializer{
// 	static state: VsState = {
// 		previewIsCollapsed: true,
// 		readOptionIsCollapsed: true,
// 		writeOptionIsCollapsed: true
// 	}
// 	async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: VsState) {
// 		// `state` is the state persisted using `setState` inside the webview
// 		console.log(`Got state: ${state}`);
// 		CsvEditStateSerializer.state = state
// 	}
// }
//# sourceMappingURL=extension.js.map