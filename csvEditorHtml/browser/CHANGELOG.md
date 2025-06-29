# Change log of the browser version

note that the changelog is also present on the website when you click on the version. Keep them in sync!

### [Unreleased]

## 1.7.4
- (same as vs code extension 0.11.5)

## 1.7.3
- (same as vs code extension 0.11.4)
- added feature #194 - Better unsaved changes indicator
- added feature #193 - Copy column header to clipboard
- updated `has header` ui tooltip

## 1.7.2
- (same as vs code extension 0.11.3)
- fixed delayed `readOption_hasHeader` feature where the options is automatically enabled as soon as the table has more than 1 row
- lowered the context menu sub items display delay from 300ms to 100ms
- context menu sub menu indicator is now centered
- side bar tooltips is not longer clipped
- removed preview tag (user requested this)

## 1.7.1
- (same as vs code extension v0.11.1)
- fixed issue #174 - added option `overwriteExceptEmpty` to the `pasteBehavior` setting
  - it only overwrites the cell content if the paste cell is not empty

## 1.7.0
- (same as vs code extension v0.11.0)
- added option `forceQuoteLeadingWhitespace` and `forceQuoteTrailingWhitespace` which will quote fields when they have leading or trailing whitespace
- fixed issue #163 by changed option `retainQuoteInformation` from `bool` to `string` with the options
  - `none` (old false), `determinedByColumns` (old true) and `full` (new default)
  - `full` tracks the quote information for every cell individually
- fixed issue where hiding comment rows hides the wrong rows
  - happened when data was sorted and then rows were removed

## 1.6.0
- (same as vs code extension v0.10.0)
- added feature #161 - `excelLike` option to `dragToAutoFill` setting
  - this is now the default
- added feature #155 -  zoom the table content (only cells, not headers)
  - ui buttons are added or use mouse + ctrl (same as vs code font size feature)
- added option `pasteBehavior` to determine where the old cells should be moved after a paste operation , see #156
- added option `pasteScrollBehavior` to determine where to scroll after a paste operation, see #156

## 1.5.1
- (same as vs code extension v0.9.1)
- fixed issue #146 - doubleClickRowHandleForcedHeight was a string (package config must be a number)
- fixed issue #144 - tools menu item background was the same as foreground color

## 1.5.0
- (same as vs code extension v0.9.0)
- changed logo
- fixed issue #140 - add feature to hide columns
- fixed issue #31, #139 - `ctrl+tab`, `ctrl+shift+tab`, `alt+1`, ..., `alt+9` (on linux/windows) is not longer consumed by handsontable

## 1.4.1
- (same as vs code extension v0.8.1)
- fixed issue #132 - search hit are again highlighted when cells contain urls
- maybe fixed issue #124 by - adding option to set delimiters to guess manually

## 1.4.0
- (same as vs code extension v0.8.0)
- trim cells can now be undone (not for header cells)
- fixed issue #122 - add option customize text color
- added feature #130 - add feature resize rows
	- works the same as `doubleClickColumnHandleForcedWith` (auto resize is a bit better implemented)
- adds feature #109 - open urls in browser
	- controled via `convertUrlsToLinkTags` setting

## 1.3.6
- (same as vs code extension v0.7.6)
- fixed issue #110 - Add feature to swap rows and columns

## 1.3.5
- (same as vs code extension v0.7.5)
- fixed issue #111 - add feature resize columns and rows
  - context menu item (which sets the column width(s) to `doubleClickColumnHandleForcedWith`)
- fixed many issues that would break the `doubleClickColumnHandleForcedWith` feature
- fixed issue #115 - Add newline at the end of file
	- new setting `finalNewLine` which controls how the final newline is handled
- fixed issue where edit button was not shown for `dynamic csv` mode (rainbow csv extension)

## 1.3.4
- (same as vs code extension v0.7.4)
- fixed issue #112 - added keyboard shortcut to delete the current row (`ctrl+shift+alt+minus`)
	- behaves the same was as context menu action (actually uses it)
	- also works on mac (because normally `alt+-` [and or shift] will insert a dash)
