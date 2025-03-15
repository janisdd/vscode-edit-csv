export type FieldPosition = {
    start: number;
    end: number;
};
export type ParseConfigAll = {
    /**
     * empty for auto-detect
     */
    delimiter: '' | string;
    /**
     * empty for auto-detect
     */
    newline: '' | '\r' | '\n' | '\r\n';
    /**
     * when a cell starts with this string, it is treated as a comment and the row is ignored
     *
     * if you want to include comment rows in the parse result, use {@link rowInsertCommentLines_commentsString} and set this to null
     */
    comments: string | null;
    /**
     * used to treat comments as normal 1 cell rows
     * - parse: rowInsertCommentLines_commentsString !== null, left trimmed strings starting with it are treated as comments and are parsed into a row with 1 cell
     * - unparse: rowInsertCommentLines_commentsString !== null, left trimmed strings first cells will be trimmed left and only the first cell will be exported
     */
    rowInsertCommentLines_commentsString: string | null;
    /**
     * if a field should contain the delimiter but as data and not as delimiter, it must be quoted
     */
    quoteChar: string;
    /**
     * quotes are normally ignored as they don't change the resulting data
     * but for some applications we need to know if a cell was quoted
     * true: the result will contain the information if a cell was quoted or not
     * see {@link ParseResult.columnIsQuoted} and {@link ParseResult.cellIsQuotedInfo}
     * false: information will be null
     */
    retainQuoteInformation: boolean;
    /**
     * if a field should contain the quoteChar but as data and not as quoteChar, it must be escaped
     * empty to use quote char
     */
    escapeChar: '' | string;
    /**
     * f true, lines that are completely empty (those which evaluate to an empty string) will be skipped. If set to 'greedy',
     * lines that evaluate to empty strings after processing will also be skipped.
     */
    skipEmptyLines: boolean | 'greedy';
    delimitersToGuess: string[];
    /**
     * the max number of characters of the input to guess the delimiter
     */
    maxDelimiterGuessLength: number;
    /**
     * If > 0, only that many rows will be parsed.
     * null or <= 0 to not use preview
     */
    previewInRows: number | null;
    calcLineIndexToCsvLineIndexMapping: boolean;
    calcColumnIndexToCsvColumnIndexMapping: boolean;
    calcCsvFieldToInputPositionMapping: boolean;
};
export type ParseConfig = Partial<ParseConfigAll>;
export type ParseResult = {
    data: string[][];
    errors: ParseError[];
    /**
     * meta information about the parsing
     */
    meta: ParseResultMeta;
};
export interface ParseResultMeta {
    /**
     * Delimiter used
     */
    delimiter: string;
    /**
     * Line break sequence used
     */
    linebreak: string;
    cursor: number;
    /**
     * when {@link ParseConfigAll.retainQuoteInformation} is set to true, this array contains the information if a column was quoted or not
     * a column is quoted if the first cell of the column was quoted
     *
     * @deprecated
     * this is more a legacy feature, use {@link cellIsQuotedInfo} instead
     */
    columnIsQuoted: boolean[] | null;
    /**
     * when {@link ParseConfigAll.retainQuoteInformation} is set to true, this array contains the information if a cell was quoted or not
     */
    cellIsQuotedInfo: boolean[][] | null;
    /**
     * for each line index in the input text the csv line index it refers to
     */
    outLineIndexToCsvLineIndexMapping: number[] | null;
    outColumnIndexToCsvColumnIndexMapping: number[][] | null;
    outCsvFieldToInputPositionMapping: FieldPosition[][] | null;
}
export interface ParseError {
    /**
     * A generalization of the error
     */
    type: string;
    /**
     * Standardized error code
     */
    code: string;
    /**
     * Human-readable details
     */
    message: string;
    /**
     * Row index of parsed data where error is
     */
    row?: number;
    /**
     * column index (cursor position) of the error
     */
    index?: number;
}
export type UnparseResult = {
    csv: string;
    /**
     * meta information about the unparsing
     */
    meta: UnparseResultMeta;
};
export interface UnparseResultMeta {
    outCsvFieldToInputPositionMapping: FieldPosition[][] | null;
}
export type UnparseConfigAll = {
    delimiter: string;
    newline: string;
    quoteChar: string;
    /**
     * empty to use quote char
     */
    escapeChar: '' | string;
    skipEmptyLines: boolean | 'greedy';
    /**
     * If true, forces all fields to be enclosed in quotes.
     * If an array of true/false values, specifies which fields should be force-quoted (first boolean is for the first column, second boolean for the second column, ...)
     *
     * @note
     * old version used option columnIsQuoted for the array but we changed it back to one option
     */
    quotes: boolean | boolean[];
    /**
     * true: quote empty/null/undefined fields
     */
    quoteEmptyOrNullFields: boolean;
    quoteLeadingSpace: boolean;
    quoteTrailingSpace: boolean;
    determineFieldHasQuotesFunc?: ((field: string, row: number, col: number) => boolean);
    /**
     * see {@link ParseConfigAll.rowInsertCommentLines_commentsString}
     */
    rowInsertCommentLines_commentsString: string | null;
    calcCsvFieldToInputPositionMapping: boolean;
};
export type UnparseConfig = Partial<UnparseConfigAll>;
/**
 * some options might be unset or will bet auto-detected,
 * this is the effective configuration
 */
