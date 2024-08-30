import { expect, test, suite } from 'vitest'
import { AutoFillTestData, AutoFillTestSuit } from './setup'


let tests_differentGroups: AutoFillTestData[] = [
	{
		name: '[int group, copy] target 1 selected data 3',
		data: ['1', '2', 'a'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['3']
	},
	{
		name: '[int group, copy] target 2 than selected data 3',
		data: ['1', '2', 'a'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['3', '4']
	},
	{
		name: '[int group, copy]',
		data: ['1', '2', 'a'],
		targetCount: 6,
		isNormalDirection: true,
		expected: ['3', '4', 'a', '5', '6', 'a']
	},
	{
		name: '[int group, copy, copy]',
		data: ['1', '2', 'a', 'b'],
		targetCount: 8,
		isNormalDirection: true,
		expected: ['3', '4', 'a', 'b', '5', '6', 'a', 'b']
	},
	{
		name: '[int group, copy, int group]',
		data: ['1', '2', 'a', '3', '5'],
		targetCount: 10,
		isNormalDirection: true,
		expected: ['3', '4', 'a', '7', '9', '5', '6', 'a', '11', '13']
	},
	{
		name: '[int group, copy, int group, copy]',
		data: ['1', '2', 'a', '3', '5', 'abc 1 xyz'],
		targetCount: 12,
		isNormalDirection: true,
		expected: ['3', '4', 'a', '7',  '9', 'abc 1 xyz', '5', '6', 'a', '11', '13', 'abc 1 xyz']
	},
	{
		name: '[copy, int group, copy, int group]',
		data: ['abc 1 xyz', '1', '2', 'a', '3', '5'],
		targetCount: 12,
		isNormalDirection: true,
		expected: ['abc 1 xyz', '3', '4', 'a', '7',  '9', 'abc 1 xyz', '5', '6', 'a', '11', '13']
	},
	{
		name: '[int, startsWithInt]',
		data: ['3', '7 test'],
		targetCount: 4,
		isNormalDirection: true,
		expected: ['4', '8 test', '5', '9 test']
	},
	{
		name: '[int, startsWithInt group]',
		data: ['3', '7 test', '9 test'],
		targetCount: 6,
		isNormalDirection: true,
		expected: ['4', '11 test', '13 test', '5', '15 test', '17 test']
	},
	{
		name: '[int group, startsWithInt group]',
		data: ['3', '6', '7 test', '9 test'],
		targetCount: 8,
		isNormalDirection: true,
		expected: ['9', '12', '11 test', '13 test', '15', '18', '15 test', '17 test']
	},
	{
		name: '[startsWithInt group, int group]',
		data: ['7 test', '9 test', '3', '6'],
		targetCount: 8,
		isNormalDirection: true,
		expected: ['11 test', '13 test', '9', '12', '15 test', '17 test', '15', '18']
	},

	{
		name: '[int group, copy, startsWithInt group]',
		data: ['3', '6', 'abc', '7 test', '9 test'],
		targetCount: 10,
		isNormalDirection: true,
		expected: ['9', '12', 'abc', '11 test', '13 test', '15', '18', 'abc', '15 test', '17 test']
	},
	{
		name: '[startsWithInt group, copy, int group]',
		data: ['7 test', '9 test', 'abc', '3', '6'],
		targetCount: 10,
		isNormalDirection: true,
		expected: ['11 test', '13 test', 'abc', '9', '12', '15 test', '17 test', 'abc', '15', '18']
	},

	{
		name: '[int group, copy, endsWithInt group]',
		data: ['3', '6', 'abc', 'test 7', 'test 9'],
		targetCount: 10,
		isNormalDirection: true,
		expected: ['9', '12', 'abc', 'test 11', 'test 13', '15', '18', 'abc', 'test 15', 'test 17']
	},
	{
		name: '[endsWithInt group, copy, int group]',
		data: ['test 7', 'test 9', 'abc', '3', '6'],
		targetCount: 10,
		isNormalDirection: true,
		expected: ['test 11', 'test 13', 'abc', '9', '12', 'test 15', 'test 17', 'abc', '15', '18']
	},

	{
		name: '[endsWithInt group, month name, copy, int group]',
		data: ['test 7', 'test 9', 'jan', 'abc', '3', '6'],
		targetCount: 12,
		isNormalDirection: true,
		expected: ['test 11', 'test 13', 'feb', 'abc', '9', '12', 'test 15', 'test 17', 'mar', 'abc', '15', '18']
	},
	{
		name: '[endsWithInt group, month name group, copy, int group]',
		data: ['test 7', 'test 9', 'jan', 'mar', 'abc', '3', '6'],
		targetCount: 14,
		isNormalDirection: true,
		expected: ['test 11', 'test 13', 'may', 'jul', 'abc', '9', '12', 'test 15', 'test 17', 'sep', 'nov', 'abc', '15', '18']
	},

	{
		name: '[startsWithInt group, month name, startsWithInt group] (groups are independend)',
		data: ['7 test', '9 test', 'jan', '3 test', '5 test'],
		targetCount: 10,
		isNormalDirection: true,
		expected: ['11 test', '13 test', 'feb', '7 test', '9 test', '15 test', '17 test', 'mar', '11 test', '13 test']
	},
	{
		name: '[endsWithInt group, month name, endsWithInt group] (groups are independend)',
		data: ['test 7', 'test 9', 'jan', 'test 3', 'test 5'],
		targetCount: 10,
		isNormalDirection: true,
		expected: ['test 11', 'test 13', 'feb', 'test 7', 'test 9', 'test 15', 'test 17', 'mar', 'test 11', 'test 13']
	},

	{
		name: '[date group, month name, date group] (groups are independend)',
		data: ['01.01.2020', '03.01.2020', 'jan', '01.09.2020', '04.09.2020'],
		targetCount: 10,
		isNormalDirection: true,
		expected: ['05.01.2020', '07.01.2020', 'feb', '07.09.2020', '10.09.2020', '09.01.2020', '11.01.2020', 'mar', '13.09.2020', '16.09.2020']
	},

	{
		name: '[month name group, int, month name group] (groups are independend)',
		data: ['jan', 'feb', '3', 'jan', 'mar'],
		targetCount: 8,
		isNormalDirection: true,
		expected: ['mar', 'apr', '4', 'may', 'jul', 'may', 'jun', '5']
	},
]

let allTests: AutoFillTestSuit[] = [
	{
		name: 'test different groups',
		tests: tests_differentGroups
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
