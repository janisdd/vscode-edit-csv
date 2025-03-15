import { expect, test, suite } from 'vitest'
import { AutoFillTestData, AutoFillTestSuit } from './types'


let tests_containsNumbersInts_StartsWithNumber_singleGroup: AutoFillTestData[] = [
	{
		name: 'ends with number 0, 1 cell, 1 target count',
		data: ['test -5.3'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['test -4.3']
	},
	{
		name: 'ends with number 0, 1 cell, 1 target count',
		data: ['test 0.7'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['test 1.7']
	},
	{
		name: 'ends with number 99, 1 cell, 1 target count',
		data: ['test 99.2'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['test 100.2']
	},
	{
		name: 'ends with number 1, 1 cell, 1 target count',
		data: ['test 1.9'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['test 2.9']
	},
	{
		name: 'ends with number 1, 1 cell, 2 target count',
		data: ['test 1.8'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['test 2.8', 'test 3.8']
	},
	{
		name: 'ends with number 1, 1 cell, 3 target count',
		data: ['test 1.6'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['test 2.6', 'test 3.6', 'test 4.6']
	},

	{
		name: 'ends with number 1, contains 2 numbers, 1 cell, 3 target count',
		data: ['test 2.1 test 1.1'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['test 2.1 test 2.1', 'test 2.1 test 3.1', 'test 2.1 test 4.1']
	},



	//--- other direction
	{
		name: 'ends with number -5, 1 cell, 1 target count (other dir)',
		data: ['test -5.5'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['test -6.5']
	},
	{
		name: 'ends with number 0, 1 cell, 1 target count (other dir)',
		data: ['test 0.4'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['test -0.6']
	},
	{
		name: 'ends with number 99, 1 cell, 1 target count (other dir) [trailing zeros are removed]',
		data: ['test 99.0'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['test 98']
	},
	{
		name: 'ends with number 1, 1 cell, 1 target count (other dir) [trailing zeros are removed]',
		data: ['test 1.0'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['test 0']
	},
	{
		name: 'ends with number 1, 1 cell, 2 target count (other dir)',
		data: ['test 1.1'],
		targetCount: 2,
		isNormalDirection: false,
		expected: ['test 0.1', 'test -0.9'].reverse()
	},
	{
		name: 'ends with number 1, 1 cell, 3 target count (other dir)',
		data: ['test 1.8'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['test 0.8', 'test -0.2', 'test -1.2'].reverse()
	},

	{
		name: 'ends with number 1, contains 2 numbers, 1 cell, 3 target count (other dir)',
		data: ['test 2 test 1.3'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['test 2 test 0.3', 'test 2 test -0.7', 'test 2 test -1.7'].reverse()
	},

]


let tests_containsNumbersInts_StartsWithNumber_multiCells: AutoFillTestData[] = [
	{
		name: '2 consecutive numbered cells [0, 1], contains number does only constant delta (1 here)',
		data: ['test 0.1', 'test 1.1'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['test 2.1']
	},
	{
		name: '2 consecutive numbered cells [7, 8], contains number does only constant delta (1 here)',
		data: ['test 7.15', 'test 8.15'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['test 9.15', 'test 10.15', 'test 11.15']
	},
	{
		name: '3 consecutive numbered cells [7, 8, 9], contains number does only constant delta (1 here)',
		data: ['test 7.99', 'test 8.99', 'test 9.99'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['test 10.99', 'test 11.99', 'test 12.99']
	},
	{
		name: '3 not consecutive numbered cells [7, 8, 9], contains number does only constant delta (2 here)',
		data: ['test 7.3', 'test 9.3', 'test 11.3'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['test 13.3', 'test 15.3', 'test 17.3']
	},

	{
		name: '3 not consecutive numbered cells [7, 9, 12], defaults to copy only',
		data: ['test 7.56', 'test 9.56', 'test 12.56'],
		targetCount: 7,
		isNormalDirection: true,
		expected: ['test 7.56', 'test 9.56', 'test 12.56', 'test 7.56', 'test 9.56', 'test 12.56', 'test 7.56']
	},
	{
		name: '3 not consecutive numbered cells [7, 9, 12, 15] (delta 2, delta 3), defaults to copy only',
		data: ['test 7.0123456789', 'test 9.0123456789', 'test 12.0123456789', 'test 15.0123456789', 'test 18.0123456789'],
		targetCount: 5,
		isNormalDirection: true,
		expected: ['test 7.0123456789', 'test 9.0123456789', 'test 12.0123456789', 'test 15.0123456789', 'test 18.0123456789'],
	},

	//--- other direction

	{
		name: '2 consecutive numbered cells [0, 1], contains number does only constant delta (1 here) (other dir)',
		data: ['test 0.3', 'test 1.3'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['test -0.7']
	},
	{
		name: '2 consecutive numbered cells [7, 8], contains number does only constant delta (1 here) (other dir)',
		data: ['test 7.7', 'test 8.7'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['test 6.7', 'test 5.7', 'test 4.7'].reverse()
	},
	{
		name: '3 consecutive numbered cells [7, 8, 9], contains number does only constant delta (1 here) (other dir)',
		data: ['test 7.1', 'test 8.1', 'test 9.1'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['test 6.1', 'test 5.1', 'test 4.1'].reverse()
	},
	{
		name: '3 not consecutive numbered cells [7, 8, 9], contains number does only constant delta (2 here) (other dir)',
		data: ['test 7.1', 'test 9.1', 'test 11.1'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['test 5.1', 'test 3.1', 'test 1.1'].reverse()
	},

	{
		name: '3 not consecutive numbered cells [7, 9, 12], defaults to copy only (other dir)',
		data: ['test 7.1', 'test 9.1', 'test 12.1'],
		targetCount: 7,
		isNormalDirection: false,
		expected: ['test 12.1', 'test 9.1', 'test 7.1', 'test 12.1', 'test 9.1', 'test 7.1', 'test 12.1'].reverse()
	},
	{
		name: '3 not consecutive numbered cells [7, 9, 12, 15] (delta 2, delta 3), defaults to copy only',
		data: ['test 7.1', 'test 9.1', 'test 12.1', 'test 15.1', 'test 18.1'],
		targetCount: 5,
		isNormalDirection: false,
		expected: ['test 18.1', 'test 15.1', 'test 12.1', 'test 9.1', 'test 7.1'].reverse()
	},

]

let tests_containsNumbersInts_EndsWithNumber_special: AutoFillTestData[] = [
	{
		name: 'ends with float precision test 1 (big properly configured, at least 20 fract digits)',
		data: ['xyz abc 1.01234567890123456789'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['xyz abc 2.01234567890123456789']
	},
	{
		name: 'ends with float precision test -1  (big properly configured, at least 20 fract digits)',
		data: ['xyz abc -1.01234567890123456789'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['xyz abc -0.01234567890123456789']
	},
	{
		name: 'ends with float large values test 5  (big properly configured, at least 20 fract digits)',
		//unsigned long: 4,294,967,295 -> 4294967295 -> just a bit more
		data: ['xyz abc 5294967295.01234567890123456789'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['xyz abc 5294967296.01234567890123456789']
	},
	{
		name: 'ends with float large values test -5  (big properly configured, at least 20 fract digits)',
		//unsigned long: 4,294,967,295 -> 4294967295
		data: ['xyz abc -5294967295.01234567890123456789'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['xyz abc -5294967294.01234567890123456789']
	},

	{
		name: 'ends with float precision test 1  (big properly configured, at least 20 fract digits)',
		data: ['xyz abc 1.0123456789012345678913333333334000000000000000000000000000000000000000000000000000000000004564560198'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['xyz abc 2.0123456789012345678913333333334000000000000000000000000000000000000000000000000000000000004564560198']
	},
	{
		name: 'ends with float precision test 1  (big properly configured, at least 20 fract digits)',
		//100 digits . 100 digits
		data: ['xyz abc 1123456789012345678913333333334000000000000000000000000000000000000000000000000000000000004564560198.1123456789012345678913333333334000000000000000000000000000000000000000000000000000000000004564560198'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['xyz abc 1123456789012345678913333333334000000000000000000000000000000000000000000000000000000000004564560199.1123456789012345678913333333334000000000000000000000000000000000000000000000000000000000004564560198']
	},
]

let allTests: AutoFillTestSuit[] = [
	{
		name: 'ends with number tests, single group',
		tests: tests_containsNumbersInts_StartsWithNumber_singleGroup
	},
	{
		name: 'ends with number tests, multiple groups',
		tests: tests_containsNumbersInts_StartsWithNumber_multiCells
	},
	{
		name: 'ends with number tests, special',
		tests: tests_containsNumbersInts_EndsWithNumber_special
	},
]


for (let i = 0; i < allTests.length; i++) {
	const testSuit = allTests[i]

	suite(testSuit.name, () => {

		for (let j = 0; j < testSuit.tests.length; j++) {
			const testCase = testSuit.tests[j]

			test(testCase.name, () => {
				let result = customAutoFillFunc(
					testCase.data,
					testCase.targetCount,
					testCase.isNormalDirection,
					{ altKey: false } as MouseEvent
				)
				expect(result).toEqual(testCase.expected)
			})

		}

	})

}
