import { expect, test, suite } from 'vitest'
import { AutoFillTestData, AutoFillTestSuit } from './types'


let tests_onlyFloatsLinearRegression: AutoFillTestData[] = [
	{
		name: 'increment by 1, 1 cell, 1 target count',
		data: ['1.3'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['2.3', '3.3', '4.3']
	},
	{
		name: 'increment by 1, int: 5, 3 target count',
		data: ['5.05'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['6.05', '7.05', '8.05']
	},
	{
		name: 'increment by 1, int: -5, 3 target count',
		data: ['-5.9'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['-4.9', '-3.9', '-2.9']
	},
	{
		name: 'increment by 2, int: 5',
		data: ['5.3', '7'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['8.7', '10.4', '12.1']
	},
	{
		name: 'increment by 2, int: [1, 3], always rounded to 2 decimals (only when interpolating)',
		data: ['1.5555', '3.5555'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['5.56', '7.56', '9.56']
	},
	{
		name: 'real regression 1, int: [1, 3, 8], always rounded to 2 decimals (only when interpolating)',
		data: ['1.5', '3.3', '8.9111111111'],
		targetCount: 5,
		isNormalDirection: true,
		expected: ['11.99', '15.7', '19.41', '23.12', '26.83']
	},
	{
		name: 'floats are rounded, even when only incrementing because of interpolation (not just plain add/sub)',
		data: ['1.5555'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['2.56', '3.56', '4.56']
	},
	{
		name: 'real regression 2, int: [23, 67, 89, 101]',
		data: ['23.5', '67.1', '89', '101.1'],
		targetCount: 7,
		isNormalDirection: true,
		expected: ['133.85', '159.32', '184.79', '210.26', '235.73', '261.2', '286.67']
	},
	{
		name: 'real regression 3, int: [5, 8, -2, 8, -4]',
		data: ['5.3', '8.3', '-2.3', '8.3', '-4.4'],
		targetCount: 5,
		isNormalDirection: true,
		expected: ['-2.78', '-4.72', '-6.66', '-8.6', '-10.54']
	},

	//--- other direction

	{
		name: 'decrement by 1, 1 cell, 1 target count (other dir)',
		data: ['1.3'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['0.3', '-0.7', '-1.7'].reverse()
	},
	{
		name: 'decrement by 1, int: 5, 3 target count (other dir)',
		data: ['5.05'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['4.05', '3.05', '2.05'].reverse()
	},
	{
		name: 'decrement by 1, int: -5, 3 target count (other dir)',
		data: ['-5.9'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['-6.9', '-7.9', '-8.9'].reverse()
	},
	{
		name: 'decrement by 2, int: 5 (other dir)',
		data: ['5.3', '7'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['3.6', '1.9', '0.2'].reverse()
	},
	{
		name: 'floats are rounded, even when only incrementing because of interpolation (not just plain add/sub) (other dir)',
		data: ['1.5555', '3.5555'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['-0.44', '-2.44', '-4.44'].reverse()
	},
	{
		name: 'real regression 1, int: [1, 3, 8], always rounded to 2 decimals (only when interpolating) (other dir)',
		data: ['1.5', '3.3', '8.9111111111'],
		targetCount: 5,
		isNormalDirection: false,
		expected: ['-2.85', '-6.56', '-10.27', '-13.98', '-17.69'].reverse()
	},
	{
		name: 'no rounding when only decrementing (other dir)',
		data: ['2.5555'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['1.56', '0.56', '-0.44'].reverse()
	},
	{
		name: 'real regression 2, int: [23, 67, 89, 101] (other dir)',
		data: ['23.5', '67.1', '89', '101.1'],
		targetCount: 7,
		isNormalDirection: false,
		expected: ['6.5', '-18.97', '-44.44', '-69.91', '-95.38', '-120.85', '-146.32'].reverse()
	},
	{
		name: 'real regression 3, int: [5, 8, -2, 8, -4] (other dir)',
		data: ['5.3', '8.3', '-2.3', '8.3', '-4.4'],
		targetCount: 5,
		isNormalDirection: false,
		expected: ['8.86', '10.8', '12.74', '14.68', '16.62'].reverse()
	},
]

let allTests: AutoFillTestSuit[] = [
	{
		name: 'test only floats linear regression',
		tests: tests_onlyFloatsLinearRegression
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
