

type ErrorPostMessage = {
	command: 'error'
	content: string
}

type OverwritePostMessage = {
	command: 'overwrite'
	content: string
}

/**
 * refresh/replace csv with content from the original file?
 */
type AskRefreshPostMessage = {
	command: 'askRefresh'
	content: string
}


type SomePostMessage = ErrorPostMessage | OverwritePostMessage | OverwritePostMessage