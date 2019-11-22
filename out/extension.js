"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const util_1 = require("./util");
const getHtml_1 = require("./getHtml");
const instanceManager_1 = require("./instanceManager");
const configurationHelper_1 = require("./configurationHelper");
// const debounceDocumentChangeInMs = 1000
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
    const applyCsvCommand = vscode.commands.registerCommand('edit-csv.apply', () => {
        const instance = getActiveEditorInstance(instanceManager);
        if (!instance)
            return;
        const msg = {
            command: "applyPress"
        };
        instance.panel.webview.postMessage(msg);
    });
    const applyAndSaveCsvCommand = vscode.commands.registerCommand('edit-csv.applyAndSave', () => {
        const instance = getActiveEditorInstance(instanceManager);
        if (!instance)
            return;
        const msg = {
            command: "applyAndSavePress"
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
        //vscode.window.activeTextEditor will be undefined if file is too large...
        //see https://github.com/Microsoft/vscode/blob/master/src/vs/editor/common/model/textModel.ts
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
        // console.log(`onDidOpenTextDocument ${args.uri.toString()}`);
        //when we save an unnamed (temp file) file a new file with the new uri is opened and saved
        //TODO i don't think we can get the old/new name of the file os wait for 
        //so just filter for csv file and show it 
        if (args.isUntitled || util_1.isCsvFile(args) === false || args.version !== 1)
            return;
        //this will display the new file (after unnamed was saved) but the reference is still broken...
        //also this would show almost every opened csv file (even if we don't wan to display it e.g. only for silent editing from other extensions)
        // vscode.window.showTextDocument(args.uri)
    });
    // vscode.workspace.onDidSaveTextDocument(debounce((args: vscode.TextDocument) => {
    // }, debounceDocumentChangeInMs))
    vscode.workspace.onDidSaveTextDocument((args) => {
        // console.log(`onDidSaveTextDocument ${args.uri.toString()}`);
    });
    //when an unnamed csv file is closed and we have an editor for it then close the editor
    //	this is because we currently not updating the editor (e.g. title, uris) after an unnamed file is saved
    vscode.workspace.onDidCloseTextDocument((args) => {
        if (args.uri.scheme === exports.editorUriScheme)
            return; //closed an editor nothing to do here... onDispose will handle it
        // console.log(`onDidCloseTextDocument ${args.uri.toString()}`);
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
    const onDidChangeConfigurationCallback = onDidChangeConfiguration.bind(undefined, instanceManager);
    vscode.workspace.onDidChangeConfiguration(onDidChangeConfigurationCallback);
    context.subscriptions.push(editCsvCommand);
    context.subscriptions.push(gotoSourceCsvCommand);
    context.subscriptions.push(applyCsvCommand);
    context.subscriptions.push(applyAndSaveCsvCommand);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
/**
 * called when the (extension?) config changes
 * can be called manually to force update all instances
 * @param e null to manually update all instances
 */
function onDidChangeConfiguration(instanceManager, e) {
    if (e === null || e.affectsConfiguration('csv-edit.fontSizeInPx')) {
        const newFontSize = configurationHelper_1.getExtensionConfiguration().fontSizeInPx;
        const instances = instanceManager.getAllInstances();
        for (let i = 0; i < instances.length; i++) {
            const instance = instances[i];
            instance.panel.webview.postMessage({
                command: 'changeFontSizeInPx',
                fontSizeInPx: newFontSize
            });
        }
    }
}
function getEditorTitle(document) {
    return `CSV edit ${path.basename(document.fileName)}`;
}
function createNewEditorInstance(context, activeTextEditor, instanceManager) {
    const uri = activeTextEditor.document.uri;
    const initialText = activeTextEditor.document.getText();
    const title = getEditorTitle(activeTextEditor.document);
    let panel = vscode.window.createWebviewPanel('csv-editor', title, util_1.getCurrentViewColumn(), {
        enableFindWidget: false,
        enableCommandUris: true,
        enableScripts: true,
        retainContextWhenHidden: true
    });
    let instance = {
        panel: null,
        sourceUri: uri,
        editorUri: uri.with({
            scheme: exports.editorUriScheme
        }),
        hasChanges: false,
        originalTitle: title,
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
            case 'ready': {
                util_1.debugLog('received ready from webview');
                const textSlices = util_1.partitionString(initialText, 1024 * 1024); //<1MB less should be loaded in a blink
                for (let i = 0; i < textSlices.length; i++) {
                    const textSlice = textSlices[i];
                    const msg = {
                        command: "csvUpdate",
                        csvContent: {
                            text: textSlice.text,
                            sliceNr: textSlice.sliceNr,
                            totalSlices: textSlice.totalSlices
                        }
                    };
                    panel.webview.postMessage(msg);
                }
                // const msg: ReceivedMessageFromVsCode = {
                // 	command:"csvUpdate",
                // 	csvContent: initialText
                // }
                //panel.webview.postMessage(msg)
                util_1.debugLog('finished sending csv content to webview');
                break;
            }
            case "msgBox": {
                if (message.type === 'info') {
                    vscode.window.showInformationMessage(message.content);
                }
                else if (message.type === 'warn') {
                    vscode.window.showWarningMessage(message.content);
                }
                else if (message.type === 'error') {
                    vscode.window.showErrorMessage(message.content);
                }
                else {
                    const _msg = `unknown show message box type: ${message.type}, message: ${message.content}`;
                    console.error(_msg);
                    vscode.window.showErrorMessage(_msg);
                }
                break;
            }
            case "apply": {
                const { csvContent, saveSourceFile } = message;
                applyContent(instance, csvContent, saveSourceFile, config.openSourceFileAfterApply);
                break;
            }
            case "copyToClipboard": {
                vscode.env.clipboard.writeText(message.text);
                break;
            }
            case "setHasChanges": {
                instance.hasChanges = message.hasChanges;
                setEditorHasChanges(instance, message.hasChanges);
                break;
            }
            default: notExhaustive(message, `Received unknown post message from extension: ${JSON.stringify(message)}`);
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
function applyContent(instance, newContent, saveSourceFile, openSourceFileAfterApply) {
    vscode.workspace.openTextDocument(instance.sourceUri)
        .then(document => {
        const edit = new vscode.WorkspaceEdit();
        var firstLine = document.lineAt(0);
        var lastLine = document.lineAt(document.lineCount - 1);
        var textRange = new vscode.Range(0, firstLine.range.start.character, document.lineCount - 1, lastLine.range.end.character);
        //don't apply if the content didn't change
        if (document.getText() === newContent) {
            return;
        }
        edit.replace(document.uri, textRange, newContent);
        vscode.workspace.applyEdit(edit)
            .then(editsApplied => {
            _afterEditsApplied(instance, document, editsApplied, saveSourceFile, openSourceFileAfterApply);
        }, (reason) => {
            console.warn(`Error applying edits`);
            console.warn(reason);
            vscode.window.showErrorMessage(`Error applying edits`);
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
    }, (reason) => {
        console.warn(`Could not find the source file`);
        console.warn(reason);
        vscode.window.showErrorMessage(`Could not find the source file`);
    });
}
function _afterEditsApplied(instance, document, editsApplied, saveSourceFile, openSourceFileAfterApply) {
    const afterShowDocument = () => {
        if (!editsApplied) {
            console.warn(`Edits could not be applied`);
            vscode.window.showErrorMessage(`Edits could not be applied`);
            return;
        }
        if (saveSourceFile) {
            document.save()
                .then(wasSaved => {
                if (!wasSaved) {
                    console.warn(`Could not save csv file`);
                    vscode.window.showErrorMessage(`Could not save csv file`);
                    return;
                }
                setEditorHasChanges(instance, false);
            }, (reason) => {
                console.warn(`Error saving csv file`);
                console.warn(reason); //will be null e.g. no permission denied when saved manually
                vscode.window.showErrorMessage(`Error saving csv file`);
            });
            return;
        }
        setEditorHasChanges(instance, false);
    };
    //also works for unnamed files... they will not be displayed after save
    if (openSourceFileAfterApply) {
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
        vscode.window.showInformationMessage("Open a csv editor first to apply changes");
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
function notExhaustive(x, message) {
    vscode.window.showErrorMessage(message);
    throw new Error(message);
}
function setEditorHasChanges(instance, hasChanges) {
    instance.panel.title = `${hasChanges ? '* ' : ''}${instance.originalTitle}`;
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