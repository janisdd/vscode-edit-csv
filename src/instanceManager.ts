import * as vscode from 'vscode';
import type * as chokidar from "chokidar";

export interface Instance {
	/**
	 * the panel with the editor
	 */
	panel: vscode.WebviewPanel
	/**
	 * the uri of the source file
	 * this is the same as in {@link document}
	 */
	sourceUri: vscode.Uri
	/**
	 * the uri of the editor webview
	 */
	editorUri: vscode.Uri

	/**
	 * the source file reference
	 * might be closed 
	 * or out of sync (for non-workspace files)
	 */
	document: vscode.TextDocument

	/**
	 * currently external files cannot be auto
	 * false: the user must open the file so that vs code refreshes the file model and switch back to the table and manually refresh
	 */
	supportsAutoReload: boolean

	/**
	 * true: edit has unsaved changes, false: not
	 */
	hasChanges: boolean

	/**
	 * the original title for the tab
	 */
	originalTitle: string

	/**
	 * when the table saves the file we need to ignore the next change else the disk change will trigger the table to reload (losing undo, ...)
	 */
	ignoreNextChangeEvent: boolean

}

export interface InstanceWorkspaceSourceFile extends Instance {
	kind: 'workspaceFile'

	/**
	* used to watch the source file and notify the extension view
	*/
	sourceFileWatcher: vscode.FileSystemWatcher | null
}

export interface InstanceExternalFile extends Instance {
	kind: 'externalFile'

	/**
 * used to watch the source file and notify the extension view
 */
	sourceFileWatcher: chokidar.FSWatcher | null
}

export type SomeInstance = InstanceWorkspaceSourceFile | InstanceExternalFile

export interface InstanceStorage {
	/**
	 * the key is the source uri to string
	 */
	[sourceUriString: string]: SomeInstance
}

/**
 * we need keep track of all editor instances
 * so we can ensure that e.g. we open only one editor per csv file,
 * find the source file for an editor...
 */
export class InstanceManager {

	private instances: InstanceStorage = {}


	public getAllInstances(): SomeInstance[] {
		const keys = Object.keys(this.instances)
		const allInstances = keys.map(p => this.instances[p])
		return allInstances
	}

	public addInstance(instance: SomeInstance) {

		const oldInstance = this.instances[instance.sourceUri.toString()]

		if (oldInstance) {
			throw new Error('tried to add a new instance but we got old one (with the source uri)')
		}

		this.instances[instance.sourceUri.toString()] = instance
	}

	public removeInstance(instance: SomeInstance) {
		const oldInstance = this.instances[instance.sourceUri.toString()]

		if (!oldInstance) {
			throw new Error('could not find old instance')
		}

		delete this.instances[instance.sourceUri.toString()]
	}

	public findInstanceBySourceUri(sourceUri: vscode.Uri): SomeInstance | null {

		//key is the source uri ... but we might change that so use find
		// const instance = this.instances[sourceUri.toString()]
		const instance = this.getAllInstances().find(p => p.sourceUri === sourceUri)

		if (!instance) return null

		return instance
	}

	public findInstanceByEditorUri(editorUri: vscode.Uri): SomeInstance | null {

		const instance = this.getAllInstances().find(p => p.editorUri === editorUri)

		if (!instance) return null

		return instance
	}

	public hasActiveEditorInstance(): boolean {
		const activeInstances = this.getAllInstances().filter(p => p.panel.active)
		return activeInstances.length > 0 // or === 1 ?
	}

	public getActiveEditorInstance(): SomeInstance {
		const activeInstances = this.getAllInstances().filter(p => p.panel.active)

		if (activeInstances.length === 0) {
			throw new Error('no active editor found')
		}

		if (activeInstances.length > 1) {
			throw new Error('too many active editors found')
		}

		return activeInstances[0]
	}

}