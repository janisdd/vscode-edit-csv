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
function addRow() {
    const numRows = hot.countRows();
    hot.alter('insert_row', numRows);
    hot.selectCell(numRows, 0);
    checkIfHasHeaderReadOptionIsAvailable();
}
function addColumn() {
    const numCols = hot.countCols();
    hot.alter('insert_col', numCols);
    checkIfHasHeaderReadOptionIsAvailable();
    const pos = hot.getSelected();
    if (pos && pos.length === 1) {
        hot.selectCell(pos[0][0], numCols);
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
    const keys = Object.keys(csvReadOptions);
    for (const key of keys) {
        _setOption(csvReadOptions, options, key);
    }
    const el1 = _getById('delimiter-string');
    el1.value = csvReadOptions.delimiter;
    const el3 = _getById('has-header');
    el3.checked = csvReadOptions._hasHeader;
    const el4 = _getById('comment-string');
    el4.value = csvReadOptions.comments === false ? '' : csvReadOptions.comments;
}
function setCsvWriteOptionsInitial(options) {
    const keys = Object.keys(csvWriteOptions);
    for (const key of keys) {
        _setOption(csvWriteOptions, options, key);
    }
    const el1 = _getById('has-header-write');
    el1.checked = csvWriteOptions.header;
    const el2 = _getById('delimiter-string-write');
    el2.value = csvWriteOptions.delimiter;
    const el3 = _getById('comment-string-write');
    el3.value = csvWriteOptions.comments === false ? '' : csvWriteOptions.comments;
}
function readDataAgain(content, csvReadOptions) {
    const _data = parseCsv(content, csvReadOptions);
    displayData(_data);
    onResize();
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
//# sourceMappingURL=util.js.map