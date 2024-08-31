# Excel like Auto Fill Behavior

I've done my best to replicate Excel's auto-fill from observations....

If possible, the selected values are grouped in consecutive sequences.
These groups are then used to determine the interpolations.

e.g. `2,4,a` will create the groups `2,4` and `a`.
Then `2,4` is used to interpolate the next values (`6,8,10,...`),
while `a` ist just copies over and over

e.g. `2,4,a,01.01.2024,03.01.2024` will create the groups `2,4`, `a` and `01.01.2024, 03.01.2024`

Again, `2,4` is used to interpolate the next numbers,
`a` is just copied
`01.01.2024,03.01.2024` is used to interpolate the next dates `05.01.2024, 07.01.2024, 09.01.2024, ...`


The formation of groups enables interpolation, even if heterogeneous data has been selected.

However, consecutive sequences must have the same *delta* to be a correct sequence.

For numbers, linear regression can always form a line, but no *model* is used for month names, numbers with text and dates.


This means that if the distance between 3 month names in the sequences is different, the autofill will fall back to simply copying the sequence over and over again.
Example: `jan,feb,apr` with the distances/deltas of `1,2`. If the deltas are different, it is not clear what the next value should be.

Example: `jan,feb,mar` with the distances/deltas of `1,1`. All deltas are the same, so we can continue with this delta and always add `1` month.

This also applies to dates when the spacing is used in days.

Below is a flowchart explaining the individual steps in a bit more detail.

#### Numbers

The cell text is a number (no other content).


The language settings are important for numbers (floats), e.g. 3.45 or 3.45

For the automatic filling of numbers, the setting `numbers style` is taken from the table UI. You can find it when you open the statistics panel on the left-hand side (by clicking on the arrow next to `add row`).

If you mainly work with a number style, you can change the default via the extension setting `initialNumbersStyle`.

Automatic filling numbers uses [linear regression](https://en.wikipedia.org/wiki/Linear_regression) to determine the values to be filled in (Excel also uses linear regression).

### Contains Number

This differs from normal numbers, as here the cell text must begin or end with a number (or both).

In this case, the interpolation is only a constant delta.
The delta is determined by the first two cell values in the selection.

e.g. `2. test, 4. test` will calculate a delta of `2`, so the next value will be `6. test`

If there are different deltas in the selected cells, the auto fill function will default to copy only.

e.g. `2. test, 4. test, 5. test` will calculate a delta of `2`, so the next values will be `2. test, 4. test, 5. test, 2. test, ...`

If there is a number at the beginning and at the end of the cell, the number at the beginning takes precedence.


#### Dates

The following formats are supported/known for dates:

- `YYYY-MM-DD`
- `YYYY-M-DD`
- `YYYY-MM-D`
- `YYYY-M-D`
- `DD-MM-YYYY`
- `DD-M-YYYY`
- `D-MM-YYYY`
- `D-M-YYYY`
- `DD-MM-YY`
- `DD-M-YY`
- `D-MM-YY`
- `D-M-YY`

where `YY/YYYY` stands for the year, e.g. 24/2024, `M/MM` stands for the month, e.g. 5/05 and `D/DD` stands for the day, e.g. 5/05

The separator `-` can actually be one of the following: `- / .`

**Yes**, there is no `MM-DD-YYYY` format!

Only the first two selected data are used for the interpolation (to determine the delta).


Then the diff in `days`, `months` and `years` is calculated, ignoring the other parts of the date.
e.g. the diff/delta in days for `25.05.2024` - `26.07.2024` is still only 1 `day`

If the diff in `days` is 0 and diff in `months` is 0, use the diff in years for interpolation.
This ensures days and months will stay the same: `25.05.2024, 25.05.2026` -> `25.05.2028`

If only the diff in `days` is 0, use the diff in month for interpolation.
e.g. `25.05.2024, 25.07.2026` -> `25.09.2028` (delta in months: 26)

In any other case, use the difference in `days`, but this time consider all parts of the date as delta for the interpolation.
e.g. `01.01.2024, 02.02.2024` gives a delta of 32 `days`
and the next date will be `05.03.2024`

If there are more than 2 pieces of data in the group sequence, they must have the same difference/delta.
If this is not the case, the data is copied again and again as a sequence by default.

If the interpolation would result in an invalid date such as `30.02.20`, `dayjs` will convert the date into a valid date (here `28.02.20`).

#### Month Names

Only English names are supported for month names: `january|february|march|april|may|june|july|august|september|october|november|december`
The first 3 letters can also be used as month names: `jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec`

In order for the month names to be filled in automatically, the month name must be the only text in the cell.


#### Shortcut for just coyping

Similar to Excel, you can hold down the `alt` key before releasing the mouse button to copy the cell values. No interpolation is carried out.

#### Differences to Excel

If only 1 cell is selected, interpolation increases

- `+1/-1` for numbers
- next/previous month name
- `+1/-1` day for dates

where Excel simply copies the value

There could be other differences...


#### Auto Fill Flowchart

If it's too small, open it from `docs/autoFillDiagram.jpg`

![alt text](docs/autoFillDiagram.jpg)