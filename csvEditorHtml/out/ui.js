"use strict";
function toggleReadOptions(shouldCollapse) {
    const el = _getById('read-options-icon');
    const content = _getById('read-options-content');
    if (shouldCollapse !== undefined) {
        _setCollapsed(shouldCollapse, el, content);
        _setReadOptionCollapsedVsState(shouldCollapse);
        return;
    }
    _toggleCollapse(el, content, _setReadOptionCollapsedVsState);
}
function toggleWriteOptions(shouldCollapse) {
    const el = _getById('write-options-icon');
    const content = _getById('write-options-content');
    if (vscode) {
        const lastState = _getVsState();
        vscode.setState(Object.assign({}, lastState, { writeOptionIsCollapsed: shouldCollapse }));
    }
    if (shouldCollapse !== undefined) {
        _setCollapsed(shouldCollapse, el, content);
        _setWriteOptionCollapsedVsState(shouldCollapse);
        return;
    }
    _toggleCollapse(el, content, _setWriteOptionCollapsedVsState);
}
function togglePreview(shouldCollapse) {
    const el = _getById('preview-icon');
    const content = _getById('preview-content');
    if (vscode) {
        const lastState = _getVsState();
        vscode.setState(Object.assign({}, lastState, { previewIsCollapsed: shouldCollapse }));
    }
    if (shouldCollapse !== undefined) {
        _setCollapsed(shouldCollapse, el, content);
        _setPreviewCollapsedVsState(shouldCollapse);
        return;
    }
    _toggleCollapse(el, content, _setPreviewCollapsedVsState);
}
function toggleBeforeComments(shouldCollapse) {
    const el = _getById('comments-before-content-icon');
    const content = _getById('comments-before-content');
    if (shouldCollapse !== undefined) {
        _setCollapsed(shouldCollapse, el, content);
        onResizeGrid();
        return;
    }
    _toggleCollapse(el, content);
    onResizeGrid();
}
function displayOrHideCommentsSections(shouldHide) {
    displayOrHideBeforeComments(shouldHide);
    displayOrHideAfterComments(shouldHide);
    const el = _getById(toggleCommentsSectionsButtonId);
    el.style.display = shouldHide ? 'block' : 'none';
}
function displayOrHideBeforeComments(shouldHide) {
    const div = _getById(commentsBeforeOptionId);
    div.style.display = shouldHide ? 'none' : 'block';
}
function toggleAfterComments(shouldCollapse) {
    const el = _getById('comments-after-content-icon');
    const content = _getById('comments-after-content');
    if (shouldCollapse !== undefined) {
        _setCollapsed(shouldCollapse, el, content);
        onResizeGrid();
        return;
    }
    _toggleCollapse(el, content);
    onResizeGrid();
}
function displayOrHideAfterComments(shouldHide) {
    const div = _getById(commentsAfterOptionId);
    div.style.display = shouldHide ? 'none' : 'block';
}
function _toggleCollapse(el, wrapper, afterToggled) {
    if (el.classList.contains('fa-chevron-right')) {
        _setCollapsed(false, el, wrapper);
        if (afterToggled)
            afterToggled(false);
        return;
    }
    _setCollapsed(true, el, wrapper);
    if (afterToggled)
        afterToggled(true);
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
function toggleBeforeCommentsIndicator(shouldHide) {
    commentsBeforeHasContentDiv.style.visibility = shouldHide ? 'collapse' : 'visible';
}
function toggleAfterCommentsIndicator(shouldHide) {
    commentsAfterHasContentDiv.style.visibility = shouldHide ? 'collapse' : 'visible';
}
function applyHasHeader(fromUndo = false) {
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
        if (fromUndo)
            return;
        headerRow = data[0];
        hot.alter('remove_row', 0);
        elWrite.checked = true;
        defaultCsvReadOptions._hasHeader = true;
        return;
    }
    hot.updateSettings({
        colHeaders: defaultColHeaderFunc
    }, false);
    if (fromUndo)
        return;
    hot.alter('insert_row', 0);
    hot.populateFromArray(0, 0, [headerRow]);
    elWrite.checked = false;
    defaultCsvReadOptions._hasHeader = false;
}
function setDelimiterString() {
    const el = _getById('delimiter-string');
    defaultCsvReadOptions.delimiter = el.value;
}
function setCommentString() {
    const el = _getById('comment-string');
    defaultCsvReadOptions.comments = el.value === '' ? false : el.value;
}
function setQuoteCharString() {
    const el = _getById('quote-char-string');
    defaultCsvReadOptions.quoteChar = el.value;
}
function setEscapeCharString() {
    const el = _getById('escape-char-string');
    defaultCsvReadOptions.escapeChar = el.value;
}
function setSkipEmptyLines() {
}
function setReadDelimiter(delimiter) {
    const el = _getById('delimiter-string');
    el.value = delimiter;
    defaultCsvReadOptions.delimiter = delimiter;
}
function setHasHeaderWrite() {
    const el = _getById('has-header-write');
    defaultCsvWriteOptions.header = el.checked;
}
function setDelimiterStringWrite() {
    const el = _getById('delimiter-string-write');
    defaultCsvWriteOptions.delimiter = el.value;
}
function setCommentStringWrite() {
    const el = _getById('comment-string-write');
    defaultCsvWriteOptions.comments = el.value === '' ? false : el.value;
}
function setQuoteCharStringWrite() {
    const el = _getById('quote-char-string-write');
    defaultCsvWriteOptions.quoteChar = el.value;
}
function setEscapeCharStringWrite() {
    const el = _getById('escape-char-string-write');
    defaultCsvWriteOptions.escapeChar = el.value;
}
function setQuoteAllFieldsWrite() {
    const el = _getById('quote-all-fields-write');
    defaultCsvWriteOptions.quoteAllFields = el.checked;
}
function setNewLineWrite() {
    const el = _getById('newline-select-write');
    if (el.value === '') {
        defaultCsvWriteOptions.newline = newLineFromInput;
    }
    else if (el.value === 'lf') {
        defaultCsvWriteOptions.newline = '\n';
    }
    else if (el.value === 'lf') {
        defaultCsvWriteOptions.newline = '\r\n';
    }
}
function setWriteDelimiter(delimiter) {
    const el = _getById('delimiter-string-write');
    el.value = delimiter;
    defaultCsvWriteOptions.delimiter = delimiter;
}
function generateCsvPreview() {
    const value = getDataAsCsv(defaultCsvWriteOptions);
    const el = _getById('csv-preview');
    el.value = value;
    togglePreview(false);
}
function copyPreviewToClipboard() {
    generateCsvPreview();
    const el = _getById('csv-preview');
    postCopyToClipboard(el.value);
}
function _normalizeDataArray(data) {
    const maxCols = data.reduce((prev, curr) => curr.length > prev ? curr.length : prev, 0);
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (row.length < maxCols) {
            row.push(...Array.from(Array(maxCols - row.length), (p, index) => ''));
        }
    }
}
function displayData(data, commentLinesBefore, commentLinesAfter) {
    if (data === null) {
        if (hot) {
            hot.destroy();
        }
        return;
    }
    _normalizeDataArray(data);
    if (data.length > 0) {
        headerRow = data[0];
    }
    const container = csvEditorDiv;
    if (hot) {
        hot.destroy();
    }
    const beforeCommentsTextarea = _getById(beforeCommentsTextareaId);
    beforeCommentsTextarea.value = commentLinesBefore.join('\n');
    const afterCommentsTextarea = _getById(afterCommentsTextareaId);
    afterCommentsTextarea.value = commentLinesAfter.join('\n');
    hot = new Handsontable(container, {
        data,
        rowHeaders: function (row) {
            let text = (row + 1).toString();
            return row !== 0
                ? `${text} <span class="remove-row clickable" onclick="removeRow(${row})"><i class="fas fa-trash"></i></span>`
                : `${text} <span class="remove-row clickable" onclick="removeRow(${row})" style="visibility: hidden"><i class="fas fa-trash"></i></span>`;
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
                    if (initialConfig) {
                        return initialConfig.doubleClickColumnHandleForcedWith;
                    }
                }
            }
        },
        enterMoves: function (event) {
            const selection = hot.getSelected();
            const _default = {
                row: 1,
                col: 0
            };
            if (!initialConfig || initialConfig.lastRowEnterBehavior !== 'createRow')
                return _default;
            if (!selection || selection.length == 0)
                return _default;
            if (selection.length > 1)
                return _default;
            const rowCount = hot.countRows();
            const selected = selection[0];
            if (selected[0] != selected[2] || selected[0] !== rowCount - 1)
                return _default;
            if (event.key.toLowerCase() === 'enter' && event.shiftKey === false) {
                addRow(false);
            }
            return _default;
        },
        tabMoves: function (event) {
            const selection = hot.getSelected();
            const _default = {
                row: 0,
                col: 1
            };
            if (!initialConfig || initialConfig.lastColumnTabBehavior !== 'createColumn')
                return _default;
            if (!selection || selection.length == 0)
                return _default;
            if (selection.length > 1)
                return _default;
            const colCount = hot.countCols();
            const selected = selection[0];
            if (selected[1] != selected[3] || selected[1] !== colCount - 1)
                return _default;
            if (event.key.toLowerCase() === 'tab' && event.shiftKey === false) {
                addColumn(false);
            }
            return _default;
        },
        afterBeginEditing: function () {
            if (!initialConfig || !initialConfig.selectTextAfterBeginEditCell)
                return;
            const textarea = document.getElementsByClassName("handsontableInput");
            if (!textarea || textarea.length === 0 || textarea.length > 1)
                return;
            const el = textarea.item(0);
            if (!el)
                return;
            el.setSelectionRange(0, el.value.length);
        },
        beforeCopy: function (data, coords) {
        },
        afterUndo: function (action) {
            if (action.actionType === 'remove_row' && action.index === 0) {
                defaultCsvReadOptions._hasHeader = false;
                const el = _getById('has-header');
                const elWrite = _getById('has-header-write');
                el.checked = false;
                elWrite.checked = false;
                applyHasHeader(true);
            }
        },
        beforeRedo: function (action) {
            if (action.actionType === 'remove_row' && action.index === 0) {
                defaultCsvReadOptions._hasHeader = false;
                const el = _getById('has-header');
                const elWrite = _getById('has-header-write');
                el.checked = true;
                elWrite.checked = true;
                applyHasHeader(true);
            }
        },
        afterColumnMove: function (aa, bbb) {
            console.log('asdasd');
            hot.updateSettings({
                colHeaders: defaultColHeaderFunc
            }, false);
        }
    });
    Handsontable.dom.addEvent(window, 'resize', throttle(onResizeGrid, 200));
    const settingsApplied = checkIfHasHeaderReadOptionIsAvailable();
    if (settingsApplied == true && defaultCsvReadOptions._hasHeader === true) {
        applyHasHeader();
    }
    onResizeGrid();
}
let allColSizes = [];
function onResizeGrid() {
    if (!hot)
        return;
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
    let visualIndex = colIndex;
    if (hot) {
        visualIndex = hot.toVisualColumn(colIndex);
    }
    return visualIndex !== 0
        ? `${text} <span class="remove-col clickable" onclick="removeColumn(${visualIndex})"><i class="fas fa-trash"></i></span>`
        : `${text} <span class="remove-col clickable" onclick="removeColumn(${visualIndex})" style="visibility: hidden"><i class="fas fa-trash"></i></span>`;
}
function toggleHelpModal(isVisible) {
    if (isVisible) {
        helModalDiv.classList.add('is-active');
        return;
    }
    helModalDiv.classList.remove('is-active');
}
function toggleAskReadAgainModal(isVisible) {
    if (isVisible) {
        askReadAgainModalDiv.classList.add('is-active');
        return;
    }
    askReadAgainModalDiv.classList.remove('is-active');
}
function onCommentsBeforeInput(event) {
    const el = event.currentTarget;
    toggleBeforeCommentsIndicator(el.value === '');
}
function onCommentsAfterInput(event) {
    const el = event.currentTarget;
    toggleAfterCommentsIndicator(el.value === '');
}
function resetData(content, csvReadOptions) {
    const _data = parseCsv(content, csvReadOptions);
    if (!_data) {
        displayData(_data, [], []);
    }
    else {
        displayData(_data[1], _data[0], _data[2]);
    }
    onResizeGrid();
    toggleAskReadAgainModal(false);
}
//# sourceMappingURL=ui.js.map