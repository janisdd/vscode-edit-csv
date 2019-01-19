"use strict";
function getData() {
    return hot.getData();
}
function getDataAsCsv(csvWriteOptions) {
    const data = getData();
    if (csvWriteOptions.newline === '') {
        csvWriteOptions.newline = newLineFromInput;
    }
    if (csvWriteOptions.header) {
        const colHeaderCells = hot.getColHeader();
        if (hot.getSettings().colHeaders === defaultColHeaderFunc) {
            data.unshift(colHeaderCells.map((p, index) => getSpreadsheetColumnLabel(index)));
        }
        else {
            data.unshift(colHeaderCells);
        }
    }
    let dataAsString = csv.unparse(data, csvWriteOptions);
    if (csvWriteOptions.comments) {
        if (commentLinesBefore.length > 0) {
            dataAsString = commentLinesBefore.map(p => csvWriteOptions.comments + p).join(csvWriteOptions.newline) + csvWriteOptions.newline + dataAsString;
        }
        if (commentLinesAfter.length > 0) {
            dataAsString = dataAsString + csvWriteOptions.newline + commentLinesAfter.map(p => csvWriteOptions.comments + p).join(csvWriteOptions.newline);
        }
    }
    return dataAsString;
}
function parseCsv(content, csvReadOptions) {
    if (content === '') {
        content = defaultCsvContentIfEmpty;
    }
    const parseResult = csv.parse(content, Object.assign({}, csvReadOptions, { comments: csvReadOptions.comments === false ? '' : csvReadOptions.comments }));
    if (parseResult.errors.length > 0) {
        for (let i = 0; i < parseResult.errors.length; i++) {
            const error = parseResult.errors[i];
            if (error.row) {
                _error(`${error.message} on line ${error.row}`);
                continue;
            }
            _error(`${error.message}`);
        }
        return null;
    }
    csvWriteOptions.delimiter = parseResult.meta.delimiter;
    newLineFromInput = parseResult.meta.linebreak;
    if (csvReadOptions.comments) {
        commentLinesBefore = [];
        commentLinesAfter = [];
        let lines = content.split(newLineFromInput);
        let inBeforeLineRange = true;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (inBeforeLineRange) {
                if (line.startsWith(csvReadOptions.comments)) {
                    commentLinesBefore.push(line.substring(csvReadOptions.comments.length));
                    continue;
                }
                if (line === '') {
                    continue;
                }
                inBeforeLineRange = false;
            }
            else {
                if (line.startsWith(csvReadOptions.comments)) {
                    commentLinesAfter.push(line.substring(csvReadOptions.comments.length));
                    continue;
                }
            }
        }
    }
    return parseResult.data;
}
function postVsError(text) {
    if (!vscode)
        return;
    vscode.postMessage({
        command: 'error',
        content: text
    });
}
function postOverwriteFile(csvContent) {
    if (!vscode)
        return;
    vscode.postMessage({
        command: 'overwrite',
        csvContent
    });
}
function handleVsCodeMessage(event) {
    const message = event.data;
    switch (message.command) {
        case 'csvUpdate': {
            initialContent = message.csvContent;
            readDataAgain(initialContent, csvReadOptions);
            break;
        }
        case 'message': {
            break;
        }
        default: {
            _error('received unknown message from vs code');
            break;
        }
    }
}
//# sourceMappingURL=io.js.map