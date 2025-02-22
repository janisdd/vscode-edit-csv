(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.papaparse = {}));
})(this, function(exports2) {
  "use strict";
  /* @license
  Papa Parse
  v5.0.0-custom-2.0.0
  https://github.com/mholt/PapaParse
  License: MIT
  commit: 49170b76b382317356c2f707e2e4191430b8d495
  fork -> https://github.com/janisdd/PapaParse/tree/fix609_main
  */
  const __parseConfigUserDefaults = {
    delimiter: "",
    newline: "",
    comments: null,
    quoteChar: '"',
    retainQuoteInformation: false,
    escapeChar: "",
    skipEmptyLines: false,
    delimitersToGuess: [",", "	", "|", ";", String.fromCharCode(30), String.fromCharCode(31)],
    maxDelimiterGuessLength: 5e3,
    previewInRows: null,
    rowInsertCommentLines_commentsString: null,
    calcColumnIndexToCsvColumnIndexMapping: false,
    calcLineIndexToCsvLineIndexMapping: false,
    calcCsvFieldToInputPositionMapping: false
  };
  const __unparseConfigUserDefaults = {
    delimiter: ",",
    newlineChar: "\r\n",
    quoteChar: '"',
    escapeChar: "",
    //empty to use quote char
    skipEmptyLines: false,
    quotes: false,
    quoteEmptyOrNullFields: false,
    quoteLeadingSpace: true,
    quoteTrailingSpace: true,
    determineFieldHasQuotesFunc: void 0,
    rowInsertCommentLines_commentsString: null
  };
  const _Papa = class _Papa {
    static parse(input, _config) {
      const _realConfig = {
        ...__parseConfigUserDefaults,
        ..._config
      };
      const _handle = new ParserHandle(input, _realConfig);
      const results = _handle.parse(input);
      return results;
    }
    static unparse(data, _config) {
      const _realConfig = {
        ...__unparseConfigUserDefaults,
        ..._config
      };
      const unparser = new UnParser(_realConfig);
      const csv = unparser.unparse(data);
      return csv;
    }
  };
  _Papa.RECORD_SEP = String.fromCharCode(30);
  _Papa.UNIT_SEP = String.fromCharCode(31);
  _Papa.BYTE_ORDER_MARK = "\uFEFF";
  _Papa.BAD_DELIMITERS = ["\r", "\n", '"', "\uFEFF"];
  _Papa.NEED_QUOTES_CHARS = ["\r", "\n"];
  _Papa.DefaultDelimiter = ",";
  _Papa.DefaultQuoteChar = '"';
  _Papa.DefaultEscapeChar = '"';
  let Papa = _Papa;
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  class ParserHandle {
    constructor(input, _config) {
      this.input = input;
      let newLine = _config.newline;
      if (!newLine) {
        newLine = this._guessLineEndings(input, _config.quoteChar);
      }
      const comments = _config.comments ?? "";
      this._delimiterError = false;
      let usedDelimiter = _config.delimiter;
      if (!_config.delimiter) {
        const skipEmptyLines = _config.skipEmptyLines === "greedy" || _config.skipEmptyLines;
        const delimGuess = this._guessDelimiter(
          input,
          newLine,
          skipEmptyLines,
          comments,
          _config.delimitersToGuess
        );
        if (delimGuess.successful && delimGuess.bestDelimiter) {
          usedDelimiter = delimGuess.bestDelimiter;
        } else {
          this._delimiterError = true;
          usedDelimiter = Papa.DefaultDelimiter;
        }
      }
      this._effectiveConfig = {
        ..._config,
        newline: newLine,
        previewInRows: _config.previewInRows ?? 0,
        comments,
        delimiter: usedDelimiter
      };
      if (this._effectiveConfig.previewInRows < 0) {
        this._effectiveConfig.previewInRows = 0;
      }
      this._isGreedySkipEmptyLines = this._effectiveConfig.skipEmptyLines === "greedy";
    }
    parse(input) {
      const _parser = new Parser(this._effectiveConfig, false);
      const result = _parser.parse(input);
      if (!this._effectiveConfig.retainQuoteInformation) {
        result.meta.columnIsQuoted = null;
        result.meta.cellIsQuotedInfo = null;
      }
      this._processResults(result, this._delimiterError);
      return result;
    }
    _processResults(result, hasDelimiterError) {
      if (result && hasDelimiterError) {
        this._addError(result, "Delimiter", "UndetectableDelimiter", "Unable to auto-detect delimiting character; defaulted to '" + Papa.DefaultDelimiter + "'");
      }
      if (this._effectiveConfig.calcLineIndexToCsvLineIndexMapping) {
        const outLineIndexToCsvLineIndexMapping = [];
        let currentCsvLineIndex = 0;
        let lastRealCsvLineIndex = 0;
        for (let i = 0; i < result.data.length; i++) {
          const csvLine = result.data[i];
          for (let j = 0; j < csvLine.length; j++) {
            const csvField = csvLine[j];
            const newLinesCount = csvField.split(this._effectiveConfig.newline).length - 1;
            for (let k = 0; k < newLinesCount; k++) {
              outLineIndexToCsvLineIndexMapping.push(currentCsvLineIndex);
            }
          }
          outLineIndexToCsvLineIndexMapping.push(currentCsvLineIndex);
          if (this._effectiveConfig.skipEmptyLines && ParserHandle._testEmptyLine(csvLine, this._isGreedySkipEmptyLines)) ;
          else {
            lastRealCsvLineIndex = currentCsvLineIndex;
            currentCsvLineIndex++;
          }
        }
        if (result.data.length > 0 && this._effectiveConfig.skipEmptyLines) {
          let correctingLineIndexIndex = outLineIndexToCsvLineIndexMapping.length - 1;
          for (let m = result.data.length - 1; m >= 0; m--) {
            const _csvLine = result.data[m];
            if (ParserHandle._testEmptyLine(_csvLine, this._isGreedySkipEmptyLines)) {
              outLineIndexToCsvLineIndexMapping[correctingLineIndexIndex] = lastRealCsvLineIndex;
              correctingLineIndexIndex--;
            } else {
              break;
            }
          }
        }
        result.meta.outLineIndexToCsvLineIndexMapping = outLineIndexToCsvLineIndexMapping;
      }
      if (this._effectiveConfig.skipEmptyLines) {
        const filterData = result.data.map((row) => !ParserHandle._testEmptyLine(row, this._isGreedySkipEmptyLines));
        result.data = result.data.filter((d, i) => filterData[i]);
        if (result.meta.cellIsQuotedInfo) {
          result.meta.cellIsQuotedInfo = result.meta.cellIsQuotedInfo.filter((d, i) => filterData[i]);
        }
      }
    }
    _guessDelimiter(input, newline, skipEmptyLines, comments, delimitersToGuess) {
      let bestDelim = null;
      let bestDelta = null;
      let maxFieldCount = null;
      for (let i = 0; i < delimitersToGuess.length; i++) {
        const delim = delimitersToGuess[i];
        let delta = 0;
        let avgFieldCount = 0;
        let emptyLinesCount = 0;
        let fieldCountPrevRow = null;
        const configForGuessing = {
          ...this._effectiveConfig,
          comments,
          delimiter: delim,
          newline,
          previewInRows: 10,
          calcColumnIndexToCsvColumnIndexMapping: false,
          calcLineIndexToCsvLineIndexMapping: false,
          calcCsvFieldToInputPositionMapping: false,
          retainQuoteInformation: false
        };
        const parserForGuessing = new Parser(configForGuessing, true);
        const preview = parserForGuessing.parse(input);
        for (let j = 0; j < preview.data.length; j++) {
          if (skipEmptyLines && ParserHandle._testEmptyLine(preview.data[j], this._isGreedySkipEmptyLines)) {
            emptyLinesCount++;
            continue;
          }
          const fieldCount = preview.data[j].length;
          avgFieldCount += fieldCount;
          if (fieldCountPrevRow === null) {
            fieldCountPrevRow = fieldCount;
            continue;
          } else if (fieldCount > 0) {
            delta += Math.abs(fieldCount - fieldCountPrevRow);
            fieldCountPrevRow = fieldCount;
          }
        }
        if (preview.data.length > 0) {
          avgFieldCount /= preview.data.length - emptyLinesCount;
        }
        if ((bestDelta === null || delta <= bestDelta) && (maxFieldCount === null || avgFieldCount > maxFieldCount) && avgFieldCount > 1.99) {
          bestDelta = delta;
          bestDelim = delim;
          maxFieldCount = avgFieldCount;
        }
      }
      return {
        successful: bestDelim !== null,
        bestDelimiter: bestDelim
      };
    }
    //this does not play nice with unmatched quotes on the last field (because all new lines are removed by the regex)
    //the regex works but maybe it should be ([^*]*?)?
    _guessLineEndings(input, quoteChar) {
      input = input.substr(0, 1024 * 1024);
      const re = new RegExp(escapeRegExp(quoteChar) + "([^]*?)" + escapeRegExp(quoteChar), "gm");
      input = input.replace(re, "");
      const r = input.split("\r");
      const n = input.split("\n");
      const nAppearsFirst = n.length > 1 && n[0].length < r[0].length;
      if (r.length === 1 || nAppearsFirst) {
        return "\n";
      }
      let numWithN = 0;
      for (let i = 0; i < r.length; i++) {
        if (r[i][0] === "\n") {
          numWithN++;
        }
      }
      return numWithN >= r.length / 2 ? "\r\n" : "\r";
    }
    _addError(result, type, code, msg, row) {
      result.errors.push({
        type,
        code,
        message: msg,
        row
      });
    }
    /**
     * tests if a line is considered empty
     *
     * skipEmptyLines:
     * If true, lines that are completely empty (those which evaluate to an empty string) will be skipped. empty lines do not have a delimiter, thus only one cell
     * If set to 'greedy', lines that don't have any content (those which have only whitespace after parsing) will also be skipped.
     */
    static _testEmptyLine(line, greedy) {
      return greedy ? line.join("").trim() === "" : line.length === 1 && (line[0] === null || line[0] === void 0 || line[0].length === 0);
    }
  }
  class Parser {
    constructor(config, isGuessingDelimiter) {
      this._currentRowFieldPositions = [];
      this._fieldStart = 0;
      this._input = "";
      this._inputLen = -1;
      this._config = config;
      this._quoteSearch = -1;
      this._nextNewline = -1;
      this._cursor = 0;
      this._lastCursor = -1;
      this._data = [];
      this._row = [];
      this._errors = [];
      this._delim = config.delimiter;
      this._newlineString = config.newline;
      this._quoteChar = config.quoteChar;
      this._previewInRows = config.previewInRows;
      this._firstQuoteInformationRowFound = false;
      this._currentRowStartIndex = 0;
      this._isGuessingDelimiter = isGuessingDelimiter;
      this._retainQuoteInformation = config.retainQuoteInformation;
      this._maxGuessLength = config.maxDelimiterGuessLength;
      this._comments = config.comments;
      this._rowInsertCommentLines_commentsString = config.rowInsertCommentLines_commentsString;
      this._columnIsQuoted = [];
      this._cellIsQuotedInfo = [];
      this._currSingleRowColumnIndexToCsvColumnIndexMapping = [];
      this._outColumnIndexToCsvColumnIndexMapping = config.calcColumnIndexToCsvColumnIndexMapping ? [] : null;
      this._outFieldPositionMapping = config.calcCsvFieldToInputPositionMapping ? [] : null;
      this._cellIsQuotedInfoRow = [];
      if (!this._quoteChar) {
        this._quoteChar = Papa.DefaultQuoteChar;
      }
      this._escapeChar = config.escapeChar ? config.escapeChar : this._quoteChar;
      if (Papa.BAD_DELIMITERS.indexOf(this._delim) > -1) {
        this._delim = Papa.DefaultDelimiter;
      }
      if (this._comments === this._delim) {
        throw new Error("Comment character same as delimiter");
      } else if (Papa.BAD_DELIMITERS.indexOf(this._comments) > -1) {
        this._comments = "";
      }
      if (this._newlineString !== "\n" && this._newlineString !== "\r" && this._newlineString !== "\r\n") {
        this._newlineString = "\n";
      }
    }
    parse(input) {
      this._input = input;
      this._inputLen = input.length;
      const _config = this._config;
      const delimLen = _config.delimiter.length;
      const newlineLen = _config.newline.length;
      const commentsLen = _config.comments.length;
      if (!input) {
        return this.returnable();
      }
      if (input.indexOf(this._quoteChar) === -1) {
        const rows = input.split(this._newlineString);
        let rowString = "";
        for (let i = 0; i < rows.length; i++) {
          const rowStart = this._cursor;
          rowString = rows[i];
          const isCommentRow = this._rowInsertCommentLines_commentsString && rowString.startsWith(this._rowInsertCommentLines_commentsString);
          let _row = null;
          this._cursor += rowString.length;
          if (i !== rows.length - 1) {
            this._cursor += this._newlineString.length;
          }
          if (this._comments && rowString.substr(0, commentsLen) === this._comments && !isCommentRow) {
            continue;
          }
          _row = !isCommentRow ? rowString.split(this._delim) : [rowString];
          if (this._retainQuoteInformation && this._firstQuoteInformationRowFound === false) {
            this._columnIsQuoted = Array(_row.length).fill(false);
          }
          if (this._outColumnIndexToCsvColumnIndexMapping) {
            if (isCommentRow) {
              this._currSingleRowColumnIndexToCsvColumnIndexMapping.push(rowString.length - 1);
            } else {
              let _cummulativeLength = 0;
              _row.forEach((value, index) => {
                if (index !== _row.length - 1) {
                  _cummulativeLength += value.length + delimLen;
                } else {
                  _cummulativeLength += value.length;
                }
                this._currSingleRowColumnIndexToCsvColumnIndexMapping.push(_cummulativeLength - 1);
              });
            }
          }
          if (!this._isGuessingDelimiter && this._outFieldPositionMapping) {
            this._currentRowFieldPositions = [];
            let currFieldStart = rowStart;
            for (let j = 0; j < _row.length; j++) {
              this._currentRowFieldPositions.push({
                start: currFieldStart,
                end: currFieldStart + _row[j].length
              });
              currFieldStart += _row[j].length + delimLen;
            }
          }
          this.pushRow(_row);
          if (this._previewInRows > 0 && this._previewInRows <= i) {
            this._data = this._data.slice(0, this._previewInRows);
            return this.returnable();
          }
        }
        if (!this._isGuessingDelimiter && this._retainQuoteInformation) {
          this._cellIsQuotedInfo = Array(this._data.length);
          for (let rowI = 0; rowI < this._data.length; rowI++) {
            const cells = this._data[rowI];
            this._cellIsQuotedInfo[rowI] = Array(cells.length).fill(false);
          }
        }
        return this.returnable();
      }
      let nextDelim = input.indexOf(this._delim, this._cursor);
      this._nextNewline = input.indexOf(this._newlineString, this._cursor);
      const quoteCharRegex = new RegExp(escapeRegExp(this._escapeChar) + escapeRegExp(this._quoteChar), "g");
      this._quoteSearch = input.indexOf(this._quoteChar, this._cursor);
      this._columnIsQuoted = [];
      this._cellIsQuotedInfo = [];
      this._cellIsQuotedInfoRow = [];
      let currentFieldEndIndex = -1;
      if (this._isGuessingDelimiter && nextDelim === -1 && this._cursor === 0) {
        return this.finish("");
      }
      for (; ; ) {
        this._fieldStart = this._cursor;
        if (input[this._cursor] === this._quoteChar) {
          this._quoteSearch = this._cursor;
          if (this._retainQuoteInformation) {
            if (this._firstQuoteInformationRowFound === false) {
              this._columnIsQuoted.push(true);
            }
            this._cellIsQuotedInfoRow.push(true);
          }
          this._cursor++;
          for (; ; ) {
            this._quoteSearch = input.indexOf(this._quoteChar, this._quoteSearch + 1);
            if (this._isGuessingDelimiter && this._maxGuessLength && this._quoteSearch > this._maxGuessLength) {
              return this.finish("");
            }
            if (this._quoteSearch === -1) {
              this._errors.push({
                type: "Quotes",
                code: "MissingQuotes",
                message: "Quoted field unterminated",
                row: this._data.length,
                // row has yet to be inserted
                index: this._cursor
              });
              const fieldEnd = this._nextNewline === -1 ? this._inputLen : this._nextNewline + 1;
              this.addFieldPosition(this._fieldStart, fieldEnd);
              if (this._nextNewline === -1) {
                this.addColumnIndexMapping(this._inputLen - 1);
              } else {
                this.addColumnIndexMapping(this._nextNewline - 1);
              }
              return this.finish();
            }
            if (this._quoteSearch === this._inputLen - 1) {
              const value = input.substring(this._cursor, this._quoteSearch).replace(quoteCharRegex, this._quoteChar);
              const fieldEnd = this._quoteSearch + 1;
              this.addFieldPosition(this._fieldStart, fieldEnd);
              currentFieldEndIndex = this._quoteSearch;
              this.addColumnIndexMapping(currentFieldEndIndex);
              return this.finish(value);
            }
            if (this._quoteChar === this._escapeChar && input[this._quoteSearch + 1] === this._escapeChar) {
              this._quoteSearch++;
              continue;
            }
            if (this._quoteChar !== this._escapeChar && this._quoteSearch !== 0 && input[this._quoteSearch - 1] === this._escapeChar) {
              continue;
            }
            if (nextDelim !== -1 && nextDelim < this._quoteSearch + 1) {
              nextDelim = input.indexOf(this._delim, this._quoteSearch + 1);
            }
            if (this._nextNewline !== -1 && this._nextNewline < this._quoteSearch + 1) {
              this._nextNewline = input.indexOf(this._newlineString, this._quoteSearch + 1);
            }
            const checkUpTo = this._nextNewline === -1 ? nextDelim : Math.min(nextDelim, this._nextNewline);
            const spacesBetweenQuoteAndDelimiter = this.extraSpaces(checkUpTo);
            if (input.substr(this._quoteSearch + 1 + spacesBetweenQuoteAndDelimiter, delimLen) === this._delim) {
              currentFieldEndIndex = this._quoteSearch + spacesBetweenQuoteAndDelimiter + delimLen;
              this.addColumnIndexMapping(currentFieldEndIndex);
              this.addFieldPosition(this._fieldStart, currentFieldEndIndex + 1 - delimLen);
              this._row.push(input.substring(this._cursor, this._quoteSearch).replace(quoteCharRegex, this._quoteChar));
              this._cursor = this._quoteSearch + 1 + spacesBetweenQuoteAndDelimiter + delimLen;
              if (input[this._quoteSearch + 1 + spacesBetweenQuoteAndDelimiter + delimLen] !== this._quoteChar) {
                this._quoteSearch = input.indexOf(this._quoteChar, this._cursor);
              }
              nextDelim = input.indexOf(this._delim, this._cursor);
              this._nextNewline = input.indexOf(this._newlineString, this._cursor);
              break;
            }
            const spacesBetweenQuoteAndNewLine = this.extraSpaces(this._nextNewline);
            if (input.substr(this._quoteSearch + 1 + spacesBetweenQuoteAndNewLine, newlineLen) === this._newlineString) {
              currentFieldEndIndex = this._quoteSearch + spacesBetweenQuoteAndNewLine;
              this.addColumnIndexMapping(currentFieldEndIndex);
              this.addFieldPosition(this._fieldStart, currentFieldEndIndex + 1);
              this._row.push(input.substring(this._cursor, this._quoteSearch).replace(quoteCharRegex, this._quoteChar));
              this.saveRow(this._quoteSearch + 1 + spacesBetweenQuoteAndNewLine + newlineLen);
              nextDelim = input.indexOf(this._delim, this._cursor);
              this._quoteSearch = input.indexOf(this._quoteChar, this._cursor);
              if (this._previewInRows > 0 && this._data.length >= this._previewInRows) {
                return this.returnable();
              }
              break;
            }
            this._errors.push({
              type: "Quotes",
              code: "InvalidQuotes",
              message: "Trailing quote on quoted field is malformed",
              row: this._data.length,
              // row has yet to be inserted
              index: this._cursor
            });
            this._quoteSearch++;
            continue;
          }
          continue;
        }
        if (this._retainQuoteInformation) {
          this._cellIsQuotedInfoRow.push(false);
        }
        if (this._comments && !this._rowInsertCommentLines_commentsString && this._row.length === 0 && input.substr(this._cursor, commentsLen) === this._comments) {
          if (this._retainQuoteInformation) {
            this._cellIsQuotedInfoRow = [];
          }
          if (this._nextNewline === -1) {
            return this.returnable();
          }
          this._cursor = this._nextNewline + newlineLen;
          this._nextNewline = input.indexOf(this._newlineString, this._cursor);
          nextDelim = input.indexOf(this._delim, this._cursor);
          continue;
        }
        if (this._retainQuoteInformation) {
          if (this._firstQuoteInformationRowFound === false) {
            this._columnIsQuoted.push(false);
          }
        }
        if (this._row.length === 0 && this._rowInsertCommentLines_commentsString && input.substr(
          this._cursor,
          this._rowInsertCommentLines_commentsString.length
        ) === this._rowInsertCommentLines_commentsString) {
          if (this._nextNewline === -1) {
            currentFieldEndIndex = input.length;
            this.addColumnIndexMapping(currentFieldEndIndex);
            this.addFieldPosition(this._fieldStart, currentFieldEndIndex);
            this._row.push(input.substring(this._cursor));
            this.pushRow(this._row);
            return this.returnable();
          }
          currentFieldEndIndex = this._nextNewline;
          this.addColumnIndexMapping(currentFieldEndIndex);
          this.addFieldPosition(this._fieldStart, currentFieldEndIndex);
          this._row.push(input.substring(this._cursor, this._nextNewline));
          this.saveRow(this._nextNewline + newlineLen);
          nextDelim = input.indexOf(this._delim, this._cursor);
          continue;
        }
        if (nextDelim !== -1 && (nextDelim < this._nextNewline || this._nextNewline === -1)) {
          if (this._quoteSearch > nextDelim) {
            const nextDelimObj = this.getNextUnqotedDelimiter(nextDelim, this._quoteSearch, this._nextNewline);
            if (nextDelimObj.nextDelim !== null && nextDelimObj.quoteSearch !== null) {
              nextDelim = nextDelimObj.nextDelim;
              this._quoteSearch = nextDelimObj.quoteSearch;
              currentFieldEndIndex = nextDelim;
              this.addColumnIndexMapping(currentFieldEndIndex);
              this.addFieldPosition(this._fieldStart, currentFieldEndIndex);
              this._row.push(input.substring(this._cursor, nextDelim));
              this._cursor = nextDelim + delimLen;
              nextDelim = input.indexOf(this._delim, this._cursor);
              continue;
            }
          } else {
            currentFieldEndIndex = nextDelim;
            this.addColumnIndexMapping(currentFieldEndIndex);
            this.addFieldPosition(this._fieldStart, currentFieldEndIndex);
            this._row.push(input.substring(this._cursor, nextDelim));
            this._cursor = nextDelim + delimLen;
            nextDelim = input.indexOf(this._delim, this._cursor);
            continue;
          }
        }
        if (this._nextNewline !== -1) {
          currentFieldEndIndex = this._nextNewline - 1;
          this.addColumnIndexMapping(currentFieldEndIndex);
          this.addFieldPosition(this._fieldStart, currentFieldEndIndex + 1);
          this._row.push(input.substring(this._cursor, this._nextNewline));
          this.saveRow(this._nextNewline + newlineLen);
          if (this._previewInRows && this._data.length >= this._previewInRows) {
            return this.returnable();
          }
          continue;
        }
        break;
      }
      currentFieldEndIndex = input.length - 1;
      this.addColumnIndexMapping(currentFieldEndIndex);
      this.addFieldPosition(this._fieldStart, currentFieldEndIndex + 1);
      return this.finish();
    }
    pushRow(row) {
      this._data.push(row);
      this._lastCursor = this._cursor;
      if (this._outColumnIndexToCsvColumnIndexMapping) {
        this._outColumnIndexToCsvColumnIndexMapping.push(this._currSingleRowColumnIndexToCsvColumnIndexMapping);
        this._currSingleRowColumnIndexToCsvColumnIndexMapping = [];
      }
      this._currentRowStartIndex = this._cursor;
      if (this._retainQuoteInformation) {
        this._cellIsQuotedInfo.push(this._cellIsQuotedInfoRow);
        this._cellIsQuotedInfoRow = [];
      }
      if (this._firstQuoteInformationRowFound === false) {
        if (this._row.length === 1 && (this._row[0] === "" || this._rowInsertCommentLines_commentsString && this._row[0].startsWith(this._rowInsertCommentLines_commentsString))) {
          this._firstQuoteInformationRowFound = false;
          this._columnIsQuoted = [];
        } else {
          this._firstQuoteInformationRowFound = true;
        }
      }
      if (this._outFieldPositionMapping) {
        this._outFieldPositionMapping.push(this._currentRowFieldPositions);
        this._currentRowFieldPositions = [];
      }
    }
    /**
     * adds the given index to the column mapping if we still calculate it
     * @param cumulativeColumnIndex
     */
    addColumnIndexMapping(cumulativeColumnIndex) {
      if (this._outColumnIndexToCsvColumnIndexMapping) {
        this._currSingleRowColumnIndexToCsvColumnIndexMapping.push(cumulativeColumnIndex - this._currentRowStartIndex);
      }
    }
    /**
     * Appends the remaining input from cursor to the end into
     * row, saves the row, calls step, and returns the results.
     */
    finish(value) {
      if (typeof value === "undefined") {
        value = this._input.substr(this._cursor);
      }
      this._row.push(value);
      this._cursor = this._inputLen;
      this.pushRow(this._row);
      return this.returnable();
    }
    /**
     * Appends the current row to the results. It sets the cursor
     * to newCursor and finds the nextNewline. The caller should
     * take care to execute user's step function and check for
     * preview and end parsing if necessary.
     */
    saveRow(newCursor) {
      this._cursor = newCursor;
      this.pushRow(this._row);
      this._row = [];
      this._nextNewline = this._input.indexOf(this._newlineString, this._cursor);
    }
    /** Returns an object with the results, errors, and meta. */
    returnable() {
      const result = {
        data: this._data,
        errors: this._errors,
        meta: {
          delimiter: this._delim,
          linebreak: this._newlineString,
          cursor: this._lastCursor,
          columnIsQuoted: this._columnIsQuoted,
          cellIsQuotedInfo: this._cellIsQuotedInfo,
          outColumnIndexToCsvColumnIndexMapping: this._outColumnIndexToCsvColumnIndexMapping,
          outLineIndexToCsvLineIndexMapping: null,
          //is set in post-processing
          outCsvFieldToInputPositionMapping: this._outFieldPositionMapping
        }
      };
      if (this._outColumnIndexToCsvColumnIndexMapping) {
        result.meta.outColumnIndexToCsvColumnIndexMapping = this._outColumnIndexToCsvColumnIndexMapping;
      }
      return result;
    }
    /** Gets the delimiter character, which is not inside the quoted field */
    getNextUnqotedDelimiter(nextDelim, quoteSearch, nextNewline) {
      let result = {
        nextDelim: null,
        quoteSearch: null
      };
      let nextQuoteSearch = this._input.indexOf(this._quoteChar, quoteSearch + 1);
      if (nextDelim > quoteSearch && nextDelim < nextQuoteSearch && (nextQuoteSearch < nextNewline || nextNewline === -1)) {
        const nextNextDelim = this._input.indexOf(this._delim, nextQuoteSearch);
        if (nextNextDelim === -1) {
          return result;
        }
        if (nextNextDelim > nextQuoteSearch) {
          nextQuoteSearch = this._input.indexOf(this._quoteChar, nextQuoteSearch + 1);
        }
        result = this.getNextUnqotedDelimiter(nextNextDelim, nextQuoteSearch, nextNewline);
      } else {
        result = {
          nextDelim,
          quoteSearch
        };
      }
      return result;
    }
    /**
     * checks if there are extra spaces after closing quote and given index without any text
     * if Yes, returns the number of spaces
     */
    extraSpaces(index) {
      let spaceLength = 0;
      if (index !== -1) {
        const textBetweenClosingQuoteAndIndex = this._input.substring(this._quoteSearch + 1, index);
        if (textBetweenClosingQuoteAndIndex && textBetweenClosingQuoteAndIndex.trim() === "") {
          spaceLength = textBetweenClosingQuoteAndIndex.length;
        }
      }
      return spaceLength;
    }
    // New helper method to record a field's original positions
    addFieldPosition(start, end) {
      this._currentRowFieldPositions.push({
        start,
        end
      });
    }
  }
  class UnParser {
    constructor(_config) {
      this._data = [];
      this._quotes = _config.quotes;
      this._delimiter = _config.delimiter;
      this._newlineChar = _config.newlineChar;
      this._quoteChar = _config.quoteChar;
      this._skipEmptyLines = _config.skipEmptyLines === "greedy" || _config.skipEmptyLines;
      this._isGreedySkipEmptyLines = _config.skipEmptyLines === "greedy";
      this._quoteLeadingSpace = _config.quoteLeadingSpace;
      this._quoteTrailingSpace = _config.quoteTrailingSpace;
      this._determineFieldHasQuotesFunc = _config.determineFieldHasQuotesFunc;
      this._rowInsertCommentLines_commentsString = _config.rowInsertCommentLines_commentsString;
      this._quoteEmptyOrNullFields = _config.quoteEmptyOrNullFields;
      this._quoteCharRegex = new RegExp(escapeRegExp(this._quoteChar), "g");
      this._escapedQuote = _config.escapeChar ? _config.escapeChar + this._quoteChar : this._quoteChar + this._quoteChar;
      if (Papa.BAD_DELIMITERS.some((value) => _config.delimiter.indexOf(value) !== -1)) {
        this._delimiter = Papa.DefaultDelimiter;
      }
    }
    unparse(_data) {
      this._data = _data;
      let csv = "";
      for (let row = 0; row < this._data.length; row++) {
        const maxCol = this._data[row].length;
        let emptyLine = false;
        const nullLine = this._data[row].length === 0;
        if (this._skipEmptyLines) {
          emptyLine = ParserHandle._testEmptyLine(this._data[row], this._isGreedySkipEmptyLines);
        }
        if (!emptyLine) {
          if (this._data[row].length > 0 && this._rowInsertCommentLines_commentsString) {
            const firstCellData = this._data[row][0];
            if (typeof firstCellData === "string" && firstCellData.startsWith(this._rowInsertCommentLines_commentsString)) {
              csv += firstCellData + this._newlineChar;
              continue;
            }
          }
          for (let col = 0; col < maxCol; col++) {
            if (col > 0 && !nullLine) {
              csv += this._delimiter;
            }
            const colIdx = col;
            csv += this.safe(this._data[row][colIdx], row, col);
          }
          if (row < this._data.length - 1 && (!this._skipEmptyLines || maxCol > 0 && !nullLine)) {
            csv += this._newlineChar;
          }
        }
      }
      return csv;
    }
    /** Encloses a value around quotes if needed (makes a value safe for CSV insertion) */
    safe(str, row, col) {
      if (str === "" || str === null || str === void 0) {
        if (this._quoteEmptyOrNullFields) {
          return this._quoteChar + "" + this._quoteChar;
        }
        return "";
      }
      str = str.toString();
      const containsQuotes = str.indexOf(this._quoteChar) > -1;
      str = str.replace(this._quoteCharRegex, this._escapedQuote);
      let _preTestNeedQuotes = false;
      if (this._determineFieldHasQuotesFunc) {
        _preTestNeedQuotes = this._determineFieldHasQuotesFunc(str, row, col);
        if (_preTestNeedQuotes === void 0 || _preTestNeedQuotes === null) {
          _preTestNeedQuotes = false;
        }
      }
      const _quotes_option_is_array = Array.isArray(this._quotes);
      const needsQuotes = !_quotes_option_is_array && this._quotes || _quotes_option_is_array && this._quotes[col] || _preTestNeedQuotes || this._hasAny(str, Papa.NEED_QUOTES_CHARS) || containsQuotes || str.indexOf(this._delimiter) > -1 || this._quoteLeadingSpace && str.charAt(0) === " " || this._quoteTrailingSpace && str.charAt(str.length - 1) === " ";
      return needsQuotes ? this._quoteChar + str + this._quoteChar : str;
    }
    _hasAny(str, substrings) {
      for (let i = 0; i < substrings.length; i++) {
        if (str.indexOf(substrings[i]) > -1) {
          return true;
        }
      }
      return false;
    }
  }
  exports2.Papa = Papa;
  exports2.Parser = Parser;
  exports2.__parseConfigUserDefaults = __parseConfigUserDefaults;
  exports2.__unparseConfigUserDefaults = __unparseConfigUserDefaults;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
});
