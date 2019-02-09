# vscode-edit-csv README

This extensions allows you to edit csv files with an excel like table ui

## Features

Execute the command `edit as csv` to open an editor for the current file.

*Execute the command again to switch back to the source file or to switch back to the editor*

\!\[feature X\]\(images/feature-x.png\)


## How this extension works

When you click on `edit csv file`

- the file content is stringified and injected into the editor (webview) html
- the current config is stringified and injected into the editor (webview) html
- a manager stores a reference to the webview, source file uri, editor uri

- in the webview the injected text is then parsed as csv and displayed in the table element

When you click on `apply`

- the current table is transformed into csv and written to the source file
	- if you made an apply by accident you can undo in the table element (with the usual shortcuts) or open the source file and just do an undo (with the usual shortcuts)

- When you click on `apply and save`
	- the first step is equal to `apply`
	- then the source file is saved


- When you click in `Read again`
	- the injected content is used (when the editor was opened), this does not read the source file again

As you can see this **does not** scale very well with **large csv files** (needs to be stringified and stored the whole time)

## Extension Settings

There are some settings for this plugin. Open the VS Code Settings and search for `csv-edit`

## Known Issues


- `apply and save` an unnamed file will close the editor
	- this is because the new uri for the new file is not known and for some reason if an extension saves an unnamed file the new file is not displayed automatically
		- maybe there is some api to get the new uri (but i couldn't find any)

- Because the table is exported comments can only be used before or after the csv content

## Used projects

- for csv parsing/writing: [papaparse](https://github.com/mholt/PapaParse)
- for grid/table element: [handsontable](https://github.com/handsontable/handsontable)
- for ui: [bulma](https://github.com/jgthms/bulma), [bulma-extension](https://github.com/Wikiki/bulma-extensions), [fontawesome](https://github.com/FortAwesome/Font-Awesome)


## How to build locally

To compile (and watch) the files in `csvEditorHtml` run

```bash
cd csvEditorHtml
tsc -w
```

then press `F5` to run the extension

When you edit `csvEditorHtml/index.html` you need to manually copy the changes (everything in the body but without the scripts) into `src/getHtml.ts` (past into body)
