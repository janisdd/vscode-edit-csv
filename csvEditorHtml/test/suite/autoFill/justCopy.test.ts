import { expect, test, suite } from 'vitest'
import { AutoFillTestData, AutoFillTestSuit } from './types'


let tests_justCopy: AutoFillTestData[] = [
	{
		name: 'just copy, 1 cell, 1 target',
		data: ['test'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['test']
	},
	{
		name: 'just copy, 1 cell, 3 target',
		data: ['test'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['test', 'test', 'test']
	},

	{
		name: 'just copy, 2 cells, 1 target',
		data: ['test', 'xyz'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['test']
	},
	{
		name: 'just copy, 2 cells, 2 target',
		data: ['test', 'xyz'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['test', 'xyz']
	},
	{
		name: 'just copy, 2 cells, 3 target',
		data: ['test', 'xyz'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['test', 'xyz', 'test']
	},
	{
		name: 'just copy, 2 cells, 4 target',
		data: ['test', 'xyz'],
		targetCount: 4,
		isNormalDirection: true,
		expected: ['test', 'xyz', 'test', 'xyz']
	},
	{
		name: 'just copy, 1 cell, 1 target (ends with number)',
		data: ['test', 'test2'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['test', 'test3']
	},
	//--- other dir
	{
		name: 'just copy, 1 cell, 1 targe target (other dir)t',
		data: ['test'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['test']
	},
	{
		name: 'just copy, 1 cell, 3 target target (other dir)',
		data: ['test'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['test', 'test', 'test'].reverse()
	},

	{
		name: 'just copy, 2 cells, 1 target target (other dir)',
		data: ['test', 'xyz'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['xyz']
	},
	{
		name: 'just copy, 2 cells, 2 target target (other dir)',
		data: ['test', 'xyz'],
		targetCount: 2,
		isNormalDirection: false,
		expected: ['xyz', 'test'].reverse()
	},
	{
		name: 'just copy, 2 cells, 3 target target (other dir)',
		data: ['test', 'xyz'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['xyz', 'test', 'xyz'].reverse()
	},
	{
		name: 'just copy, 2 cells, 4 target (other dir)',
		data: ['test', 'xyz'],
		targetCount: 4,
		isNormalDirection: false,
		expected: ['xyz', 'test', 'xyz', 'test'].reverse()
	},
	{
		name: 'just copy, 1 cell, 1 target (ends with number) (other dir)',
		data: ['test', 'test2'],
		targetCount: 2,
		isNormalDirection: false,
		expected: ['test1', 'test'].reverse()
	},
]

let allTests: AutoFillTestSuit[] = [
	{
		name: 'just copy',
		tests: tests_justCopy
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
