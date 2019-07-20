# Change Log

## [Unreleased]

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