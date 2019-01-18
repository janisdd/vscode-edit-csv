"use strict";
function toggleReadOptions(shouldCollapse) {
    const el = _getById('read-options-icon');
    const content = _getById('read-options-content');
    if (shouldCollapse !== undefined) {
        _setCollapsed(shouldCollapse, el, content);
        return;
    }
    _toggleCollapse(el, content);
}
function toggleWriteOptions(shouldCollapse) {
    const el = _getById('write-options-icon');
    const content = _getById('write-options-content');
    if (shouldCollapse !== undefined) {
        _setCollapsed(shouldCollapse, el, content);
        return;
    }
    _toggleCollapse(el, content);
}
function togglePreview(shouldCollapse) {
    const el = _getById('preview-icon');
    const content = _getById('preview-content');
    if (shouldCollapse !== undefined) {
        _setCollapsed(shouldCollapse, el, content);
        return;
    }
    _toggleCollapse(el, content);
}
function _toggleCollapse(el, wrapper) {
    if (el.classList.contains('fa-chevron-right')) {
        _setCollapsed(false, el, wrapper);
        return;
    }
    _setCollapsed(true, el, wrapper);
}
function _setCollapsed(shouldCollapsed, el, wrapper) {
    if (shouldCollapsed) {
        el.classList.remove('fa-chevron-down');
        el.classList.add('fa-chevron-right');
        wrapper.style.display = 'none';
        return;
    }
    el.classList.add('fa-chevron-down');
    el.classList.remove('fa-chevron-right');
    wrapper.style.display = 'block';
}
function setHasHeader() {
    const el = _getById('has-header');
    const data = getData();
    if (data.length === 0) {
        return;
    }
    const elWrite = _getById('has-header-write');
    if (el.checked) {
        hot.updateSettings({
            colHeaders: data[0].map((col, index) => defaultColHeaderFunc(index, col))
        }, false);
        headerRow = data[0];
        hot.alter('remove_row', 0);
        elWrite.checked = true;
        return;
    }
    hot.updateSettings({
        colHeaders: defaultColHeaderFunc
    }, false);
    hot.alter('insert_row', 0);
    hot.populateFromArray(0, 0, [headerRow]);
    elWrite.checked = false;
}
function setDelimiterString() {
    const el = _getById('delimiter-string');
    csvReadOptions.delimiter = el.value;
}
function setCommentString() {
    const el = _getById('comment-string');
    csvReadOptions.comments = el.value === '' ? false : el.value;
}
function setSkipEmptyLines() {
}
function setReadDelimiter(delimiter) {
    const el = _getById('delimiter-string');
    el.value = delimiter;
    csvReadOptions.delimiter = delimiter;
}
function setHasHeaderWrite() {
    const el = _getById('has-header-write');
    csvWriteOptions.header = el.checked;
}
function setDelimiterStringWrite() {
    const el = _getById('delimiter-string-write');
    csvWriteOptions.delimiter = el.value;
}
function setCommentStringWrite() {
    const el = _getById('comment-string-write');
    csvWriteOptions.comments = el.value === '' ? false : el.value;
}
function setNewLineWrite() {
    const el = _getById('newline-select-write');
    if (el.value === '') {
        csvWriteOptions.newline = newLineFromInput;
    }
    else if (el.value === 'lf') {
        csvWriteOptions.newline = '\n';
    }
    else if (el.value === 'lf') {
        csvWriteOptions.newline = '\r\n';
    }
}
function setWriteDelimiter(delimiter) {
    const el = _getById('delimiter-string-write');
    el.value = delimiter;
    csvWriteOptions.delimiter = delimiter;
}
function generateCsvPreview() {
    const value = getDataAsCsv(csvWriteOptions);
    const el = _getById('csv-preview');
    el.value = value;
    togglePreview(false);
}
function displayData(data) {
    if (data === null) {
        if (hot) {
            hot.destroy();
        }
        return;
    }
    if (data.length > 0) {
        headerRow = data[0];
    }
    const container = csvEditorDiv;
    if (hot) {
        hot.destroy();
    }
    hot = new Handsontable(container, {
        data,
        rowHeaders: function (row) {
            let text = (row + 1).toString();
            return `${text} <span class="remove-row clickable" onclick="removeRow(${row})"><i class="fas fa-trash"></i></span>`;
        },
        fillHandle: false,
        colHeaders: defaultColHeaderFunc,
        currentColClassName: 'foo',
        currentRowClassName: 'foo',
        comments: false,
        manualRowMove: true,
        manualRowResize: true,
        manualColumnMove: true,
        manualColumnResize: true,
        columnSorting: true,
        outsideClickDeselects: false,
        beforeColumnResize: function (oldSize, newSize, isDoubleClick) {
            if (allColSizes.length > 0 && isDoubleClick) {
                if (oldSize === newSize) {
                    if (miscOptions.doubleClickMinColWidth) {
                        return miscOptions.doubleClickMinColWidth;
                    }
                }
            }
        },
    });
    Handsontable.dom.addEvent(window, 'resize', throttle(onResize, 200));
    checkIfHasHeaderReadOptionIsAvailable();
}
let allColSizes = [];
function onResize() {
    const widthString = getComputedStyle(csvEditorWrapper).width;
    if (!widthString) {
        _error(`could not resize table, width string was null`);
        return;
    }
    const width = parseInt(widthString.substring(0, widthString.length - 2));
    const heightString = getComputedStyle(csvEditorWrapper).height;
    if (!heightString) {
        _error(`could not resize table, height string was null`);
        return;
    }
    const height = parseInt(heightString.substring(0, heightString.length - 2));
    hot.updateSettings({
        width: width,
        height: height,
    }, false);
    allColSizes = [];
    for (let i = 0; i < hot.countCols(); i++) {
        allColSizes.push(hot.getColWidth(i));
    }
}
function defaultColHeaderFunc(colIndex, colName) {
    let text = getSpreadsheetColumnLabel(colIndex);
    if (colName !== undefined) {
        text = colName;
    }
    return `${text} <span class="remove-col clickable" onclick="removeColumn(${colIndex})"><i class="fas fa-trash"></i></span>`;
}
function toggleHelpModal(isVisible) {
    if (isVisible) {
        helModalDiv.classList.add('is-active');
        return;
    }
    helModalDiv.classList.remove('is-active');
}
//# sourceMappingURL=ui.js.map