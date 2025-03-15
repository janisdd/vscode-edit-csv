import { expect, test, suite } from 'vitest'
import { AutoFillTestData, AutoFillTestSuit } from './types'


let tests_containsNumbersInts_EdnsWithNumber_singleGroup: AutoFillTestData[] = [
	{
		name: 'ends with number -5, 1 cell, 1 target count',
		data: ['test -5'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['test -4']
	},
	{
		name: 'ends with number 0, 1 cell, 1 target count',
		data: ['test 0'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['test 1']
	},
	{
		name: 'ends with number 99, 1 cell, 1 target count',
		data: ['test 99'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['test 100']
	},
	{
		name: 'ends with number 1, 1 cell, 1 target count',
		data: ['test 1'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['test 2']
	},
	{
		name: 'ends with number 1, 1 cell, 2 target count',
		data: ['test 1'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['test 2', 'test 3']
	},
	{
		name: 'ends with number 1, 1 cell, 3 target count',
		data: ['test 1'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['test 2', 'test 3', 'test 4']
	},

	{
		name: 'ends with number 1, contains 2 numbers, 1 cell, 3 target count',
		data: ['test 1 test 2'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['test 1 test 3', 'test 1 test 4', 'test 1 test 5']
	},
	
	// {
	// 	name: 'ends with number has priority, 1 cell, 3 target count', //start has priority
	// 	data: ['2 test 3'],
	// 	targetCount: 3,
	// 	isNormalDirection: true,
	// 	expected: ['3 test 3', '4 test 3', '5 test 3']
	// },

	//--- other direction
	{
		name: 'ends with number -5, 1 cell, 1 target count (other dir)',
		data: ['test -5'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['test -6']
	},
	{
		name: 'ends with number 0, 1 cell, 1 target count (other dir)',
		data: ['test 0'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['test -1']
	},
	{
		name: 'ends with number 99, 1 cell, 1 target count (other dir)',
		data: ['test 99'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['test 98']
	},
	{
		name: 'ends with number 1, 1 cell, 1 target count (other dir)',
		data: ['test 1'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['test 0']
	},
	{
		name: 'ends with number 1, 1 cell, 2 target count (other dir)',
		data: ['test 1'],
		targetCount: 2,
		isNormalDirection: false,
		expected: ['test 0', 'test -1'].reverse()
	},
	{
		name: 'ends with number 1, 1 cell, 3 target count (other dir)',
		data: ['test 1'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['test 0', 'test -1', 'test -2'].reverse()
	},

	{
		name: 'ends with number 1, contains 2 numbers, 1 cell, 3 target count (other dir)',
		data: ['test 1 test 2'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['test 1 test 1', 'test 1 test 0', 'test 1 test -1'].reverse()
	},
]

//TODO
let tests_containsNumbersInts_EndsWithNumber_multiCells: AutoFillTestData[] = [
	{
		name: '2 consecutive numbered cells [0, 1], contains number does only constant delta (1 here)',
		data: ['test 0', 'test 1'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['test 2']
	},
	{
		name: '2 consecutive numbered cells [7, 8], contains number does only constant delta (1 here)',
		data: ['test 7', 'test 8'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['test 9', 'test 10', 'test 11']
	},
	{
		name: '3 consecutive numbered cells [7, 8, 9], contains number does only constant delta (1 here)',
		data: ['test 7', 'test 8', 'test 9'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['test 10', 'test 11', 'test 12']
	},
	{
		name: '3 not consecutive numbered cells [7, 8, 9], contains number does only constant delta (2 here)',
		data: ['test 7', 'test 9', 'test 11'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['test 13', 'test 15', 'test 17']
	},

	{
		name: '3 not consecutive numbered cells [7, 9, 12], defaults to copy only',
		data: ['test 7', 'test 9', 'test 12'],
		targetCount: 7,
		isNormalDirection: true,
		expected: ['test 7', 'test 9', 'test 12', 'test 7', 'test 9', 'test 12', 'test 7']
	},
	{
		name: '3 not consecutive numbered cells [7, 9, 12, 15] (delta 2, delta 3), defaults to copy only',
		data: ['test 7', 'test 9', 'test 12', 'test 15', 'test 18'],
		targetCount: 5,
		isNormalDirection: true,
		expected: ['test 7', 'test 9', 'test 12', 'test 15', 'test 18'],
	},

	//--- other direction

	{
		name: '2 consecutive numbered cells [0, 1], contains number does only constant delta (1 here) (other dir)',
		data: ['test 0', 'test 1'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['test -1']
	},
	{
		name: '2 consecutive numbered cells [7, 8], contains number does only constant delta (1 here) (other dir)',
		data: ['test 7', 'test 8'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['test 6', 'test 5', 'test 4'].reverse()
	},
	{
		name: '3 consecutive numbered cells [7, 8, 9], contains number does only constant delta (1 here) (other dir)',
		data: ['test 7', 'test 8', 'test 9'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['test 6', 'test 5', 'test 4'].reverse()
	},
	{
		name: '3 not consecutive numbered cells [7, 8, 9], contains number does only constant delta (2 here) (other dir)',
		data: ['test 7', 'test 9', 'test 11'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['test 5', 'test 3', 'test 1'].reverse()
	},

	{
		name: '3 not consecutive numbered cells [7, 9, 12], defaults to copy only (other dir)',
		data: ['test 7', 'test 9', 'test 12'],
		targetCount: 7,
		isNormalDirection: false,
		expected: ['test 12', 'test 9', 'test 7', 'test 12', 'test 9', 'test 7', 'test 12'].reverse()
	},
	{
		name: '3 not consecutive numbered cells [7, 9, 12, 15] (delta 2, delta 3), defaults to copy only',
		data: ['test 7', 'test 9', 'test 12', 'test 15', 'test 18'],
		targetCount: 5,
		isNormalDirection: false,
		expected: ['test 18', 'test 15',  'test 12', 'test 9', 'test 7'].reverse()
	},
]

let allTests: AutoFillTestSuit[] = [
	{
		name: 'ends with number tests, single group',
		tests: tests_containsNumbersInts_EdnsWithNumber_singleGroup
	},
	{
		name: 'ends with number tests, multiple groups',
		tests: tests_containsNumbersInts_EndsWithNumber_multiCells
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
