# Change Log

## [Unreleased]

## 0.1.5

- added `unsaved changes` indicator (`*`) to the editor title and icon to ui
- `Read options` panel now shows a `⇥` as detected delimiter if a tab was detected

## 0.1.4

- added option to specify initial max column width `initialColumnWidth` (disabled by default)
	- use 0 or a negative number to disable the option (to use auto column size)
- fixed issue where new lines inside a cell are collapsed when the option `enableWrapping` was disabled

## 0.1.3

- added option for cell content wrapping (fixes issue #7)
- switched to custom/own version of handsontable (6.2.2, to keep MIT license)

## 0.1.2

- trim feature now also trims header row (probably better)
- column names now start with 1 (probably better)
- the `has header` option now ignores rows with comments
- fixed bad behavior where disabling `has header` option would insert additional rows (when one deleted rows and the original row index was larger than the current row count)
	- in this case the header row is now inserted as the last row
	- else the header row is inserted at the index where we got it
- fixed some issues where `has header` option and only rows with comments throws
- fixed issue where column headers (via has header option) was not always correctly displayed (the default A, B, C, ... columns were displayed)
- fixed issue where a comment not in the first column would visually indicate the row as a comment row


## 0.1.1

- fixed issue where rendering was really really slow because of comment cell/row highlighting (tested with 100.000 rows ~ 12MB)
- changed comment row handling so that comments are not longer treated like normal csv
	- this also resolves issues where comments with `,` are not properly handled (imported/exported)
	- monkeypatched papaparse so comment rows are parsed as plain text and also exported as plain text

## 0.1.0

- added feature to hide and show rows with comments
- added context menu to insert/remove rows/columns at arbitrary positions
- added context menu options alignment
- fixed issue where sorting and comment highlighting was not synced
- fixed issue where deleting a sorted column would not reset sorting

## 0.0.12

- fixed critical bug where files with more than \~1MB are not properly loaded and saved
	- saved files were corrupted (content of the first \~1MB was repeated after the first \~1MB until the file size was reached)
- added button to trim whitespace (leading and trailing) in all cells
	- prior versions will **trim by default** (on initial render and after cell editing)!

## 0.0.11

- fixed row header width issue for large files
- fixed issue where large files causes the editor to hang
	- handsontable virtual renderer is now used with small initial table size
	- switched from inlining the csv data into the webview html to `webview.postMessage`
- fixed issue where commands relying on `webview.postMessage` were not working (`edit-csv.apply` and `edit-csv.applyAndSave`)

## 0.0.10

- fixed issue on windows where fontawesome icons are not loaded
- fixed issue where adding a column adds two instead of one

## 0.0.9

- Initial release