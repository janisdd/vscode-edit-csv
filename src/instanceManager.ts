import * as vscode from 'vscode';

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
	 * true: edit has unsaved changes, false: not
	 */
	hasChanges: boolean

	/**
	 * the original title for the tab
	 */
	originalTitle: string

	/**
	 * used to watch the source file and notify the extension view
	 */
	sourceFileWatcher: vscode.FileSystemWatcher
}

export interface InstanceStorage  {
	/**
	 * the key is the source uri to string
	 */
	[sourceUriString: string]: Instance
}

/**
 * we need keep track of all editor instances
 * so we can ensure that e.g. we open only one editor per csv file,
 * find the source file for an editor...
 */
export class InstanceManager {

	private instances: InstanceStorage = {}


	public getAllInstances(): Instance[] {
		const keys = Object.keys(this.instances)
		const allInstances = keys.map(p => this.instances[p])
		return allInstances
	}

	public addInstance(instance: Instance) {

		const oldInstance = this.instances[instance.sourceUri.toString()]

		if (oldInstance) {
			throw new Error('tried to add a new instance but we got old one (with the source uri)')
		}

		this.instances[instance.sourceUri.toString()] = instance
	}

	public removeInstance(instance: Instance) {
		const oldInstance = this.instances[instance.sourceUri.toString()]

		if (!oldInstance) {
			throw new Error('could not find old instance')
		}

		delete this.instances[instance.sourceUri.toString()]
	}

	public findInstanceBySourceUri(sourceUri: vscode.Uri): Instance | null {

		//key is the source uri ... but we might change that so use find
		// const instance = this.instances[sourceUri.toString()]
		const instance = this.getAllInstances().find(p => p.sourceUri === sourceUri)

		if (!instance) return null

		return instance
	}

	public findInstanceByEditorUri(editorUri: vscode.Uri): Instance | null {

		const instance = this.getAllInstances().find(p => p.editorUri === editorUri)

		if (!instance) return null

		return instance
	}

	public hasActiveEditorInstance(): boolean {
		const activeInstances = this.getAllInstances().filter(p => p.panel.active)
		return activeInstances.length > 0 // or === 1 ?
	}

	public getActiveEditorInstance(): Instance {
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