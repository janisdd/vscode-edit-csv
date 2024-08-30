import { expect, test, suite } from 'vitest'


let tests_copyOnly: AutoFillTestData[] = [
	{
		name: 'only 1 target count with different data',
		data: ['4', 'b', '8'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['5']
	},
	{
		name: 'only 2 target count with different data',
		data: ['4', 'b', '8'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['5', 'b']
	},
	{
		name: 'only 3 target count with different data',
		data: ['4', 'b', '8'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['5', 'b', '9'],
	},
	{
		name: '1 more target count than data',
		data: ['4', 'b', '8'],
		targetCount: 4,
		isNormalDirection: true,
		expected: ['5', 'b', '9', '6'],
	},
	{
		name: '2 more target count than data',
		data: ['4', 'b', '8'],
		targetCount: 5,
		isNormalDirection: true,
		expected: ['5', 'b', '9', '6', 'b'],
	},
	{
		name: '3 more target count than data',
		data: ['4', 'b', '8'],
		targetCount: 6,
		isNormalDirection: true,
		expected: ['5', 'b', '9', '6', 'b', '10'],
	},
	{
		name: '1 more target count than data (wrap around 2x)',
		data: ['4', 'b', '8'],
		targetCount: 7,
		isNormalDirection: true,
		expected: ['5', 'b', '9', '6', 'b', '10', '7'],
	},
	{
		name: '2 more target count than data (wrap around 2x)',
		data: ['4', 'b', '8'],
		targetCount: 8,
		isNormalDirection: true,
		expected: ['5', 'b', '9', '6', 'b', '10', '7', 'b'],
	},
	{
		name: '3 more target count than data (wrap around 2x)',
		data: ['4', 'b', '8'],
		targetCount: 9,
		isNormalDirection: true,
		expected: ['5', 'b', '9', '6', 'b', '10', '7', 'b', '11'],
	},

	//--- other direction

	{
		name: 'only 1 target count with different data (other direction)',
		data: ['4', 'b', '8'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['7']
	},
	{
		name: 'only 2 target count with different data  (other direction)',
		data: ['4', 'b', '8'],
		targetCount: 2,
		isNormalDirection: false,
		expected: ['7', 'b'].reverse(),
	},
	{
		name: 'only 3 target count with different data  (other direction)',
		data: ['4', 'b', '8'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['7', 'b', '3'].reverse(),
	},
	{
		name: '1 more target count than data  (other direction)',
		data: ['4', 'b', '8'],
		targetCount: 4,
		isNormalDirection: false,
		expected: ['7', 'b', '3', '6'].reverse(),
	},
	{
		name: '2 more target count than data  (other direction)',
		data: ['4', 'b', '8'],
		targetCount: 5,
		isNormalDirection: false,
		expected: ['7', 'b', '3', '6', 'b'].reverse(),
	},
	{
		name: '3 more target count than data  (other direction)',
		data: ['4', 'b', '8'],
		targetCount: 6,
		isNormalDirection: false,
		expected: ['7', 'b', '3', '6', 'b', '2'].reverse(),
	},
	{
		name: '1 more target count than data (wrap around 2x)  (other direction)',
		data: ['4', 'b', '8'],
		targetCount: 7,
		isNormalDirection: false,
		expected: ['7', 'b', '3', '6', 'b', '2', '5'].reverse(),
	},
	{
		name: '2 more target count than data (wrap around 2x)  (other direction)',
		data: ['4', 'b', '8'],
		targetCount: 8,
		isNormalDirection: false,
		expected: ['7', 'b', '3', '6', 'b', '2', '5', 'b'].reverse(),
	},
	{
		name: '3 more target count than data (wrap around 2x)  (other direction)',
		data: ['4', 'b', '8'],
		targetCount: 9,
		isNormalDirection: false,
		expected: ['7', 'b', '3', '6', 'b', '2', '5', 'b', '1'].reverse(),
	},
]


let tests_numbersInts: AutoFillTestData[] = [
	{
		name: 'normal direction',
		data: ['1', '2', '3'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['4']
	}
]

let tests_numbersFloats: AutoFillTestData[] = [
	{
		name: 'normal direction',
		data: ['1', '2', '3'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['4']
	}
]


let tests_dates: AutoFillTestData[] = [
	{
		name: 'normal direction',
		data: ['1', '2', '3'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['4']
	}
]

//TODO different groups
//TODO contains float??


let allTests: AutoFillTestSuit[] = [
	{
		name: 'copy only tests',
		tests: tests_copyOnly
	},
	{
		name: 'numbers (ints) tests',
		tests: tests_numbersInts
	},
	{
		name: 'numbers (floats) tests',
		tests: tests_numbersFloats
	},
	{
		name: 'month names tests',
		tests: tests_monthNames
	},
	{
		name: 'month names full tests',
		tests: tests_monthNamesFull
	},
	{
		name: 'dates tests',
		tests: tests_dates
	}
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

	if (i === 0) break

}