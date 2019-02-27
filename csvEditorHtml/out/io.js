"use strict";
function parseCsv(content, csvReadOptions) {
    if (content === '') {
        content = defaultCsvContentIfEmpty;
    }
    const parseResult = csv.parse(content, Object.assign({}, csvReadOptions, { comments: false }));
    if (parseResult.errors.length === 1 && parseResult.errors[0].type === 'Delimiter' && parseResult.errors[0].code === 'UndetectableDelimiter') {
    }
    else {
        if (parseResult.errors.length > 0) {
            for (let i = 0; i < parseResult.errors.length; i++) {
                const error = parseResult.errors[i];
                if (error.type === 'Delimiter' && error.code === 'UndetectableDelimiter') {
                    continue;
                }
                if (error.row) {
                    _error(`${error.message} on line ${error.row}`);
                    continue;
                }
                _error(`${error.message}`);
            }
            return null;
        }
    }
    defaultCsvWriteOptions.delimiter = parseResult.meta.delimiter;
    newLineFromInput = parseResult.meta.linebreak;
    readDelimiterTooltip.setAttribute('data-tooltip', `${readDelimiterTooltipText} (detected: ${defaultCsvWriteOptions.delimiter})`);
    return parseResult.data;
}
function getData() {
    return hot.getData();
}
function getDataAsCsv(csvReadOptions, csvWriteOptions) {
    const data = getData();
    if (csvWriteOptions.newline === '') {
        csvWriteOptions.newline = newLineFromInput;
    }
    const _conf = Object.assign({}, csvWriteOptions, { quotes: csvWriteOptions.quoteAllFields });
    if (csvWriteOptions.header) {
        const colHeaderCells = hot.getColHeader();
        if (hot.getSettings().colHeaders === defaultColHeaderFunc) {
            data.unshift(colHeaderCells.map((p, index) => getSpreadsheetColumnLabel(index)));
        }
        else {
            data.unshift(colHeaderCells);
        }
    }
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (row[0] === null)
            continue;
        if (typeof csvReadOptions.comments === 'string'
            && typeof csvWriteOptions.comments === 'string'
            && row[0].trim().startsWith(csvReadOptions.comments)) {
            _compressCommentRow(row);
            data[i] = [`${csvWriteOptions.comments}${row.join(" ")}`];
        }
    }
    _conf['skipEmptyLines'] = false;
    let dataAsString = csv.unparse(data, _conf);
    return dataAsString;
}
function _compressCommentRow(row) {
    let delCount = 0;
    for (let i = row.length - 1; i > 0; i--) {
        const cell = row[i];
        if (cell === null || cell === '') {
            delCount++;
            continue;
        }
        break;
    }
    row.splice(row.length - delCount, delCount);
}
function postVsInformation(text) {
    if (!vscode) {
        console.log(`postVsInformation (but in browser)`);
        return;
    }
    vscode.postMessage({
        command: 'msgBox',
        type: 'info',
        content: text
    });
}
function postVsWarning(text) {
    if (!vscode) {
        console.log(`postVsWarning (but in browser)`);
        return;
    }
    vscode.postMessage({
        command: 'msgBox',
        type: 'warn',
        content: text
    });
}
function postVsError(text) {
    if (!vscode) {
        console.log(`postVsError (but in browser)`);
        return;
    }
    vscode.postMessage({
        command: 'msgBox',
        type: 'error',
        content: text
    });
}
function postCopyToClipboard(text) {
    if (!vscode) {
        console.log(`postCopyToClipboard (but in browser)`);
        return;
    }
    vscode.postMessage({
        command: 'copyToClipboard',
        text
    });
}
function postApplyContent(saveSourceFile) {
    const csvContent = getDataAsCsv(defaultCsvReadOptions, defaultCsvWriteOptions);
    if (document.activeElement !== document.body)
        document.activeElement.blur();
    _postApplyContent(csvContent, saveSourceFile);
}
function _postApplyContent(csvContent, saveSourceFile) {
    if (!vscode) {
        console.log(`_postApplyContent (but in browser)`);
        return;
    }
    vscode.postMessage({
        command: 'apply',
        csvContent,
        saveSourceFile
    });
}
function handleVsCodeMessage(event) {
    const message = event.data;
    switch (message.command) {
        case 'csvUpdate': {
            initialContent = message.csvContent;
            resetData(initialContent, defaultCsvReadOptions);
            break;
        }
        case "applyPress": {
            postApplyContent(false);
            break;
        }
        case 'applyAndSavePress': {
            postApplyContent(true);
            break;
        }
        default: {
            _error('received unknown message from vs code');
            break;
        }
    }
}
//# sourceMappingURL=io.js.map