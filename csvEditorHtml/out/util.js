"use strict";
function _getById(id) {
    const el = document.getElementById(id);
    if (!el) {
        _error(`could not find element with id '${id}'`);
        return null;
    }
    return el;
}
function getSpreadsheetColumnLabel(index) {
    return `column ${index}`;
}
function removeRow(index) {
    hot.alter('remove_row', index);
    checkIfHasHeaderReadOptionIsAvailable();
}
function removeColumn(index) {
    hot.alter('remove_col', index);
    checkIfHasHeaderReadOptionIsAvailable();
    _resizeMergedColumns();
}
function addRow(selectNewRow = true) {
    const numRows = hot.countRows();
    hot.alter('insert_row', numRows);
    if (selectNewRow) {
        hot.selectCell(numRows, 0);
    }
    checkIfHasHeaderReadOptionIsAvailable();
}
function addColumn(selectNewColumn = true) {
    const numCols = hot.countCols();
    hot.alter('insert_col', numCols);
    checkIfHasHeaderReadOptionIsAvailable();
    const pos = hot.getSelected();
    if (pos && pos.length === 1) {
        if (selectNewColumn) {
            hot.selectCell(pos[0][0], numCols);
        }
    }
    _resizeMergedColumns();
}
function _resizeMergedColumns() {
    if (typeof hot.getSettings().mergeCells === 'boolean' || !hot.getSettings().mergeCells)
        return;
    const mergedCells = hot.getSettings().mergeCells;
    const numCols = hot.countCols();
    for (let i = 0; i < mergedCells.length; i++) {
        const mergedCell = mergedCells[i];
        mergedCell.colspan = numCols;
    }
    hot.updateSettings({
        mergeCells: mergedCells
    }, false);
}
function _setOption(targetOptions, options, optionName) {
    if (options.hasOwnProperty(optionName)) {
        if (targetOptions.hasOwnProperty(optionName) === false) {
            _error(`target options object has not property '${optionName}'`);
            return;
        }
        targetOptions[optionName] = options[optionName];
    }
    else {
        _error(`options object has not property '${optionName}'`);
    }
}
function setCsvReadOptionsInitial(options) {
    const keys = Object.keys(defaultCsvReadOptions);
    for (const key of keys) {
        _setOption(defaultCsvReadOptions, options, key);
    }
    const el1 = _getById('delimiter-string');
    el1.value = defaultCsvReadOptions.delimiter;
    const el3 = _getById('has-header');
    el3.checked = defaultCsvReadOptions._hasHeader;
    const el4 = _getById('comment-string');
    el4.value = defaultCsvReadOptions.comments === false ? '' : defaultCsvReadOptions.comments;
    const el5 = _getById('quote-char-string');
    el5.value = defaultCsvReadOptions.quoteChar;
    const el6 = _getById('escape-char-string');
    el6.value = defaultCsvReadOptions.escapeChar;
}
function setCsvWriteOptionsInitial(options) {
    const keys = Object.keys(defaultCsvWriteOptions);
    for (const key of keys) {
        _setOption(defaultCsvWriteOptions, options, key);
    }
    const el1 = _getById('has-header-write');
    el1.checked = defaultCsvWriteOptions.header;
    const el2 = _getById('delimiter-string-write');
    el2.value = defaultCsvWriteOptions.delimiter;
    const el3 = _getById('comment-string-write');
    el3.value = defaultCsvWriteOptions.comments === false ? '' : defaultCsvWriteOptions.comments;
    const el4 = _getById('quote-char-string-write');
    el4.value = defaultCsvWriteOptions.quoteChar;
    const el5 = _getById('escape-char-string-write');
    el5.value = defaultCsvWriteOptions.quoteChar;
    const el6 = _getById('quote-all-fields-write');
    el6.checked = defaultCsvWriteOptions.quoteAllFields;
}
function checkIfHasHeaderReadOptionIsAvailable() {
    const data = getData();
    const el = _getById('has-header');
    let canSetOption = false;
    if (defaultCsvReadOptions._hasHeader) {
        canSetOption = data.length > 1;
    }
    else {
        canSetOption = data.length > 1;
    }
    if (canSetOption) {
        el.removeAttribute('disabled');
    }
    else {
        el.setAttribute('disabled', '');
        defaultCsvReadOptions._hasHeader = false;
        el.checked = false;
        return false;
    }
    return true;
}
function throttle(func, wait) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    var later = function () {
        previous = Date.now();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout)
            context = args = null;
    };
    return function () {
        var now = Date.now();
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout)
                context = args = null;
        }
        else if (!timeout) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
}
function _error(text) {
    postVsError(text);
    throw new Error(text);
}
function setupAndApplyInitialConfigPart1(initialConfig) {
    if (initialConfig === undefined) {
        toggleReadOptions(true);
        toggleWriteOptions(true);
        togglePreview(true);
        return;
    }
    const copyReadOptions = Object.assign({}, defaultCsvReadOptions);
    setCsvReadOptionsInitial(Object.assign({}, copyReadOptions, { delimiter: initialConfig.readOption_delimiter, comments: initialConfig.readOption_comment, _hasHeader: initialConfig.readOption_hasHeader === 'true' ? true : false, escapeChar: initialConfig.readOption_escapeChar, quoteChar: initialConfig.readOption_quoteChar }));
    const copyWriteOptions = Object.assign({}, defaultCsvReadOptions);
    setCsvWriteOptionsInitial(Object.assign({}, copyWriteOptions, { comments: initialConfig.writeOption_comment, delimiter: initialConfig.writeOption_delimiter, header: initialConfig.writeOption_hasHeader === 'true' ? true : false, escapeChar: initialConfig.writeOption_escapeChar, quoteChar: initialConfig.writeOption_quoteChar, quoteAllFields: initialConfig.quoteAllFields }));
    switch (initialConfig.readOptionsAppearance) {
        case 'expanded': {
            toggleReadOptions(false);
            break;
        }
        case 'collapsed': {
            toggleReadOptions(true);
            break;
        }
        default: {
            _error(`unknown readOptionsAppearance: ${initialConfig.readOptionsAppearance}`);
            break;
        }
    }
    switch (initialConfig.writeOptionsAppearance) {
        case 'expanded': {
            toggleWriteOptions(false);
            break;
        }
        case 'collapsed': {
            toggleWriteOptions(true);
            break;
        }
        default: {
            _error(`unknown writeOptionsAppearance: ${initialConfig.writeOptionsAppearance}`);
            break;
        }
    }
    switch (initialConfig.previewOptionsAppearance) {
        case 'expanded': {
            togglePreview(false);
            break;
        }
        case 'collapsed': {
            togglePreview(true);
            break;
        }
        default: {
            _error(`unknown previewOptionsAppearance: ${initialConfig.previewOptionsAppearance}`);
            break;
        }
    }
}
function _getVsState() {
    if (!vscode)
        return _createDefaultVsState();
    const state = vscode.getState();
    if (!state)
        return _createDefaultVsState();
    return state;
}
function _createDefaultVsState() {
    return {
        previewIsCollapsed: true,
        readOptionIsCollapsed: true,
        writeOptionIsCollapsed: true
    };
}
function _setReadOptionCollapsedVsState(isCollapsed) {
    if (vscode) {
    }
}
function _setWriteOptionCollapsedVsState(isCollapsed) {
    if (vscode) {
    }
}
function _setPreviewCollapsedVsState(isCollapsed) {
    if (vscode) {
    }
}
//# sourceMappingURL=util.js.map