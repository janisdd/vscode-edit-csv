import { expect, test, suite } from 'vitest'
import { AutoFillTestData, AutoFillTestSuit } from './setup'


let tests_containsNumbersInts_StartsWithNumber_singleGroup: AutoFillTestData[] = [
	{
		name: 'starts with number 0, 1 cell, 1 target count',
		data: ['-5 test'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['-4 test']
	},
	{
		name: 'starts with number 0, 1 cell, 1 target count',
		data: ['0 test'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['1 test']
	},
	{
		name: 'starts with number 99, 1 cell, 1 target count',
		data: ['99 test'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['100 test']
	},
	{
		name: 'starts with number 1, 1 cell, 1 target count',
		data: ['1 test'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['2 test']
	},
	{
		name: 'starts with number 1, 1 cell, 2 target count',
		data: ['1 test'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['2 test', '3 test']
	},
	{
		name: 'starts with number 1, 1 cell, 3 target count',
		data: ['1 test'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['2 test', '3 test', '4 test']
	},

	{
		name: 'starts with number 1, contains 2 numbers, 1 cell, 3 target count',
		data: ['1 test 2 test'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['2 test 2 test', '3 test 2 test', '4 test 2 test']
	},

	{
		name: 'start with number has priority, 1 cell, 3 target count',
		data: ['2 test 3'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['3 test 3', '4 test 3', '5 test 3']
	},

	//--- other direction
	{
		name: 'starts with number 0, 1 cell, 1 target count (other dir)',
		data: ['-5 test'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['-6 test']
	},
	{
		name: 'starts with number 0, 1 cell, 1 target count (other dir)',
		data: ['0 test'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['-1 test']
	},
	{
		name: 'starts with number 99, 1 cell, 1 target count (other dir)',
		data: ['99 test'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['98 test']
	},
	{
		name: 'starts with number 1, 1 cell, 1 target count (other dir)',
		data: ['1 test'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['0 test']
	},
	{
		name: 'starts with number 1, 1 cell, 2 target count (other dir)',
		data: ['1 test'],
		targetCount: 2,
		isNormalDirection: false,
		expected: ['0 test', '-1 test'].reverse()
	},
	{
		name: 'starts with number 1, 1 cell, 3 target count (other dir)',
		data: ['1 test'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['0 test', '-1 test', '-2 test'].reverse()
	},

	{
		name: 'starts with number 1, contains 2 numbers, 1 cell, 3 target count (other dir)',
		data: ['1 test 2 test'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['0 test 2 test', '-1 test 2 test', '-2 test 2 test'].reverse()
	},

	{
		name: 'start with number has priority, 1 cell, 3 target count (other dir)',
		data: ['2 test 3'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['1 test 3', '0 test 3', '-1 test 3'].reverse()
	}
]


let tests_containsNumbersInts_StartsWithNumber_multiCells: AutoFillTestData[] = [
	{
		name: '2 consecutive numbered cells [0, 1], contains number does only constant delta (1 here)',
		data: ['0 test', '1 test'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['2 test']
	},
	{
		name: '2 consecutive numbered cells [7, 8], contains number does only constant delta (1 here)',
		data: ['7 test', '8 test'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['9 test', '10 test', '11 test']
	},
	{
		name: '3 consecutive numbered cells [7, 8, 9], contains number does only constant delta (1 here)',
		data: ['7 test', '8 test', '9 test'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['10 test', '11 test', '12 test']
	},
	{
		name: '3 not consecutive numbered cells [7, 8, 9], contains number does only constant delta (2 here)',
		data: ['7 test', '9 test', '11 test'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['13 test', '15 test', '17 test']
	},

	{
		name: '3 not consecutive numbered cells [7, 9, 12], defaults to copy only',
		data: ['7 test', '9 test', '12 test'],
		targetCount: 7,
		isNormalDirection: true,
		expected: ['7 test', '9 test', '12 test', '7 test', '9 test', '12 test', '7 test']
	},
	{
		name: '3 not consecutive numbered cells [7, 9, 12, 15] (delta 2, delta 3), defaults to copy only',
		data: ['7 test', '9 test', '12 test', '15 test', '18 test'],
		targetCount: 5,
		isNormalDirection: true,
		expected: ['7 test', '9 test', '12 test', '15 test', '18 test'],
	},

	//--- other direction

	{
		name: '2 consecutive numbered cells [0, 1], contains number does only constant delta (1 here) (other dir)',
		data: ['0 test', '1 test'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['-1 test']
	},
	{
		name: '2 consecutive numbered cells [7, 8], contains number does only constant delta (1 here) (other dir)',
		data: ['7 test', '8 test'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['6 test', '5 test', '4 test'].reverse()
	},
	{
		name: '3 consecutive numbered cells [7, 8, 9], contains number does only constant delta (1 here) (other dir)',
		data: ['7 test', '8 test', '9 test'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['6 test', '5 test', '4 test'].reverse()
	},
	{
		name: '3 not consecutive numbered cells [7, 8, 9], contains number does only constant delta (2 here) (other dir)',
		data: ['7 test', '9 test', '11 test'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['5 test', '3 test', '1 test'].reverse()
	},

	{
		name: '3 not consecutive numbered cells [7, 9, 12], defaults to copy only (other dir)',
		data: ['7 test', '9 test', '12 test'],
		targetCount: 7,
		isNormalDirection: false,
		expected: ['12 test', '9 test', '7 test', '12 test', '9 test', '7 test', '12 test'].reverse()
	},
	{
		name: '3 not consecutive numbered cells [7, 9, 12, 15] (delta 2, delta 3), defaults to copy only',
		data: ['7 test', '9 test', '12 test', '15 test', '18 test'],
		targetCount: 5,
		isNormalDirection: false,
		expected: ['18 test', '15 test', '12 test', '9 test', '7 test'].reverse()
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
