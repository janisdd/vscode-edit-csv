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
}
function readDataAgain(content, csvReadOptions) {
    const _data = parseCsv(content, csvReadOptions);
    if (!_data) {
        displayData(_data, [], []);
    }
    else {
        displayData(_data[1], _data[0], _data[2]);
    }
    onResizeGrid();
}
function checkIfHasHeaderReadOptionIsAvailable() {
    const data = getData();
    const canSetOption = data.length > 0;
    const el = _getById('has-header');
    if (canSetOption) {
        el.removeAttribute('disabled');
    }
    else {
        el.setAttribute('disabled', '');
    }
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
        displayOrHideCommentsSections(false);
        toggleReadOptions(true);
        toggleWriteOptions(true);
        togglePreview(true);
        toggleBeforeComments(true);
        toggleAfterComments(true);
        return;
    }
    const copyReadOptions = Object.assign({}, defaultCsvReadOptions);
    setCsvReadOptionsInitial(Object.assign({}, copyReadOptions, { delimiter: initialConfig.readOption_delimiter, comments: initialConfig.readOption_comment, _hasHeader: initialConfig.readOption_hasHeader === 'true' ? true : false }));
    const copyWriteOptions = Object.assign({}, defaultCsvReadOptions);
    setCsvWriteOptionsInitial(Object.assign({}, copyWriteOptions, { comments: initialConfig.writeOption_comment, delimiter: initialConfig.writeOption_delimiter, header: initialConfig.writeOption_hasHeader === 'true' ? true : false }));
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
function setupAndApplyInitialConfigPart2(beforeComments, afterComments, initialConfig) {
    window.addEventListener('message', (event) => {
        handleVsCodeMessage(event);
    });
    if (initialConfig === undefined) {
        return;
    }
    switch (initialConfig.beforeCommentsAppearance) {
        case 'always':
        case 'alwaysExpanded': {
            toggleBeforeComments(initialConfig.beforeCommentsAppearance === 'always');
            break;
        }
        case 'never': {
            toggleBeforeComments(false);
            displayOrHideBeforeComments(true);
            break;
        }
        case 'onlyOnContent':
        case 'onlyOnContentExpanded': {
            toggleBeforeComments(false);
            if (beforeComments.length === 0) {
                displayOrHideBeforeComments(true);
            }
            break;
        }
        default: {
            _error(`unknown beforeCommentsAppearance: ${initialConfig.beforeCommentsAppearance}`);
            break;
        }
    }
    switch (initialConfig.afterCommentsAppearance) {
        case 'always':
        case 'alwaysExpanded': {
            toggleAfterComments(initialConfig.afterCommentsAppearance === 'always');
            break;
        }
        case 'never': {
            toggleAfterComments(false);
            displayOrHideAfterComments(true);
            break;
        }
        case 'onlyOnContent':
        case 'onlyOnContentExpanded': {
            toggleAfterComments(false);
            if (afterComments.length === 0) {
                displayOrHideAfterComments(true);
            }
            break;
        }
        default: {
            _error(`unknown afterCommentsAppearance: ${initialConfig.afterCommentsAppearance}`);
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
        const lastState = _getVsState();
        const newState = Object.assign({}, lastState, { readOptionIsCollapsed: isCollapsed });
    }
}
function _setWriteOptionCollapsedVsState(isCollapsed) {
    if (vscode) {
        const lastState = _getVsState();
        const newState = Object.assign({}, lastState, { writeOptionIsCollapsed: isCollapsed });
    }
}
function _setPreviewCollapsedVsState(isCollapsed) {
    if (vscode) {
        const lastState = _getVsState();
        const newState = Object.assign({}, lastState, { previewIsCollapsed: isCollapsed });
    }
}
//# sourceMappingURL=util.js.map