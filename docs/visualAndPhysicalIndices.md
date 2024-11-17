# Visual and Physical Indices



### Current Mapping

To get the current mapping, run

```js
# rows
Array(hot.countRows()).fill(0).map((p,i) => hot.toPhysicalRow(i))
# columns
Array(hot.countCols()).fill(0).map((p,i) => hot.toPhysicalColumn(i))
```

### Inserting a row/column befor/after uses visual indices

When you insert a row/col they are inserted at the visual (displayed) location.
If you sort the data, insert a row and then revert the sorting, the new row/col will stay at the inserted position.

Here is why:

NOTE: the physical and visual index handling is messed up in handsontable...

e.g. in core.js > alter(action, index, ...) the index is expected to be a visual index
for 'insert_row' it calls 'datamap.createRow(index, ...)' (the index is not changed)
the docs of DataMap.prototype.createRow = function(index, ...) says it's expecting a physical index!
this is true because  spliceData(index, ...) is called, which modified the source data directly at the given index (so it must be physical!)
after that the afterCreateRow hooks are run which updates the visual <-> physical index mapping (the index is still not changed)
the mapping is stored in the manualRowMove.js plugin, the hook 'onAfterCreateRow' is triggered with the index and 'this.rowsMapper.shiftItems(index, amount)' is called
shiftItems shifts all indices greater than index (and increases them) and then inserts the index itself, so array[index] = index
this means that the mapping for the new row is inserted at the correct position (when we look up a physical index, we would execute array[visualIndex] where the new index is stored)
however, array[index] = index, so the physical index of the new row is the visual index
  it would be more intuitive if we would insert the new physical index but this is not possible by the shiftItems method because the entry for array[index] is always the index itself
  to reproduce this, create a table with 1,2,3,4,5, and some data between, sort it, and then insert a row before row 3
  the row will be displayed at the correct position but the physical index 'wrong' because if you revert the sort, the row will not be before row 3 but at the visual index it was inserted
THIS IS THE CURRENT behavior of handsontable, even in version 12.x
fixing this is not easy, was we would have to pass the physical index to the alter method (in oder to correctly 'spliceData') but all other hooks expect the visual index!!
  also, when we use 'insert_row' we don't know the real physical index because we don't know if the row should be above or below the given row and we would not know the correct visual index
 handsontable removed this method in favor of 'insert_row_below' and 'insert_row_above', this way we could compute the correct visual index (by toVisualIndex(index) and then +/-1)
BUT FOR NOW we keep the current bahavior of handsontable