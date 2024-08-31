import { expect, test, suite } from 'vitest'
import { AutoFillTestData, AutoFillTestSuit } from './setup'


let tests_onlyIntsLinearRegression: AutoFillTestData[] = [
	{
		name: 'increment by 1, 1 cell, 1 target count',
		data: ['1'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['2', '3', '4']
	},
	{
		name: 'increment by 1, int: 5, 3 target count',
		data: ['5'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['6', '7', '8']
	},
	{
		name: 'increment by 1, int: -5, 3 target count',
		data: ['-5'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['-4', '-3', '-2']
	},
	{
		name: 'increment by 2, int: 5',
		data: ['5', '7'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['9', '11', '13']
	},
	{
		name: 'real regression 1, int: [1, 3, 8]',
		data: ['1', '3', '8'],
		targetCount: 5,
		isNormalDirection: true,
		expected: ['11', '14.5', '18', '21.5', '25']
	},
	{
		name: 'real regression 2, int: [23, 67, 89, 101]',
		data: ['23', '67', '89', '101'],
		targetCount: 7,
		isNormalDirection: true,
		expected: ['134', '159.6', '185.2', '210.8', '236.4', '262', '287.6']
	},
	{
		name: 'real regression 3, int: [5, 8, -2, 8, -4]',
		data: ['5', '8', '-2', '8', '-4'],
		targetCount: 5,
		isNormalDirection: true,
		expected: ['-2.4', '-4.2', '-6', '-7.8', '-9.6']
	},
	//--- large numbers with big.js
	{
		name: 'larger than unsigned long, 1 cell, 1 target count',
		//unsigned long: 4,294,967,295 -> 4294967295 -> just a bit more
		data: ['01234567890123456789012345678901234567890123456789'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['1234567890123456789012345678901234567890123456790']
	},
	{
		name: 'larger than unsigned long, 1 cell, 1 target count (end is same as [1, 3, 8])',
		//unsigned long: 4,294,967,295 -> 4294967295 -> just a bit more
		data: ['12345678901234567890123456789012345678901234567891', '12345678901234567890123456789012345678901234567893', '12345678901234567890123456789012345678901234567898'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['12345678901234567890123456789012345678901234567901', '12345678901234567890123456789012345678901234567904.5']
	},
]

let allTests: AutoFillTestSuit[] = [
	{
		name: 'test only ints linear regression',
		tests: tests_onlyIntsLinearRegression
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
