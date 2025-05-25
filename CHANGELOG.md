# Change Log

## [Unreleased]

# 0.11.4
- added feature #194 - Better unsaved changes indicator

# 0.11.3
- added feature #176 - add cursor to source file from table selection (via context menu)
	- disabled when certain actions are performed (see https://github.com/janisdd/vscode-edit-csv/issues/176) but basicalyl all that change the shape of the table (e.g. add/remove rows/cols)
	- enabled again when applying changes or reloading/resetting data
- fixed delayed `readOption_hasHeader` feature where the options is automatically enabled as soon as the table has more than 1 row
- lowered the context menu sub items display delay from 300ms to 100ms
- context menu sub menu indicator is now centered
- side bar tooltips is not longer clipped
- removed preview tag (user requested this)
- removed some unused (not minified js) files from packages vsix

# 0.11.2
- added feature #142 - added option `tryToGuessHasHeader`
  - tries to guess from the csv data if there is a header line or not

# 0.11.1

- fixed issue #174 - added option `overwriteExceptEmpty` to the `pasteBehavior` setting
  - it only overwrites the cell content if the paste cell is not empty


# 0.11.0

- added option `forceQuoteLeadingWhitespace` and `forceQuoteTrailingWhitespace` which will quote fields when they have leading or trailing whitespace
- fixed issue #163 by changed option `retainQuoteInformation` from `bool` to `string` with the options
  - `none` (old false), `determinedByColumns` (old true) and `full` (new default)
  - `full` tracks the quote information for every cell individually
- fixed issue where hiding comment rows hides the wrong rows
  - happened when data was sorted and then rows were removed

# 0.10.0

- added feature #161 - `excelLike` option to `dragToAutoFill` setting
  - this is now the default
- added feature #155 -  zoom the table content (only cells, not headers)
  - ui buttons are added or use mouse + ctrl (same as vs code font size feature)
- added option `pasteBehavior` to determine where the old cells should be moved after a paste operation , see #156
- added option `pasteScrollBehavior` to determine where to scroll after a paste operation, see #156

# 0.9.2

- added feature #157 - hide columns initially, added options
  - `initiallyHiddenColumnNumbers` to hide columns based on its number
  - `initiallyHiddenColumnNames` to hide columns based on its name (first non-comment row)
- fixed issue #147: add feature to automatically reload data if the source csv file changes
- fixed issue #152: support drag and paste like excel
  - enabled `dragToAutoFill`/`fillHandle` option
  - only supports copying same sequences `1,2,3` will copy `1,2,3` again not `4,5,6`


# 0.9.1
- fixed issue #146 - doubleClickRowHandleForcedHeight was a string (package config must be a number)
- fixed issue #144 - tools menu item background was the same as foreground color

# 0.9.0
- fixed annoying issue where initial scroll position was set incorrectly (when the row was in the first half)
- fixed issue #140 - add feature to hide columns
- fixed issue #31, #139 - `ctrl+tab`, `ctrl+shift+tab`, `alt+1`, ..., `alt+9` (on linux/windows) is not longer consumed by handsontable
- fixes issue #75 - watch files outside of workspace for changes
	- removed `chikidar` as dependency, vs can now watch all files
	- because the timing when a change is detected and when file model (vs code) is updated is not the same across platforms, we have to use vs code's own file change events
		- `onDidChangeTextDocument` behaves the same way for all platforms but is always fired after the file was changed (on every key stroke)
		- however, we still need a file system watcher because when the user closes the source file, no `onDidChangeTextDocument` event is fired anymore (until `openTextDocument` is called again)
		- to detect if the file was really changed we have to compare the file content with the last known content (so we have a full copy of the file content in memory)
			- this is because we need to know if the change was triggered by this extension or by another program (if last known content == current content then the change was not triggered by this extension)
- changed logo

# 0.8.3
- merged PR #134 - fix instance comparison
	- open editor, close source file, open source file again and try to open editor
	- used to fail because the instance comparison was not correct

# 0.8.2
- fixed issue #133 - not working in browser with `code-server`

# 0.8.1
- fixed issue #132 - search hit are again highlighted when cells contain urls
- maybe fixed issue #124 by - adding option to set delimiters to guess manually

# 0.8.0
- trim cells can now be undone (not for header cells)
- fixed issue #122 - add option customize text color
- added feature #130 - add feature resize rows
	- works the same as `doubleClickColumnHandleForcedWith` (auto resize is a bit better implemented)
- adds feature #109 - open urls in browser
	- controled via `convertUrlsToLinkTags` setting

# 0.7.6
- fixed issue #110 - Add feature to swap rows and columns

# 0.7.5
- fixed issue #111 - add feature resize columns and rows
  - context menu item (which sets the column width(s) to `doubleClickColumnHandleForcedWith`)
- fixed many issues that would break the `doubleClickColumnHandleForcedWith` feature
- fixed issue #115 - Add newline at the end of file
	- new setting `finalNewLine` which controls how the final newline is handled
- fixed issue where edit button was not shown for `dynamic csv` mode (rainbow csv extension)

# 0.7.4
- fixed issue #112 - added keyboard shortcut to delete the current row (`ctrl+shift+alt+minus`)
	- behaves the same was as context menu action (actually uses it)
	- also works on mac (because normally `alt+-` [and or shift] will insert a dash)
- added option `csv-edit.showDeleteColumnHeaderButton` true: shows a delete column button in the column header (on hover), false: not (fixes issue #113)
- added option `csv-edit.showDeleteRowHeaderButton` true: shows a delete row button in the row header (on hover), false: not  (fixes issue #113)
- fixed issue #114 - "dynamic csv" is now also supported as *language id*

# 0.7.3

- added option `csv-edit.autoColumnWidthsIgnoreComments` to ignore comment cells for auto column sizing
- `csv-edit.lastRowOrFirstRowNavigationBehavior` default is now `stop` (was `wrap`)
- `csv-edit.lastColumnOrFirstColumnNavigationBehavior` default is now `stop` (was `wrap`)

## 0.7.2
- fixed issue #97 - fixed rows/columns is ignored if `hasHeader` was changed

## 0.7.1
- fixed issue #94 - find widget buttons are outside if panel
- find widget design is now more similar to vs code ones

## 0.7.0
- fixed issue #73 - changed style to match vs code ones (with webview-ui-toolki)
	- however, there are some issues with 
		- text input: input event don't get triggered when some table cell has focus...
		- dropdown: chaning font size is not possible
	- removed bulma css

## 0.6.10
- fixed issue #93 - regex search ignored match-case option

## 0.6.9
- added option `pasteMode` to control how clipboard content is pasted into the table
	- it allows to ignore row/column separators (\n, \t) to paste the data into "fewer" cells
- added setting `fontFamilyInTable` to control which font is used for the table
- added option `initialOnly_correctRowAlwaysFirstColumn` to setting `openTableAndSelectCellAtCursorPos` to only open the correct row but always column one
	- this is now the new default
- in the setting `openTableAndSelectCellAtCursorPos` the option `initalOnly` was renamed to `initialOnly_correctRowAndColumn`
- added settings `lastRowOrFirstRowNavigationBehavior` and `lastColumnOrFirstColumnNavigationBehavior` to control if we wrap ad the start/end of rows/columns while navigating
	- works with `lastRowEnterBehavior`, `lastColumnTabBehavior` (the `default` option will apply these two new settings)
	- see https://handsontable.com/docs/6.2.2/Options.html#autoWrapRow

## 0.6.8

- added option `openTableAndSelectCellAtCursorPos` to open the table and selected the cell where the cursor was (fixed feature request #83)
	- on by default!
	- note for multi character delimiters it might not work properly (but should most of the time, only tested a few cases and it worked)
	- if comments are hidden and the cursor is on a comment, the next row is selected
- after `reset dat and apply read options` the scroll position and selected cell is restored (issue #84)

## 0.6.7

- added new command `edit-csv.editWithConfig"` which is the same as `edit-csv.edit` but one can supply settings to overwrite (see type `[project root]/csvEditorHtml/types.d.ts > EditCsvConfigOverwrite`)
	- added setting `hideOpenCsvEditorUiActions` to hide the title bar button and file context menu action, in case the other extension want to show custom button to trigger the editor
	- example how to use this from another extension can be found in the readme
- removed `editor/title/context` actions (probably not used...)
- small readme updates

## 0.6.6

- fixed issue #80: cell editor is not commited after pressing `ctrl/cmd+s`, so changes are not applied to file

## 0.6.5

- fixed issue #77: Newlines inserted into pasted data (clipboard)
	- fixed via new internal handsontable version

## 0.6.4

- fixed issue #72: copy limited to 1000 cells
	- changed the limit to 10000000

## 0.6.3

- fixed issue #70: Removing columns doesn't remove header
	- undo/redo does not work with column headers

## 0.6.2

- fixed issue #63: column header cells can now be edited
- fixed issue #66: added readonly mode
- fixed issue #64: some non-text keys (e.g. volume controls) not longer clear cell values
	- also compound characters also not clear cell values

## 0.6.1

- added button to resize column to match their content

## 0.6.0

- fixed issue where reordering/sorting breaks inserting
- new logo

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