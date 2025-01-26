"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = exports.editorUriScheme = void 0;
const vscode = require("vscode");
const path = require("path");
const util_1 = require("./util");
const getHtml_1 = require("./getHtml");
const instanceManager_1 = require("./instanceManager");
const configurationHelper_1 = require("./configurationHelper");
// const debounceDocumentChangeInMs = 1000
//for a full list of context keys see https://code.visualstudio.com/docs/getstarted/keybindings#_when-clause-contexts
/**
 * for editor uris this is the scheme to use
 * so we can find editors
 */
exports.editorUriScheme = 'csv-edit';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    //from https://stackoverflow.com/questions/38267360/vscode-extension-api-identify-file-or-folder-click-in-explorer-context-menu
    //to get a list of all known languages for: resourceLangId
    // vscode.languages.getLanguages().then(l => console.log('languages', l));
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
        openSourceFileFunc(instanceManager);
    });
    const editCsvCommand = vscode.commands.registerCommand('edit-csv.edit', () => {
        const shouldOpenEditor = beforeEditCsvCheck(instanceManager);
        if (!shouldOpenEditor)
            return;
        //this is checked in beforeEditCsvCheck
        if (!vscode.window.activeTextEditor) {
            return;
        }
        //we have no old editor -> create new one
        createNewEditorInstance(context, vscode.window.activeTextEditor, instanceManager);
    });
    //only use this programmatically to open the editor with the given config
    const editCsvWithConfigCommand = vscode.commands.registerCommand('edit-csv.editWithConfig', (overwriteConfigObj) => {
        if (!overwriteConfigObj) {
            vscode.window.showErrorMessage("No settings object provided");
            return;
        }
        const shouldOpenEditor = beforeEditCsvCheck(instanceManager);
        if (!shouldOpenEditor)
            return;
        //this is checked in beforeEditCsvCheck
        if (!vscode.window.activeTextEditor) {
            return;
        }
        //we have no old editor -> create new one
        createNewEditorInstance(context, vscode.window.activeTextEditor, instanceManager, overwriteConfigObj);
    });
    //we could use this hook to check if the file was changed (outside of the editor) and show a message to the user
    //but we would need to distinguish our own changes from external changes...
    const debounced = (0, util_1.debounce)(onWatcherChangeDetecedHandler, 1000);
    //this only works if if the file is opened in vs code
    const onDidChangeTextDocumentHandler = vscode.workspace.onDidChangeTextDocument((args) => {
        //seems that the file models here always synced
        // debugLog(`onDidChangeTextDocument ${args.document.uri.toString()}`)
        debounced(args.document.uri, instanceManager);
        // console.log(`onDidChangeTextDocument ${args.document.uri.toString()}`);
        // vscode.workspace.openTextDocument(instance.sourceUri)
        // .then(
        // 	document => {
        // 		let content = document.getText()
        // 		content += ""
        // 		console.log(`content`, content.split('\n')[0])
        // 	}, error => {
        // 		vscode.window.showErrorMessage(`could not read the source file, error: ${error?.message}`);
        // 	}
        // )
    });
    //when an unnamed file is saved the new file (new uri) is opened
    //	when the extension calls save the new file is not displayed
    //	because we don't know the new uri we wait for new csv files to be opened and show them
    //TODO can be improved to not show any opened csv file (e.g. from other extensions to only write to a file)
    const onDidOpenTextDocumentHandler = vscode.workspace.onDidOpenTextDocument((args) => {
        //when we know the old uri then we could update the instance manager and the panel (e.g. title)...
        //but for now we close the editor iff we saved an untitled file
        // console.log(`onDidOpenTextDocument ${args.uri.toString()}`);
        //when we save an unnamed (temp file) file a new file with the new uri is opened and saved
        //TODO i don't think we can get the old/new name of the file os wait for 
        //so just filter for csv file and show it 
        if (args.isUntitled || (0, util_1.isCsvFile)(args) === false || args.version !== 1)
            return;
        //this will display the new file (after unnamed was saved) but the reference is still broken...
        //also this would show almost every opened csv file (even if we don't wan to display it e.g. only for silent editing from other extensions)
        // vscode.window.showTextDocument(args.uri)
    });
    //when an unnamed csv file is closed and we have an editor for it then close the editor
    //	this is because we currently not updating the editor (e.g. title, uris) after an unnamed file is saved
    const onDidCloseTextDocumentHandler = vscode.workspace.onDidCloseTextDocument((args) => {
        if (args.uri.scheme === exports.editorUriScheme)
            return; //closed an editor nothing to do here... onDispose will handle it
        // console.log(`onDidCloseTextDocument ${args.uri.toString()}`);
        if ((0, util_1.isCsvFile)(args) && args.isUntitled && args.uri.scheme === "untitled") {
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
    const onDidChangeConfigurationHandler = vscode.workspace.onDidChangeConfiguration(onDidChangeConfigurationCallback);
    context.subscriptions.push(editCsvCommand);
    context.subscriptions.push(editCsvWithConfigCommand);
    context.subscriptions.push(gotoSourceCsvCommand);
    context.subscriptions.push(applyCsvCommand);
    context.subscriptions.push(applyAndSaveCsvCommand);
    context.subscriptions.push(onDidChangeTextDocumentHandler);
    context.subscriptions.push(onDidOpenTextDocumentHandler);
    context.subscriptions.push(onDidCloseTextDocumentHandler);
    context.subscriptions.push(onDidChangeConfigurationHandler);
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
        const newFontSize = (0, configurationHelper_1.getExtensionConfiguration)().fontSizeInPx;
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
/**
 * tries to open the source file for the current csv editor
 * @param instanceManager the instance manager
 * @returns
 */
function openSourceFileFunc(instanceManager) {
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
}
/**
 * some checks before we open the csv editor, e.g.
 * 		- check if the file is a csv file
 * 		- check if the file is already opened in an editor
 * @param instanceManager the instance manager
 * @returns true: we can open the csv editor, false: not
 */
function beforeEditCsvCheck(instanceManager) {
    if (!vscode.window.activeTextEditor && instanceManager.hasActiveEditorInstance()) {
        //open source file ... probably better for usability when we use recently used
        openSourceFileFunc(instanceManager);
        return false;
    }
    //vscode.window.activeTextEditor will be undefined if file is too large...
    //see https://github.com/microsoft/vscode/issues/32118
    //see //see https://github.com/microsoft/vscode/issues/31078
    //see https://github.com/Microsoft/vscode/blob/master/src/vs/editor/common/model/textModel.ts > MODEL_SYNC_LIMIT
    if (!vscode.window.activeTextEditor || !(0, util_1.isCsvFile)(vscode.window.activeTextEditor.document)) {
        vscode.window.showInformationMessage("Open a csv file first to show the csv editor or file too large (> 50MB)");
        return false;
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
        return false;
    }
    return true;
}
function createNewEditorInstance(context, activeTextEditor, instanceManager, overwriteSettings = null) {
    var _a, _b;
    const uri = activeTextEditor.document.uri;
    const title = getEditorTitle(activeTextEditor.document);
    let panel = vscode.window.createWebviewPanel('csv-editor', title, (0, util_1.getCurrentViewColumn)(), {
        enableFindWidget: false,
        enableCommandUris: true,
        enableScripts: true,
        retainContextWhenHidden: true
    });
    //check if the file is in the current workspace
    let isInCurrentWorkspace = activeTextEditor.document.uri.fsPath !== vscode.workspace.asRelativePath(activeTextEditor.document.uri.fsPath);
    const config = (0, configurationHelper_1.getExtensionConfiguration)();
    if (overwriteSettings !== null) {
        (0, configurationHelper_1.overwriteConfiguration)(config, overwriteSettings);
    }
    //a file watcher works when the file is in the current workspace (folder) even if it's not opened
    //it also works when we open any file (not in the workspace) and 
    //	we edit the file inside vs code
    //	we edit outside vs code but the file is visible in vs code (active)
    //it does NOT work when the file is not in the workspace and we edit the file outside of vs code and the file is not visible in vs code (active)
    // const watcher = vscode.workspace.createFileSystemWatcher(activeTextEditor.document.fileName, true, false, true)
    let instance;
    // NOTE that watching new files (untitled) is not supported by this is probably no issue...
    let watcher = null;
    if (isInCurrentWorkspace) {
        if (config.shouldWatchCsvSourceFile !== 'no') {
            //if the file is in the current workspace we the file model in vs code is always synced so is this (faster reads/cached)
            watcher = vscode.workspace.createFileSystemWatcher(activeTextEditor.document.fileName, true, false, true);
        }
        instance = {
            kind: 'workspaceFile',
            panel: null,
            sourceUri: uri,
            editorUri: uri.with({
                scheme: exports.editorUriScheme
            }),
            hasChanges: false,
            originalTitle: title,
            sourceFileWatcher: watcher,
            document: activeTextEditor.document,
            ignoreChangeEvents: false,
            unsubscribeWatcher: null,
            lastCommittedContent: ''
        };
    }
    else {
        if (config.shouldWatchCsvSourceFile !== 'no') {
            //the problem with this is that it is faster than the file model (in vs code) can sync the file...
            watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(activeTextEditor.document.fileName, "*"), true, false, true);
        }
        instance = {
            kind: 'externalFile',
            panel: null,
            sourceUri: uri,
            editorUri: uri.with({
                scheme: exports.editorUriScheme
            }),
            hasChanges: false,
            originalTitle: title,
            sourceFileWatcher: watcher,
            document: activeTextEditor.document,
            ignoreChangeEvents: false,
            unsubscribeWatcher: null,
            lastCommittedContent: ''
        };
    }
    if (config.shouldWatchCsvSourceFile !== 'no' && instance.sourceFileWatcher) {
        //turns our we need the watcher because onDidChangeTextDocument does not fire when the file is closed in vs code?
        //check with: open csv source file -> open table -> close source file -> edit source file outside vs code -> `onDidChangeTextDocument` fired?
        //subsequent changes will fire `onDidChangeTextDocument` again, because in the handler here we call `openTextDocument` which probably attaches the internal watcher again
        const debounced = (0, util_1.debounce)(onWatcherChangeDetecedHandler, 1000);
        let unsubscribe = instance.sourceFileWatcher.onDidChange((e) => {
            (0, util_1.debugLog)(`debounce sourceFileWatcher ${e.fsPath}`);
            debounced(e, instanceManager);
        });
        instance.unsubscribeWatcher = unsubscribe;
    }
    try {
        instanceManager.addInstance(instance);
    }
    catch (error) {
        vscode.window.showErrorMessage(`Could not create an editor instance, error: ${error.message}`);
        (_a = instance.unsubscribeWatcher) === null || _a === void 0 ? void 0 : _a.dispose();
        (_b = instance.sourceFileWatcher) === null || _b === void 0 ? void 0 : _b.dispose();
        return;
    }
    //just set the panel if we added the instance
    instance.panel = panel;
    panel.webview.onDidReceiveMessage((message) => {
        switch (message.command) {
            case 'ready': {
                (0, util_1.debugLog)('received ready from webview');
                instance.hasChanges = false;
                setEditorHasChanges(instance, false);
                let funcSendContent = (initialText) => {
                    const textSlices = (0, util_1.partitionString)(initialText, 1024 * 1024); //<1MB less should be loaded in a blink
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
                };
                if (isInCurrentWorkspace === false) {
                    //slow path
                    //external files are normally not synced so better read the file...
                    // vscode.workspace.fs.readFile(instance.sourceUri)
                    // 	.then(content => {
                    // 		console.log(`encoding`)
                    // 		//TODO get encoding????
                    // 		//see https://github.com/microsoft/vscode/issues/824
                    // const text = Buffer.from(content).toString('utf-8')
                    // 		funcSendContent(text)
                    // 	}, error => {
                    // 		vscode.window.showErrorMessage(`could not read the source file, error: ${error?.message}`);
                    // 	})
                    //TODO
                    //THIS might not get the up-to-date state of the file on the disk
                    //but vs code api cannot get the file encoding (so that we could use vscode.workspace.fs.readFile)
                    //or allow us to force to updat the memory model in vs code of the file...
                    //see https://github.com/microsoft/vscode/issues/824
                    //see https://github.com/microsoft/vscode/issues/3025
                    //in case we closed the file (we have an old view/model of the file) open it again
                    vscode.workspace.openTextDocument(instance.sourceUri)
                        .then(document => {
                        const content = document.getText();
                        instance.lastCommittedContent = content;
                        // debugLog(`content send`, content.split('\n')[0])
                        funcSendContent(content);
                    }, error => {
                        vscode.window.showErrorMessage(`could not read the source file, error: ${error === null || error === void 0 ? void 0 : error.message}`);
                    });
                }
                else if (activeTextEditor.document.isClosed) {
                    //slow path
                    //not synchronized anymore...
                    //we need to get the real file content from disk
                    vscode.workspace.openTextDocument(instance.sourceUri)
                        .then(document => {
                        const content = document.getText();
                        instance.lastCommittedContent = content;
                        // debugLog(`content send`, content.split('\n')[0])
                        funcSendContent(content);
                    }, error => {
                        vscode.window.showErrorMessage(`could not read the source file, error: ${error === null || error === void 0 ? void 0 : error.message}`);
                    });
                }
                else {
                    //fast path
                    //file is still open and synchronized
                    //sometimes the model is not updated fast enough after a change detection, thus we get old content
                    //however, if the user manually triggers the reload, then the model is already synced
                    const content = activeTextEditor.document.getText();
                    // debugLog(`content send`, content.split('\n')[0])
                    instance.lastCommittedContent = content;
                    funcSendContent(content);
                }
                (0, util_1.debugLog)('finished sending csv content to webview');
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
            case "setMultipleCursors": {
                const { positions } = message;
                setMultipleCursorsInSourceFile(instance, positions);
                break;
            }
            //this only works for vs extension and also asks the user for permission...
            // case 'openUrl': {
            // 	//from https://github.com/microsoft/vscode/issues/9651
            // 	vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(message.url))
            // 	break
            // }
            default: notExhaustive(message, `Received unknown post message from extension: ${JSON.stringify(message)}`);
        }
    }, undefined, context.subscriptions);
    panel.onDidDispose(() => {
        var _a, _b;
        (0, util_1.debugLog)(`dispose csv editor panel (webview)`);
        try {
            instanceManager.removeInstance(instance);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Could not destroy an editor instance, error: ${error.message}`);
        }
        try {
            (_a = instance.unsubscribeWatcher) === null || _a === void 0 ? void 0 : _a.dispose();
            (_b = instance.sourceFileWatcher) === null || _b === void 0 ? void 0 : _b.dispose();
        }
        catch (error) {
            vscode.window.showErrorMessage(`Could not dispose source file watcher for file ${instance.document.uri.fsPath}, error: ${error.message}`);
        }
    }, null, context.subscriptions);
    //because for col it is the cursor pos, it can be larger than the line length! (well, equall numbers)
    let activeCol = activeTextEditor.selection.active.character;
    if (activeTextEditor.document.lineAt(activeTextEditor.selection.active.line).text.length === activeCol) {
        activeCol = activeTextEditor.document.lineAt(activeTextEditor.selection.active.line).text.length - 1;
    }
    let platform;
    switch (process.platform) {
        case 'aix':
        case 'freebsd':
        case 'linux':
        case 'openbsd':
        case 'android':
        case 'cygwin':
        case 'sunos':
            platform = 'linux';
            break;
        case 'win32':
            platform = 'win';
            break;
        case 'darwin':
            platform = 'mac';
            break;
        default:
            platform = 'linux';
    }
    panel.webview.html = (0, getHtml_1.createEditorHtml)(panel.webview, context, config, {
        isWatchingSourceFile: instance.sourceFileWatcher ? true : false,
        sourceFileCursorLineIndex: activeTextEditor.selection.active.line,
        sourceFileCursorColumnIndex: activeCol,
        isCursorPosAfterLastColumn: activeTextEditor.document.lineAt(activeTextEditor.selection.active.line).text.length === activeTextEditor.selection.active.character,
        openTableAndSelectCellAtCursorPos: config.openTableAndSelectCellAtCursorPos,
        os: platform
    });
}
/**
 * tries to apply (replace the whole file content) with the new content
 */
function applyContent(instance, newContent, saveSourceFile, openSourceFileAfterApply) {
    vscode.workspace.openTextDocument(instance.sourceUri)
        .then(document => {
        const edit = new vscode.WorkspaceEdit();
        var firstLine = document.lineAt(0);
        var lastLine = document.lineAt(document.lineCount - 1);
        var textRange = new vscode.Range(0, firstLine.range.start.character, document.lineCount - 1, lastLine.range.end.character);
        //don't apply if the content didn't change
        if (document.getText() === newContent) {
            (0, util_1.debugLog)(`content didn't change`);
            return;
        }
        edit.replace(document.uri, textRange, newContent);
        vscode.workspace.applyEdit(edit)
            .then(editsApplied => {
            instance.lastCommittedContent = newContent;
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
        //maybe the source file was deleted...
        //see https://github.com/microsoft/vscode-extension-samples/pull/195/files
        console.warn(`Could not find the source file, trying to access it and create a temp file with the same path...`);
        console.warn(reason);
        vscode.workspace.fs.stat(instance.sourceUri).
            then(fileStat => {
            //file exists and can be accessed
            vscode.window.showErrorMessage(`Could apply changed because the source file could not be found`);
        }, error => {
            //file is probably deleted
            // vscode.window.showWarningMessageMessage(`The source file could not be found and was probably deleted.`)
            createNewSourceFile(instance, newContent, openSourceFileAfterApply, saveSourceFile);
        });
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
            //this would trigger the watcher change detection and show reload dialog...
            //prevent this by removing the handler
            //setting a flag won't work because we sometimes get multiple change events and we don't know which is the last one
            // instance.ignoreChangeEvents = true
            document.save()
                .then(wasSaved => {
                //really dirty but there seems to be no better way
                //
                // setTimeout(() => {
                // 	instance.ignoreChangeEvents = false
                // }, 500)
                if (!wasSaved) {
                    console.warn(`Could not save csv file`);
                    vscode.window.showErrorMessage(`Could not save csv file`);
                    return;
                }
                setEditorHasChanges(instance, false);
            }, (reason) => {
                // setTimeout(() => {
                // 	instance.ignoreChangeEvents = false
                // }, 500)
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
 * tries to create a new tmp file (untitled:URI.fsPath) so that the user can decide to save or discard it
 * @param instance
 * @param newContent
 * @param openSourceFileAfterApply
 */
function createNewSourceFile(instance, newContent, openSourceFileAfterApply, saveSourceFile) {
    //TODO i'm not sure if this also works for remote file systems...
    //see https://stackoverflow.com/questions/41068197/vscode-create-unsaved-file-and-add-content
    const newSourceFile = vscode.Uri.parse(`untitled:${instance.sourceUri.fsPath}`);
    vscode.workspace.openTextDocument(newSourceFile)
        .then(newFile => {
        const edit = new vscode.WorkspaceEdit();
        edit.insert(newSourceFile, new vscode.Position(0, 0), newContent);
        vscode.workspace.applyEdit(edit).then(success => {
            if (!success) {
                (0, util_1.debugLog)('could not created new source file because old was deleted');
                return;
            }
            (0, util_1.debugLog)('created new source file because old was deleted');
            if (openSourceFileAfterApply) {
                vscode.window.showTextDocument(newFile);
            }
            if (saveSourceFile) {
                newFile.save().then(successSave => {
                    if (!successSave) {
                        vscode.window.showErrorMessage(`Could not save new source file (old was deleted)`);
                        return;
                    }
                    //successfully saved
                }, error => {
                    vscode.window.showErrorMessage(`Could not save new source file (old was deleted), error: ${error === null || error === void 0 ? void 0 : error.message}`);
                });
            }
        }, error => {
            vscode.window.showErrorMessage(`Could not create new source file (old was deleted), error: ${error === null || error === void 0 ? void 0 : error.message}`);
        });
    }, error => {
        vscode.window.showErrorMessage(`Could not open new source file, error: ${error === null || error === void 0 ? void 0 : error.message}`);
    });
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
function onWatcherChangeDetecedHandler(e, instanceManager) {
    const instance = instanceManager.findInstanceBySourceUri(e);
    if (!instance)
        return;
    //maybe the user configured to not watch the file
    if (instance.ignoreChangeEvents || instance.sourceFileWatcher === null) {
        (0, util_1.debugLog)(`source file changed: ${e.fsPath}, ignored`);
        return;
    }
    //instance.document.getText() is not enough if the file not opened in vs code
    // const newContent = instance.document.getText()
    // console.log(`newContent:`,newContent.split('\n')[0])
    vscode.workspace.openTextDocument(instance.sourceUri)
        .then(document => {
        let content = document.getText();
        (0, util_1.debugLog)(`content ${content.split('\n')[0]}`);
        if (content === instance.lastCommittedContent) {
            (0, util_1.debugLog)(`content didn't change, fake change`);
            return;
        }
        (0, util_1.debugLog)(`source file changed: ${e.fsPath}`);
        onSourceFileChanged(e.fsPath, instance);
    }, error => {
        vscode.window.showErrorMessage(`could not read the source file, error: ${error === null || error === void 0 ? void 0 : error.message}`);
    });
}
function onSourceFileChanged(path, instance) {
    //alway show change dialog
    // if (!instance.supportsAutoReload) {
    // 	vscode.window.showWarningMessage(`The csv source file '${instance.document.fileName}' has been changed and is not in the current workspace. As a result, the content could not be reloaded automatically. Please open/show the csv source file in vs code and switch back to the table. Then you have to reload the table manually with the reload button. Alternatively, close the table and open it again.`, {
    // 		modal: false,
    // 	})
    // 	return
    // }
    // vscode.window.showWarningMessage(`The csv source file '${instance.document.fileName}' was changed and could not be reloaded automatically. Please open/show the csv source file in vs code and switch back to the table. Then you have to reload the table manually with the reload button. Alternatively, close the table and open it again.`, {
    // 	modal: false,
    // })
    // return
    const msg = {
        command: 'sourceFileChanged'
    };
    instance.panel.webview.postMessage(msg);
}
function setMultipleCursorsInSourceFile(instance, positions) {
    console.log('positions', positions);
    vscode.workspace.openTextDocument(instance.sourceUri)
        .then(document => {
        vscode.window.showTextDocument(document)
            .then(editor => {
            // Create an array of VSCode selections from the cursor positions
            const selections = positions.map(pos => {
                return new vscode.Selection(pos.startLine, pos.startColumn, pos.endLine, pos.endColumn);
            });
            // Set the selections in the editor
            editor.selections = selections;
            //focus the editor
            console.log(vscode.window.activeTextEditor);
            setTimeout(() => {
                console.log(vscode.window.activeTextEditor);
            }, 1000);
        });
    });
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