

type ErrorPostMessage = {
	command: 'error'
	content: string
}

type OverwritePostMessage = {
	command: 'overwrite'
	content: string
}


type SomePostMessage = ErrorPostMessage | OverwritePostMessage