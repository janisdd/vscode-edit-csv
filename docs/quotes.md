# Some notes about quotes and related settings

### Papaparse options

`quoteChar` is used to quote fields. A field has to be quoted if it contains the delimiter, `quoteChar`, `\n`, `\r` a trailing or leading space.

`escapeChar` is used to escape fields. A field has to be escaped if it contains the `quoteChar`. It is escaped by prepended the `escapeChar` `quoteChar`.

Example: 
`escapeChar: +`, `quoteChar:"`
Input: `a"b` 

field contains the quote char -> has to be quoted --> `"a"b"`  
the inner quotes has to be escaped -> `"a+"b"`


### Leading or trainling spaces and quotes

If we have 
```
a,b,c
```

we expect the result to be `a`,`b`,`c`

If we have

```
a, b, c
```

we expect the result to be `a`, ` b`, ` c`  
(b,c have a leading space)

If we have 

```
a, b," c"
```

we expect the same result. The quotes are option but make the space more "visible".

However, if we have 

```
a, b, "c"
```

It is not clear what to expect here...

- the quotes indicate the intend to not have a leading space
- the space between the `,` and the `"` indicate a space

Papaparse chooses to include the leading space, resulting in `a`, ` b`, ` "c"`  
Probably because the csv rfc states: 
>spaces are considered part of a field and should not be ignored.

This also means that the `"` in this field are **not** used to quote the field! (you could imageine swapping the `"` with any other character without special meaning like `@` -> `a`, ` b`, ` @c@`).

The implication is that text like

```
a, b, "c,"
```

will not work because the delimiter inside the `"` is **not** escaped by the quotes.

As there is no *correct* decision here, we are not changing the current behaviour in this case.
