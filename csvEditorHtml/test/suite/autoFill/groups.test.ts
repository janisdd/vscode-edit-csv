import { expect, test, suite } from 'vitest'
import { AutoFillTestData, AutoFillTestSuit } from './types'


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

	//--- other direction

	{
		name: '[int group, copy] target 1 selected data 3 (other dir)',
		data: ['1', '2', 'a'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['a']
	},
	{
		name: '[int group, copy] target 2 than selected data 3 (other dir)',
		data: ['1', '2', 'a'],
		targetCount: 2,
		isNormalDirection: false,
		expected: ['a', '0'].reverse()
	},
	{
		name: '[int group, copy] (other dir)',
		data: ['1', '2', 'a'],
		targetCount: 6,
		isNormalDirection: false,
		expected: ['a', '0', '-1', 'a', '-2', '-3'].reverse()
	},
	{
		name: '[int group, copy, copy] (other dir)',
		data: ['1', '2', 'a', 'b'],
		targetCount: 8,
		isNormalDirection: false,
		expected: ['b', 'a', '0', '-1', 'b', 'a', '-2', '-3'].reverse()
	},
	{
		name: '[int group, copy, int group] (other dir)',
		data: ['1', '2', 'a', '3', '5'],
		targetCount: 10,
		isNormalDirection: false,
		expected: ['1', '-1', 'a', '0', '-1', '-3', '-5', 'a', '-2', '-3'].reverse()
	},
	{
		name: '[int group, copy, int group, copy] (other dir)',
		data: ['1', '2', 'a', '3', '5', 'abc 1 xyz'],
		targetCount: 12,
		isNormalDirection: false,
		expected: ['abc 1 xyz', '1', '-1', 'a',  '0', '-1', 'abc 1 xyz', '-3', '-5', 'a', '-2', '-3'].reverse()
	},
	{
		name: '[copy, int group, copy, int group] (other dir)',
		data: ['abc 1 xyz', '1', '2', 'a', '3', '5'],
		targetCount: 12,
		isNormalDirection: false,
		expected: ['1', '-1', 'a', '0', '-1',  'abc 1 xyz', '-3', '-5', 'a', '-2', '-3', 'abc 1 xyz'].reverse()
	},
	{
		name: '[int, startsWithInt] (other dir)',
		data: ['3', '7 test'],
		targetCount: 4,
		isNormalDirection: false,
		expected: ['6 test', '2', '5 test', '1'].reverse()
	},
	{
		name: '[int, startsWithInt group] (other dir)',
		data: ['3', '7 test', '9 test'],
		targetCount: 6,
		isNormalDirection: false,
		expected: ['5 test', '3 test', '2', '1 test', '-1 test', '1'].reverse()
	},
	{
		name: '[int group, startsWithInt group] (other dir)',
		data: ['3', '6', '7 test', '9 test'],
		targetCount: 8,
		isNormalDirection: false,
		expected: ['5 test', '3 test', '0', '-3', '1 test', '-1 test', '-6', '-9'].reverse()
	},
	{
		name: '[startsWithInt group, int group] (other dir)',
		data: ['7 test', '9 test', '3', '6'],
		targetCount: 8,
		isNormalDirection: false,
		expected: ['0', '-3', '5 test', '3 test', '-6', '-9', '1 test', '-1 test'].reverse()
	},

	{
		name: '[int group, copy, startsWithInt group] (other dir)',
		data: ['3', '6', 'abc', '7 test', '9 test'],
		targetCount: 10,
		isNormalDirection: false,
		expected: ['5 test', '3 test', 'abc', '0', '-3', '1 test', '-1 test', 'abc', '-6', '-9'].reverse()
	},
	{
		name: '[startsWithInt group, copy, int group] (other dir)',
		data: ['7 test', '9 test', 'abc', '3', '6'],
		targetCount: 10,
		isNormalDirection: false,
		expected: ['0', '-3', 'abc', '5 test', '3 test', '-6', '-9', 'abc', '1 test', '-1 test'].reverse()
	},

	{
		name: '[int group, copy, endsWithInt group] (other dir)',
		data: ['3', '6', 'abc', 'test 7', 'test 9'],
		targetCount: 10,
		isNormalDirection: false,
		expected: ['test 5', 'test 3', 'abc', '0', '-3', 'test 1', 'test -1', 'abc', '-6', '-9'].reverse()
	},
	{
		name: '[endsWithInt group, copy, int group] (other dir)',
		data: ['test 7', 'test 9', 'abc', '3', '6'],
		targetCount: 10,
		isNormalDirection: false,
		expected: ['0', '-3', 'abc', 'test 5', 'test 3', '-6', '-9', 'abc', 'test 1', 'test -1'].reverse()
	},

	{
		name: '[endsWithInt group, month name, copy, int group] (other dir)',
		data: ['test 7', 'test 9', 'jan', 'abc', '3', '6'],
		targetCount: 12,
		isNormalDirection: false,
		expected: ['0', '-3', 'abc', 'dec', 'test 5', 'test 3', '-6', '-9', 'abc', 'nov', 'test 1', 'test -1'].reverse()
	},
	{
		name: '[endsWithInt group, month name group, copy, int group] (other dir)',
		data: ['test 7', 'test 9', 'jan', 'mar', 'abc', '3', '6'],
		targetCount: 14,
		isNormalDirection: false,
		expected: ['0', '-3', 'abc', 'nov', 'sep', 'test 5', 'test 3', '-6', '-9', 'abc', 'jul', 'may', 'test 1', 'test -1'].reverse()
	},

	{
		name: '[startsWithInt group, month name, startsWithInt group] (groups are independend) (other dir)',
		data: ['7 test', '9 test', 'jan', '3 test', '5 test'],
		targetCount: 10,
		isNormalDirection: false,
		expected: ['1 test', '-1 test', 'dec', '5 test', '3 test', '-3 test', '-5 test', 'nov', '1 test', '-1 test'].reverse()
	},
	{
		name: '[endsWithInt group, month name, endsWithInt group] (groups are independend) (other dir)',
		data: ['test 7', 'test 9', 'jan', 'test 3', 'test 5'],
		targetCount: 10,
		isNormalDirection: false,
		expected: ['test 1', 'test -1', 'dec', 'test 5', 'test 3', 'test -3', 'test -5', 'nov', 'test 1', 'test -1'].reverse()
	},

	{
		name: '[date group, month name, date group] (groups are independend) (other dir)',
		data: ['01.01.2020', '03.01.2020', 'jan', '01.09.2020', '04.09.2020'],
		targetCount: 10,
		isNormalDirection: false,
		expected: ['29.08.2020', '26.08.2020', 'dec', '30.12.2019', '28.12.2019', '23.08.2020', '20.08.2020', 'nov', '26.12.2019', '24.12.2019'].reverse()
	},

	{
		name: '[month name group, int, month name group] (groups are independend) (other dir)',
		data: ['jan', 'feb', '3', 'jan', 'mar'],
		targetCount: 8,
		isNormalDirection: false,
		expected: ['nov', 'sep', '2', 'dec', 'nov', 'jul', 'may', '1'].reverse()
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
