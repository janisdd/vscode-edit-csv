import { expect, test, suite } from 'vitest'

type HasHeaderTestData = {
	name: string,
	csv: string,
	expected: boolean
}

type MyTestSuit = {
	name: string
	tests: HasHeaderTestData[]
}


//comment, numbers

let test_normal: HasHeaderTestData[] = [
	{
		name: 'normal data',
		csv: `
UserId,FirstName,ShouldNotCount,PLangName,ParticipationCount,MaxNormalTestPoints,MaxSubmitTestPoints
513,Alaa,False,Java,1,3,2
329,Hanna,False,Java,1,3,2
588,David,False,Java,1,3,2
		`,
		expected: true,
	},
	{
		name: 'no header, normal data',
		csv: `
512,Max,False,Python,1,3,2
513,Alaa,False,Java,1,3,2
329,Hanna,False,Java,1,3,2
588,David,False,Java,1,3,2
			`,
		expected: false,
	},
	{
		name: 'threshold many unique header values -> has header',
		csv: `
X,Y,Z,Online,M
Central America and the Caribbean,Belize,Household,Offline,H
Europe,Denmark,Clothes,Online,C
Europe,Germany,Cosmetics,Offline,M
		`,
		expected: true,
	},
	{
		name: 'less than threshold many unique header values -> no header', //because germany is repeated
		csv: `
X,Germany,Personal Care,Online,M
Central America and the Caribbean,Belize,Household,Offline,H
Europe,Denmark,Clothes,Online,C
Europe,Germany,Cosmetics,Offline,M
		`,
		expected: false,
	},
	{
		name: 'normal data, with comment',
		csv: `
# just a comment
UserId,FirstName,ShouldNotCount,PLangName,ParticipationCount,MaxNormalTestPoints,MaxSubmitTestPoints
513,Alaa,False,Java,1,3,2
329,Hanna,False,Java,1,3,2
588,David,False,Java,1,3,2
	`,
		expected: true,
	},
	{
		name: 'no header, normal data',
		csv: `
# just a comment
512,Max,False,Python,1,3,2
513,Alaa,False,Java,1,3,2
329,Hanna,False,Java,1,3,2
588,David,False,Java,1,3,2
		`,
		expected: false,
	},
	{
		name: 'normal data, with comment',
		csv: `
# just a comment
# another comment
UserId,FirstName,ShouldNotCount,PLangName,ParticipationCount,MaxNormalTestPoints,MaxSubmitTestPoints
513,Alaa,False,Java,1,3,2
329,Hanna,False,Java,1,3,2
588,David,False,Java,1,3,2
	`,
		expected: true,
	},
	{
		name: 'no header, normal data',
		csv: `
# just a comment
# another comment
512,Max,False,Python,1,3,2
513,Alaa,False,Java,1,3,2
329,Hanna,False,Java,1,3,2
588,David,False,Java,1,3,2
		`,
		expected: false,
	},

	// numbers
	{
		name: 'ints in header',
		csv: `
UserId,123,123,123
513,Alaa,False,Java,1,3,2
329,Hanna,False,Java,1,3,2
588,David,False,Java,1,3,2
		`,
		expected: false,
	},
	{
		name: 'floats in header',
		csv: `
UserId,9.0,9.1,9.2
513,Alaa,False,Java,1,3,2
329,Hanna,False,Java,1,3,2
588,David,False,Java,1,3,2
		`,
		expected: false,
	},
	{
		name: 'floats with separators in header',
		csv: `
UserId,"9,000.0","9,876.5","9,000,000.0"
513,Alaa,False,Java,1,3,2
329,Hanna,False,Java,1,3,2
588,David,False,Java,1,3,2
		`,
		expected: false,
	},
	{
		name: 'non-en floats in header',
		csv: `
UserId,"9,0","9,1","9,2"
513,Alaa,False,Java,1,3,2
329,Hanna,False,Java,1,3,2
588,David,False,Java,1,3,2
		`,
		expected: false,
	},
	{
		name: 'non-enfloats with separators in header',
		csv: `
UserId,"9.000,0","9.876,5","9.000.000,0"
513,Alaa,False,Java,1,3,2
329,Hanna,False,Java,1,3,2
588,David,False,Java,1,3,2
		`,
		expected: false,
	},

	// mixed string & number in cell --> not a single number -> text

	{
		name: 'non-enfloats with separators in header',
		csv: `
UserId,"a 9.000,0","9.876,5","9.000.000,0"
513,Alaa,False,Java,1,3,2
329,Hanna,False,Java,1,3,2
588,David,False,Java,1,3,2
		`,
		expected: false,
	},

]


