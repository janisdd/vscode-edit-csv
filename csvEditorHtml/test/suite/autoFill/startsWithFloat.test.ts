import { expect, test, suite } from 'vitest'
import { AutoFillTestData, AutoFillTestSuit } from './types'


let tests_containsNumbersInts_StartsWithNumber_singleGroup: AutoFillTestData[] = [
	{
		name: 'starts with number 0, 1 cell, 1 target count',
		data: ['-5.3 test'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['-4.3 test']
	},
	{
		name: 'starts with number 0, 1 cell, 1 target count',
		data: ['0.7 test'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['1.7 test']
	},
	{
		name: 'starts with number 99, 1 cell, 1 target count',
		data: ['99.2 test'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['100.2 test']
	},
	{
		name: 'starts with number 1, 1 cell, 1 target count',
		data: ['1.9 test'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['2.9 test']
	},
	{
		name: 'starts with number 1, 1 cell, 2 target count',
		data: ['1.8 test'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['2.8 test', '3.8 test']
	},
	{
		name: 'starts with number 1, 1 cell, 3 target count',
		data: ['1.6 test'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['2.6 test', '3.6 test', '4.6 test']
	},

	{
		name: 'starts with number 1, contains 2 numbers, 1 cell, 3 target count',
		data: ['1.1 test 2.1 test'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['2.1 test 2.1 test', '3.1 test 2.1 test', '4.1 test 2.1 test']
	},

	{
		name: 'start with number has priority, 1 cell, 3 target count',
		data: ['2.5 test 3'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['3.5 test 3', '4.5 test 3', '5.5 test 3']
	},

	//--- other direction
	{
		name: 'starts with number -5, 1 cell, 1 target count (other dir)',
		data: ['-5.5 test'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['-6.5 test']
	},
	{
		name: 'starts with number 0, 1 cell, 1 target count (other dir)',
		data: ['0.4 test'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['-0.6 test']
	},
	{
		name: 'starts with number 99, 1 cell, 1 target count (other dir) [trailing zeros are removed]',
		data: ['99.0 test'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['98 test']
	},
	{
		name: 'starts with number 1, 1 cell, 1 target count (other dir) [trailing zeros are removed]',
		data: ['1.0 test'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['0 test']
	},
	{
		name: 'starts with number 1, 1 cell, 2 target count (other dir)',
		data: ['1.1 test'],
		targetCount: 2,
		isNormalDirection: false,
		expected: ['0.1 test', '-0.9 test'].reverse()
	},
	{
		name: 'starts with number 1, 1 cell, 3 target count (other dir)',
		data: ['1.8 test'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['0.8 test', '-0.2 test', '-1.2 test'].reverse()
	},

	{
		name: 'starts with number 1, contains 2 numbers, 1 cell, 3 target count (other dir)',
		data: ['1.3 test 2 test'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['0.3 test 2 test', '-0.7 test 2 test', '-1.7 test 2 test'].reverse()
	},

	{
		name: 'start with number has priority, 1 cell, 3 target count (other dir)',
		data: ['2.4 test 3'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['1.4 test 3', '0.4 test 3', '-0.6 test 3'].reverse()
	}
]


let tests_containsNumbersInts_StartsWithNumber_multiCells: AutoFillTestData[] = [
	{
		name: '2 consecutive numbered cells [0, 1], contains number does only constant delta (1 here)',
		data: ['0.1 test', '1.1 test'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['2.1 test']
	},
	{
		name: '2 consecutive numbered cells [7, 8], contains number does only constant delta (1 here)',
		data: ['7.15 test', '8.15 test'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['9.15 test', '10.15 test', '11.15 test']
	},
	{
		name: '3 consecutive numbered cells [7, 8, 9], contains number does only constant delta (1 here)',
		data: ['7.99 test', '8.99 test', '9.99 test'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['10.99 test', '11.99 test', '12.99 test']
	},
	{
		name: '3 not consecutive numbered cells [7, 8, 9], contains number does only constant delta (2 here)',
		data: ['7.3 test', '9.3 test', '11.3 test'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['13.3 test', '15.3 test', '17.3 test']
	},

	{
		name: '3 not consecutive numbered cells [7, 9, 12], defaults to copy only',
		data: ['7.56 test', '9.56 test', '12.56 test'],
		targetCount: 7,
		isNormalDirection: true,
		expected: ['7.56 test', '9.56 test', '12.56 test', '7.56 test', '9.56 test', '12.56 test', '7.56 test']
	},
	{
		name: '3 not consecutive numbered cells [7, 9, 12, 15] (delta 2, delta 3), defaults to copy only',
		data: ['7.0123456789 test', '9.0123456789 test', '12.0123456789 test', '15.0123456789 test', '18.0123456789 test'],
		targetCount: 5,
		isNormalDirection: true,
		expected: ['7.0123456789 test', '9.0123456789 test', '12.0123456789 test', '15.0123456789 test', '18.0123456789 test'],
	},

	//--- other direction

	{
		name: '2 consecutive numbered cells [0, 1], contains number does only constant delta (1 here) (other dir)',
		data: ['0.3 test', '1.3 test'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['-0.7 test']
	},
	{
		name: '2 consecutive numbered cells [7, 8], contains number does only constant delta (1 here) (other dir)',
		data: ['7.7 test', '8.7 test'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['6.7 test', '5.7 test', '4.7 test'].reverse()
	},
	{
		name: '3 consecutive numbered cells [7, 8, 9], contains number does only constant delta (1 here) (other dir)',
		data: ['7.1 test', '8.1 test', '9.1 test'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['6.1 test', '5.1 test', '4.1 test'].reverse()
	},
	{
		name: '3 not consecutive numbered cells [7, 8, 9], contains number does only constant delta (2 here) (other dir)',
		data: ['7.1 test', '9.1 test', '11.1 test'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['5.1 test', '3.1 test', '1.1 test'].reverse()
	},

	{
		name: '3 not consecutive numbered cells [7, 9, 12], defaults to copy only (other dir)',
		data: ['7.1 test', '9.1 test', '12.1 test'],
		targetCount: 7,
		isNormalDirection: false,
		expected: ['12.1 test', '9.1 test', '7.1 test', '12.1 test', '9.1 test', '7.1 test', '12.1 test'].reverse()
	},
	{
		name: '3 not consecutive numbered cells [7, 9, 12, 15] (delta 2, delta 3), defaults to copy only',
		data: ['7.1 test', '9.1 test', '12.1 test', '15.1 test', '18.1 test'],
		targetCount: 5,
		isNormalDirection: false,
		expected: ['18.1 test', '15.1 test', '12.1 test', '9.1 test', '7.1 test'].reverse()
	},

]


let tests_containsNumbersInts_StartsWithNumber_special: AutoFillTestData[] = [
	{
		name: 'starts with float precision test 1 (big properly configured, at least 20 fract digits [only important devision, sqrt, pow])',
		data: ['1.01234567890123456789 xyz abc'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['2.01234567890123456789 xyz abc']
	},
	{
		name: 'starts with float precision test -1  (big properly configured, at least 20 fract digits [only important devision, sqrt, pow])',
		data: ['-1.01234567890123456789 xyz abc'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['-0.01234567890123456789 xyz abc']
	},
	{
		name: 'starts with float large values test 5  (big properly configured, at least 20 fract digits [only important devision, sqrt, pow])',
		//unsigned long: 4,294,967,295 -> 4294967295 -> just a bit more
		data: ['5294967295.01234567890123456789 xyz abc'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['5294967296.01234567890123456789 xyz abc']
	},
	{
		name: 'starts with float large values test -5  (big properly configured, at least 20 fract digits [only important devision, sqrt, pow])',
		//unsigned long: 4,294,967,295 -> 4294967295
		data: ['-5294967295.01234567890123456789 xyz abc'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['-5294967294.01234567890123456789 xyz abc']
	},

	{
		name: 'starts with float precision test 1  (big properly configured, at least 20 fract digits [only important devision, sqrt, pow]) (not rounded because we only add/sub)',
		data: ['1.0123456789012345678913333333334000000000000000000000000000000000000000000000000000000000004564560198 xyz abc'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['2.0123456789012345678913333333334000000000000000000000000000000000000000000000000000000000004564560198 xyz abc']
	},
	{
		name: 'starts with float precision test 1  (big properly configured, at least 20 fract digits [only important devision, sqrt, pow]) (not rounded because we only add/sub)',
		//100 digits . 100 digits
		data: ['1123456789012345678913333333334000000000000000000000000000000000000000000000000000000000004564560198.1123456789012345678913333333334000000000000000000000000000000000000000000000000000000000004564560198 xyz abc'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['1123456789012345678913333333334000000000000000000000000000000000000000000000000000000000004564560199.1123456789012345678913333333334000000000000000000000000000000000000000000000000000000000004564560198 xyz abc']
	},
]

let allTests: AutoFillTestSuit[] = [
	{
		name: 'starts with number tests, single group',
		tests: tests_containsNumbersInts_StartsWithNumber_singleGroup
	},
	{
		name: 'starts with number tests, multiple groups',
		tests: tests_containsNumbersInts_StartsWithNumber_multiCells
	},
	{
		name: 'starts with number tests, special',
		tests: tests_containsNumbersInts_StartsWithNumber_special
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
