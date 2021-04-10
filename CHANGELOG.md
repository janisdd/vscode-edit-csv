# Change Log

## [Unreleased]

## 0.5.8

- fixed issue in papaparse where multi-character delimiters won't work
- updated the ui to only accept the proper lengths for csv read options
	- config will throw an error if the csv read options are too long

## 0.5.7

- added shortcuts to insert row above (ctrl+shift+alt+up) / below (ctrl+shift+alt+down) and insert column left (ctrl+shift+alt+left) / right (ctrl+shift+alt+right)
- added option to configure what cell should be selected after a row/col is inserted
	- `insertRowBehavior`, `insertColBehavior`
	- cell context menu to insert row/col now also uses the configured action

## 0.5.6

- added option to handle empty values (null, undefined and empty (string) values) `quoteEmptyOrNullFields`
	- takes always precedence over retainQuoteInformation
	- updated custom papaparse to support this option

## 0.5.5

- fixed papaparse issue where `null` values (e.g. when a new row/col was added via handsontable) did't respect the `retainQuoteInformation`

## 0.5.4

- added support for more vs code csv language ids

## 0.5.3

- added additional buttons to insert rows/columns
- fixed issue where the table height is not properly resized when the windows is resized
- resetting data now keeps column widths
	- when removing a column left from a column the (right) column keeps it size
	- the width is also shifted
- added hint what option `EscapeChar` does (escapes the `QuoteChar` inside field values)

## 0.5.2

- added hint to readme how to set csv for different file types in vs code
	- was asked several times
- read option `has header` can now be toggled even if the table has only 1 row
	this will automatically enable the option as soon as the table gets >= 2 rows
- side bar stats are only updated if the side bar is visible
	- opening the side bar will calculate the stats (reselect is not needed)

## 0.5.0

- added browser version
- added side panel with some stats
	- supports different number styles (NOT FOR SORTING)
- options bar is not longer flashing (when hiding it at startup)
	- done via css variable
- added multi column sorting (custom handsontable version bump)
- fixed issue where papaparse would take very long to load a csv file
	- this was because guessDelimiter and all fields quoted cases the whole file to be "searched" for the right delimiter multiple times (for each known delimiter)
		- this was the case when there was some quoting issues

## 0.4.2

- fixed issue where the background color was not in sync with the editor color theme
- added online version of the plugin
- fixed issue on windows where the cells had a red outline instead of a blue one

## 0.4.1

- file watchers now work for all files (not only inside the current workspace)
	- but the automatic file reload only for files inside the current workspace!!
- added config option to disable source file watching
- help modal can finally be closed by clicking on the background

## 0.4.0

- added source file watchers (only works if the file is inside the current workspace)
	- this will notify the webview and
		- reload the file content into the webview (if the table has no changes)
		- ask the user if the source file should be re-read (if the table has changes)
	- if the file is not inside the current workspace an indicator is displayed in the ui
- if the user hits apply changes and the source file was deleted (no .stats) then a temp file is created (then the user can decide to persist or discard it)
- fixed issue where some modals are behind table elements

## 0.3.0

- renamed option `fixFirstXRows` to `initiallyFixedRowsTop` (breaking change, old config gets invalid)
- added option `initiallyFixedColumnsLeft`
- `initiallyFixedRowsTop` and `initiallyFixedColumnsLeft` now work properly
	- with has header (read option)
	- when adding/removing rows/columns

## 0.2.11

- added button to reload the file content (from disk)
	- this also replaces the in-memory snapshot of the file (for the reset data feature)

## 0.2.10

- added option to display column names like Excel (with letters): `showColumnHeaderNamesWithLettersLikeExcel`
	- we use the long name because one can search for `letters` or `excel` and will find it

## 0.2.9

- adopted webview's asWebviewUri api
- minimal vscode version is now 1.38

## 0.2.8

- added shortcut (ctrl+s/cmd+s) to `apply changes to file and save`

## 0.2.7

- fixed typo `QuotChar` -> `QuoteChar`
- changed some labels

## 0.2.6

- fixes issue #21 - past into search widget not working on mac
- fixed issue where shortcut for opening the search widget not focused search input when the cell editor had focus and the find widget was already displayed
- some more shortcuts should now work again when the find widget is open (everything with meta or ctrl is passed through to vs code)

## 0.2.5

- added option `fontSizeInPx` to set the font size in the webview (or to sync it with the editor)
- moved ui options (read/write/preview) into one panel
	- replaced options `writeOptionsAppearance`, `readOptionsAppearance`, `previewOptionsAppearance` with `optionsBarAppearance`
- `trim` feature now only shows `unsaved changes` when at least one cell changed

## 0.2.4

- added option to fix the first X rows (`fixFirstXRows`)
- added option to disable borders (`disableBorders`)
	- this and `has header` option are mutually exclusive
		- `has header` has priority
- fixed issue where enabled initial state of `has header` would trigger `has changes` indicator

## 0.2.3

- added option to retain/store quote information from parsing
	- changed papaparse
- fixed issue where enabling `has header` option and then moving column will only move data but not the header data
- fixed issue where all empty fields first line was not recognized as csv row
- fixed issue where quote all fields will not quote all empty field rows
- fixed issue where the initial value of read option `has header` would keep undo items (header row)
	- we now clear the undo stack after we set the initial value for read option `has header` and
	- `reset data` will now correctly re-apply the `has header` value
- after applying `has header` read option the undo/redo stack is cleared!
	- it's just too complicated to get this 100% right

## 0.2.2

- added `ctrl+f`find shortcut for windows/linux

## 0.2.1

- fixed issue where empty `Read options > Comment` would cause all rows to be comments (#14)

## 0.2.0

- replaced built-in vs code find widget with custom find widget
	- tries to stay close to the vs code find widget
	- some key features
		- async search
		- options (match case, trim cell value, regex, ...)
		- move widget
- removed all node_modules production dependencies
	- we now use the `thirdParty` folder for this

## 0.1.5

- added `unsaved changes` indicator (`*`) to the editor title and icon to ui
- `Read options` panel now shows a `⇥` as detected delimiter if a tab was detected
- when expanding rows initially we now show the `unsaved changes` indicator

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