- added option `csv-edit.showDeleteColumnHeaderButton` true: shows a delete column button in the column header (on hover), false: not (fixes issue #113)
- added option `csv-edit.showDeleteRowHeaderButton` true: shows a delete row button in the row header (on hover), false: not  (fixes issue #113)
- fixed issue #114 - "dynamic csv" is now also supported as *language id*


## 1.3.3
- (same as vs code extension v0.7.3)
- added option `csv-edit.autoColumnWidthsIgnoreComments` to ignore comment cells for auto column sizing
- `csv-edit.lastRowOrFirstRowNavigationBehavior` default is now `stop` (was `wrap`)
- `csv-edit.lastColumnOrFirstColumnNavigationBehavior` default is now `stop` (was `wrap`)

## 1.3.2
- (same as vs code extension v0.7.2)
- fixed issue #97 - fixed rows/columns is ignored if `hasHeader` was changed

## 1.3.1

- (same as vs code extension v0.7.1)
- fixed issue 94 - find widget buttons are outside if panel
- find widget design is now more similar to vs code ones

## 1.3.0

- (same as vs code extension v0.7.0)
- fixed issue #73 - changed style to match vs code ones (with webview-ui-toolki)
	- however, there are some issues with 
		- text input: input event don't get triggered when some table cell has focus...
		- dropdown: chaning font size is not possible
	- removed bulma css

## 1.2.9

- (same as vs code extension v0.6.10)
- fixed issue 93 - regex search ignored match-case option)

## 1.2.8

- (same as vs code extension v0.6.9)
- added option `pasteMode` to control how clipboard content is pasted into the table
	- it allows to ignore row/column separators (\n, \t) to paste the data into "fewer" cells
- added setting `fontFamilyInTable` to control which font is used for the table
- added option `initialOnly_correctRowAlwaysFirstColumn` to setting `openTableAndSelectCellAtCursorPos` to only open the correct row but always column one
	- this is now the new default
- in the setting `openTableAndSelectCellAtCursorPos` the option `initalOnly` was renamed to `initialOnly_correctRowAndColumn`
- added settings `lastRowOrFirstRowNavigationBehavior` and `lastColumnOrFirstColumnNavigationBehavior` to control if we wrap ad the start/end of rows/columns while navigating
	- works with `lastRowEnterBehavior`, `lastColumnTabBehavior` (the `default` option will apply these two new settings)
	- see https://handsontable.com/docs/6.2.2/Options.html#autoWrapRow

## 1.2.7

- (same as vs code extension v0.6.8)
- added option `openTableAndSelectCellAtCursorPos` to open the table and selected the cell where the cursor was (fixed feature request #83)
	- on by default!
	- note for multi character delimiters it might not work properly (but should most of the time, only tested a few cases and it worked)
- after `reset dat and apply read options` the scroll position and selected cell is restored (issue #84)

## 1.2.6

- (same as vs code extension v0.6.6)
- fixed issue 80: cell editor is not commited after pressing `ctrl/cmd+s`, so changes are not applied to file

## 1.2.5

- (same as vs code extension v0.6.5)
- fixed issue 77: Newlines inserted into pasted data (clipboard)
	- fixed via new internal handsontable version

## 1.2.4

- (same as vs code extension v0.6.4)
- fixed issue 72: copy limited to 1000 cells
	- changed the limit to 10000000

## 1.2.3

- (same as vs code extension v0.6.3)
- fixed issue 70: Removing columns doesn't remove header
	- undo/redo does not work with column headers

## 1.2.2

- (same as vs code extension v0.6.2)
- fixed issue 63: column header cells can now be edited
- fixed issue 66: added readonly mode
- fixed issue 64: some non-text keys (e.g. volume controls) not longer clear cell values
	- also compound characters also not clear cell values

## 1.2.1

- (same as vs code extension v0.6.1)
- added button to resize column to match their content

## 1.2.0

- (same as vs code extension v0.6.0)
- fixed issue where reordering/sorting breaks inserting
- new logo

## 1.1.6

- fixed issue in papaparse where multi-character delimiters won't work

## 1.1.5

- added shortcuts to insert row above (ctrl+shift+alt+up) / below (ctrl+shift+alt+down) and insert column left (ctrl+shift+alt+left) / right (ctrl+shift+alt+right)

## 1.1.4

- (same as vs code extension v0.5.6)
- added option to handle empty values (null, undefined and empty (string) values) `quoteEmptyOrNullFields`
	- takes always precedence over retainQuoteInformation

## 1.1.3

- (same as vs code extension v0.5.5)
- fixed papaparse issue where `null` values (e.g. when a new row/col was added via handsontable) did't respect the `retainQuoteInformation`

## 1.1.2

- (same as vs code extension v0.5.3)
- added additional buttons to insert rows/columns
- fixed issue where the table height is not properly resized when the windows is resized
- resetting data now keeps column widths
	- when removing a column left from a column the (right) column keeps it size
	- the width is also shifted
- added hint what option `EscapeChar` does (escapes the `QuoteChar` inside field values)

## 1.1.1

- (same as vs code extension v0.5.2)
- added hint to readme how to set csv for different file types in vs code
	- was asked several times
- read option `has header` can now be toggled even if the table has only 1 row
	this will automatically enable the option as soon as the table gets >= 2 rows
- side bar stats are only updated if the side bar is visible
	- opening the side bar will calculate the stats (reselect is not needed)

## 1.1.0
- added multi column sorting (custom handsontable version bump)
- left side panel (stats) now supports two different number styles

## 1.0.1
- toast now displays the exported file encoding
- side panel can now be resized

## 1.0.0
- initial release