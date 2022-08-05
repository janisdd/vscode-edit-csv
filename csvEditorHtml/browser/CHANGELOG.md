# Change log of the browser version

note that the changelog is also present on the website when you click on the version. Keep them in sync!

### [Unreleased]

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