import * as vscode from 'vscode';
import { debounce, isCsvFile, getCurrentViewColumn } from './util';
import { createEditorHtml } from './getHtml';
import { InstanceManager, Instance } from './instanceManager';


const debounceDocumentChangeInMs = 1000

/**
 * for editor uris this is the scheme to use
 * so we can find editors
 */
const editorUriScheme = 'csv-edit'



// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated

	let instanceManager = new InstanceManager()

	//called to get from an editor to the source file
	const gotoSourceCsvCommand = vscode.commands.registerCommand('edit-csv.goto-source', (url) => {


		if (vscode.window.activeTextEditor) { //a web view is no text editor...
			vscode.window.showInformationMessage("Open a csv editor first to show the source csv file")
			return
		}
		let instance: Instance 
		try {
			instance = instanceManager.getActiveEditor()
		} catch (error) {
			vscode.window.showErrorMessage(`Could not find the source file for the editor (no instance found), error: ${error.message}`)
			return
		}
		vscode.workspace.openTextDocument(instance.sourceUri)
			.then(document => {
				
				vscode.window.showTextDocument(document)
			})

	})

	const editCsvCommand = vscode.commands.registerCommand('edit-csv.edit', (url) => {

		if (!vscode.window.activeTextEditor || isCsvFile(vscode.window.activeTextEditor.document) === false) {
			vscode.window.showInformationMessage("Open a csv file first to show the csv editor")
			return
		}

		const uri = vscode.window.activeTextEditor.document.uri

		//check if we already got an editor for this file
		const oldInstance = instanceManager.findInstanceBySourceUri(uri)
		if (oldInstance) {
			//...then show the editor
			oldInstance.panel.reveal()

			//webview panel is not a document, so this does not work
			// vscode.workspace.openTextDocument(oldInstance.editorUri)
			// .then(document => {
			// 	vscode.window.showTextDocument(document)
			// })
			return
		}

		//we have no old editor -> create new one
		createNewEditorInstance(context, vscode.window.activeTextEditor, instanceManager)
	})

	const askRefresh = function (instance: Instance) {
		const options = ['Yes', 'No']
		vscode.window.showInformationMessage('The source file changed or was saved. Would you like to overwrite your csv edits with the new content?',
			{
				modal: false,

			}, ...options)
			.then((picked) => {

				if (!picked) return

				picked = picked.toLowerCase()
				if (picked === 'no') return

				//update
				console.log('update');

				if (!vscode.window.activeTextEditor) {

					vscode.workspace.openTextDocument(instance.sourceUri)
						.then((document) => {

							const newContent = document.getText()
							instance.panel.webview.html = createEditorHtml(context, newContent)

						})

					return
				}

				const newContent = vscode.window.activeTextEditor.document.getText()

				//see https://github.com/Microsoft/vscode/issues/47534
				// const msg = {
				// 	command: 'csvUpdate',
				// 	csvContent: newContent
				// }
				// instance.panel.webview.postMessage(msg)

				instance.panel.webview.html = createEditorHtml(context, newContent)
			})
	}

	vscode.workspace.onDidChangeTextDocument(debounce((args: vscode.TextDocumentChangeEvent) => {

		//see https://github.com/Microsoft/vscode/issues/50344
		//when dirty flag changes this is called
		if (args.contentChanges.length === 0) {
			return
		}

		if (!isCsvFile(args.document)) return //closed non-csv file ... we cannot have an editor for this document

		// const instance = InstanceManager[args.document.uri.toString()]
		// if (!instance) return

		// const cop = args


		// console.log('change: ' + args.contentChanges[0].text);

		// askRefresh(instance)

	}, debounceDocumentChangeInMs));

	vscode.workspace.onDidSaveTextDocument(debounce((args: vscode.TextDocument) => {

		if (!isCsvFile(args)) return //closed non-csv file ... we cannot have an editor for this document

		// const instance = InstanceManager[args.document.uri.toString()]
		// if (!instance) return

		// console.log('save');
		// askRefresh(instance)

	}, debounceDocumentChangeInMs))

	vscode.workspace.onDidCloseTextDocument((args) => {

		if (args.uri.scheme === editorUriScheme) return //closed an editor nothing to do here... onDispose will handle it

		//when we close a source file ... also close the editor
		const instance = instanceManager.findInstanceBySourceUri(args.uri)
		if (!instance) return

		instance.panel.dispose()
	})

	vscode.workspace.onDidChangeConfiguration((args) => {
		//not needed because this changes only initial configuration...
	})



	context.subscriptions.push(editCsvCommand)
	context.subscriptions.push(gotoSourceCsvCommand)
}

// this method is called when your extension is deactivated
export function deactivate() { }


function createNewEditorInstance(context: vscode.ExtensionContext, activeTextEditor: vscode.TextEditor, instanceManager: InstanceManager): void {

	const uri = activeTextEditor.document.uri

	const initialText = activeTextEditor.document.getText()

	const title = `CSV edit ${activeTextEditor.document.fileName}`
	
	let panel = vscode.window.createWebviewPanel('csv-editor', title, getCurrentViewColumn(), {
		enableFindWidget: true,
		enableCommandUris: true,
		enableScripts: true,
		retainContextWhenHidden: true
	})

	let instance: Instance = {
		panel: null as any,
		sourceUri: uri,
		editorUri: uri.with({
			scheme: editorUriScheme
		})
	}

	try {
		instanceManager.addInstance(instance)
	} catch (error) {
		vscode.window.showErrorMessage(`Could not create an editor instance, error: ${error.message}`);
		return
	}

	//just set the panel if we added the instance
	instance.panel = panel

	panel.webview.onDidReceiveMessage((message) => {

		switch (message.command) {
			case "error": {
				vscode.window.showErrorMessage(message.content);
				break
			}
			case "overwrite": {

				break
			}

			default: {
				vscode.window.showErrorMessage(`Received unknown post message from extension: ${JSON.stringify(message)}`);
				break
			}
		}

	}, undefined, context.subscriptions)

	panel.onDidDispose(() => {
		try {
			instanceManager.removeInstance(instance)
		} catch (error) {
			vscode.window.showErrorMessage(`Could not destroy an editor instance, error: ${error.message}`);
		}
	}, null, context.subscriptions)


	panel.webview.html = createEditorHtml(context, initialText)



}