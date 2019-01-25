"use strict";
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
    defaultCsvWriteOptions.delimiter = parseResult.meta.delimiter;
    newLineFromInput = parseResult.meta.linebreak;
    const commentLinesBefore = [];
    const commentLinesAfter = [];
    if (csvReadOptions.comments) {
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
    return [
        commentLinesBefore,
        parseResult.data,
        commentLinesAfter
    ];
}
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
        const beforeCommentsTextarea = _getById(beforeCommentsTextareaId);
        const afterCommentsTextarea = _getById(afterCommentsTextareaId);
        const commentLinesBefore = beforeCommentsTextarea.value.length > 0
            ? beforeCommentsTextarea.value.split('\n')
            : [];
        const commentLinesAfter = afterCommentsTextarea.value.length > 0
            ? afterCommentsTextarea.value.split('\n')
            : [];
        if (commentLinesBefore.length > 0) {
            dataAsString = commentLinesBefore.map(p => csvWriteOptions.comments + p).join(csvWriteOptions.newline) + csvWriteOptions.newline + dataAsString;
        }
        if (commentLinesAfter.length > 0) {
            dataAsString = dataAsString + csvWriteOptions.newline + commentLinesAfter.map(p => csvWriteOptions.comments + p).join(csvWriteOptions.newline);
        }
    }
    return dataAsString;
}
function postVsError(text) {
    if (!vscode)
        return;
    vscode.postMessage({
        command: 'error',
        content: text
    });
}
function postCommitContent(saveSourceFile) {
    const csvContent = getDataAsCsv(defaultCsvWriteOptions);
    if (document.activeElement != document.body)
        document.activeElement.blur();
    _posCommitContent(csvContent, saveSourceFile);
}
function _posCommitContent(csvContent, saveSourceFile) {
    if (!vscode)
        return;
    vscode.postMessage({
        command: 'commit',
        csvContent,
        saveSourceFile
    });
}
function handleVsCodeMessage(event) {
    const message = event.data;
    switch (message.command) {
        case 'csvUpdate': {
            initialContent = message.csvContent;
            readDataAgain(initialContent, defaultCsvReadOptions);
            break;
        }
        case 'commitPress': {
            postCommitContent(false);
            break;
        }
        case 'commitAndSavePress': {
            postCommitContent(true);
            break;
        }
        default: {
            _error('received unknown message from vs code');
            break;
        }
    }
}
//# sourceMappingURL=io.js.map