export interface ParseConfigEffective extends ParseConfigAll {
    delimiter: string;
    newline: '\r' | '\n' | '\r\n';
    comments: string;
    previewInRows: number;
}
/**
 * only exports to inspect defaults
 */
export declare const __parseConfigUserDefaults: ParseConfigAll;
/**
 * only exports to inspect defaults
 */
export declare const __unparseConfigUserDefaults: UnparseConfigAll;
export declare class Papa {
    static RECORD_SEP: string;
    static UNIT_SEP: string;
    static BYTE_ORDER_MARK: string;
    static BAD_DELIMITERS: string[];
    static NEED_QUOTES_CHARS: string[];
    static DefaultDelimiter: string;
    static DefaultQuoteChar: string;
    static DefaultEscapeChar: string;
    static parse(input: string, _config?: ParseConfig): ParseResult;
    static unparse(data: Array<Array<string | null | undefined>>, _config?: UnparseConfig): UnparseResult;
}
export declare class Parser {
    _config: ParseConfigEffective;
    _input: string;
    _quoteSearch: number;
    _nextNewline: number;
    _cursor: number;
    _lastCursor: number;
    _data: string[][];
    _row: string[];
    _errors: ParseError[];
    _delim: string;
    _quoteChar: string;
    _newlineString: string;
    _inputLen: number;
    _escapeChar: string;
    _previewInRows: number;
    _firstQuoteInformationRowFound: boolean;
    _maxGuessLength: number;
    _isGuessingDelimiter: boolean;
    /**
     * normally when parsing quotes are discarded as they don't change the retrieved data
     * true: collect information about quotes (cells, columns)
     * false: do not collect quote information
     * see {@link _columnIsQuoted}, {@link _cellIsQuotedInfo}
     *
     * NOTE: if false -> we keep the arrays empty and in post-processing we set them to null (not here)
     *
     *
     * to determine if a column is quoted we use the first cell only (if a column has no cells then it's not quoted)
     * so if the first line has only 3 columns and all other more than 3 (e.g. 4) then all columns starting from 4 are treated as not quoted!!
     * not that there is no difference if we have column headers (first row is used)
     * comment rows are ignored for this
     */
    _retainQuoteInformation: boolean;
    _columnIsQuoted: boolean[];
    /** @type {boolean[][]} for each cell the info if it was quoted originally */
    _cellIsQuotedInfo: boolean[][];
    _cellIsQuotedInfoRow: boolean[];
    _currentRowStartIndex: number;
    _comments: string;
    _rowInsertCommentLines_commentsString: string | null;
    _outColumnIndexToCsvColumnIndexMapping: number[][] | null;
    _currSingleRowColumnIndexToCsvColumnIndexMapping: number[];
    _outFieldPositionMapping: Array<Array<FieldPosition>> | null;
    _currentRowFieldPositions: Array<FieldPosition>;
    _fieldStart: number;
    constructor(config: ParseConfigEffective, isGuessingDelimiter: boolean);
    parse(input: string): ParseResult;
    pushRow(row: string[]): void;
    /**
     * adds the given index to the column mapping if we still calculate it
     * @param cumulativeColumnIndex
     */
    addColumnIndexMapping(cumulativeColumnIndex: number): void;
    /**
     * Appends the remaining input from cursor to the end into
     * row, saves the row, calls step, and returns the results.
     */
    finish(value?: string): ParseResult;
    /**
     * Appends the current row to the results. It sets the cursor
     * to newCursor and finds the nextNewline. The caller should
     * take care to execute user's step function and check for
     * preview and end parsing if necessary.
     */
    saveRow(newCursor: number): void;
    /** Returns an object with the results, errors, and meta. */
    returnable(): ParseResult;
    /** Gets the delimiter character, which is not inside the quoted field */
    getNextUnqotedDelimiter(nextDelim: number, quoteSearch: number, nextNewline: number): {
        nextDelim: number | null;
        quoteSearch: number | null;
    };
    /**
     * checks if there are extra spaces after closing quote and given index without any text
     * if Yes, returns the number of spaces
     */
    extraSpaces(index: number): number;
    private addFieldPosition;
}