let test_threshold: HasHeaderTestData[] = [
	{
		name: 'at least 3 columns look like header',
		csv: `
UserId,Max,Passed,123,
513,Alaa,False,Java,1,3,2
329,Hanna,False,Java,1,3,2
588,David,False,Java,1,3,2
		`,
		expected: true,
	},
	{
		name: 'at least 3 columns look like numbers', //numbers are normally not in the header
		csv: `
UserId,Max,Passed,999,999,999
513,Alaa,False,Java,1,3,2
329,Hanna,False,Java,1,3,2
588,David,False,Java,1,3,2
		`,
		expected: false,
	},

	{
		name: 'header with numbers (we count it as text)',
		csv: `
UserId,123,a 123,b123
513,Alaa,False,Java,1,3,2
329,Hanna,False,Java,1,3,2
588,David,False,Java,1,3,2
		`,
		expected: true,
	},
	{
		name: 'header with floats (we count it as text)',
		csv: `
UserId,Test 1, Test 2, Test 3
513,Alaa,False,Java,1,3,2
329,Hanna,False,Java,1,3,2
588,David,False,Java,1,3,2
		`,
		expected: true,
	},

	// known cell values
	{
		name: 'true/false are known values',
		csv: `
UserId,false,true,Language,true
513,Alaa,False,Java,1,3,2
329,Hanna,False,Java,1,3,2
588,David,False,Java,1,3,2
		`,
		expected: false,
	},
	{
		name: 'true/false are known values but 3 normal columns',
		csv: `
UserId,false,true,Language,true,Count
513,Alaa,False,Java,1,3,2
329,Hanna,False,Java,1,3,2
588,David,False,Java,1,3,2
		`,
		expected: true,
	},
]

let allTests: MyTestSuit[] = [
	{
		name: 'test normal',
		tests: test_normal
	},
	{
		name: 'test threshold',
		tests: test_threshold
	},
]


for (let i = 0; i < allTests.length; i++) {
	const testSuit = allTests[i]

	suite(testSuit.name, () => {

		for (let j = 0; j < testSuit.tests.length; j++) {
			const testCase = testSuit.tests[j]

			test(testCase.name, () => {
				const parsedCsv = parseCsv(testCase.csv.trim(), defaultCsvReadOptions)

				_normalizeDataArray(parsedCsv, defaultCsvReadOptions)

				window.knownNumberStylesMap = {
					"en": {
						key: 'en',
						/**
						 * this allows:
						 * 0(000)
						 * 0(000).0(000)
						 * .0(000)
						 * all repeated with - in front (negative numbers)
						 * all repeated with e0(000) | e+0(000) | e-0(000)
						 */
						regex: /-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?/,
						regexStartToEnd: /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/,
						thousandSeparator: /(\,| )/gm,
						thousandSeparatorReplaceRegex: /((\,| )\d{3})+/gm
					},
					"non-en": {
						key: 'non-en',
						/**
						 * this allows:
						 * 0(000)
						 * 0(000),0(000)
						 * ,0(000)
						 * all repeated with - in front (negative numbers)
						 * all repeated with e0(000) | e+0(000) | e-0(000)
						 */
						regex: /-?(\d+(\,\d*)?|\,\d+)(e[+-]?\d+)?/,
						regexStartToEnd: /^-?(\d+(\,\d*)?|\,\d+)(e[+-]?\d+)?$/,
						thousandSeparator: /(\.| )/gm,
						thousandSeparatorReplaceRegex: /((\.| )\d{3})+/gm
					}
				}

				let hasHeader = tryToGuessHasHeader(
					parsedCsv.data,
					defaultCsvReadOptions
				)
				expect(hasHeader).toEqual(testCase.expected)
			})

		}

	})

}
