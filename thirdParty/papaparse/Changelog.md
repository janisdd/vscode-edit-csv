# Changelog for papaparse 

We started with version 5.0.0:

```
Papa Parse
v5.0.0
https://github.com/mholt/PapaParse
License: MIT
commit: 49170b76b382317356c2f707e2e4191430b8d495
comment: we need this to support custom comment handling...
```

## running tests

Download papaparse and checkout commit `6107789c6be98ec6dfbd6e0be1fa1e87da6ff46e [6107789]` and replace papaparse.js with our content
Then run yarn test / npm run test

## Changes (latest first)

- fixes issue where all fields quoted and missing closing quote on last field will hang the function guessDelimiter
	- this is because the field in the row will not terminated by the new line because the closing quote is missing (\n is also valid inside multi line fields)
	- in combination with an unknown delimiter (the wrong one) will cause that no quote is accepted as closing quote and we never find a single valid row (after 10 we normally stop guessing)
		- this is because a valid closing quote is followed by the delimiter `"..." DEL` or new line `"..."\n
	- to resolve this we added the config option `isGuessingDelimiter` to the parser and allow a field `maxGuessLength` (default to ~5000) to stop searching for the closing quote
	- also the new line char is not properly recognized if a closing quote is missing because all new line chars are inside quotes (guessLineEndings removes everything in between quotes) -> we never stop at `"..."\n` because we actually could have `"..."\r\n` so after the quote the `\r` follows, not the new line character

- added option to parsing to retain quote information for columns
	- the returned type is now: oldResult & {columnIsQuoted: boolean[] or null if option is not set}
	- the parse option is: retainQuoteInformation: {boolean}

- added parse/unparse option `rowInsertCommentLines_commentsString`
	- used to treat comments as normal 1 cell rows
	- parse: rowInsertCommentLines_commentsString !== null, left trimmed strings starting with it are treated as comments and are parsed into a row with 1 cell
	- unparse: rowInsertCommentLines_commentsString !== null, left trimmed strings first cells will be trimmed left and only the first cell will be exported


## Minified version

minified with https://javascript-minifier.com/