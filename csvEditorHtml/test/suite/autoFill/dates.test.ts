import { expect, test, suite } from 'vitest'
import { AutoFillTestData, AutoFillTestSuit } from './setup'


let test_dates_monthEdges: AutoFillTestData[] = [
	{
		name: 'date 01.01.2020, delta 1',
		data: ['01.01.2020'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['02.01.2020', '03.01.2020', '04.01.2020']
	},
	{
		name: 'month edges, date 31.01.2001, delta 1',
		data: ['31.01.2001'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['01.02.2001', '02.02.2001']
	},
	//february is special, already tested (leapyear and no leapyear)
	{
		name: 'leapyear date 28.02.2020, delta 1',
		data: ['28.02.2020'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['29.02.2020', '01.03.2020', '02.03.2020']
	},
	{
		name: 'no leapyear date 28.02.2001, delta 1',
		data: ['28.02.2001'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['01.03.2001', '02.03.2001', '03.03.2001']
	},

	{
		name: 'month edges, date 31.03.2001, delta 1',
		data: ['31.03.2001'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['01.04.2001', '02.04.2001']
	},
	{
		name: 'month edges, date 30.04.2001, delta 1',
		data: ['30.04.2001'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['01.05.2001', '02.05.2001']
	},
	{
		name: 'month edges, date 31.05.2001, delta 1',
		data: ['31.05.2001'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['01.06.2001', '02.06.2001']
	},
	{
		name: 'month edges, date 30.06.2001, delta 1',
		data: ['30.06.2001'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['01.07.2001', '02.07.2001']
	},
	{
		name: 'month edges, date 31.07.2001, delta 1',
		data: ['31.07.2001'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['01.08.2001', '02.08.2001']
	},
	{
		name: 'month edges, date 31.08.2001, delta 1',
		data: ['31.08.2001'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['01.09.2001', '02.09.2001']
	},
	{
		name: 'month edges, date 30.09.2001, delta 1',
		data: ['30.09.2001'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['01.10.2001', '02.10.2001']
	},
	{
		name: 'month edges, date 31.10.2001, delta 1',
		data: ['31.10.2001'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['01.11.2001', '02.11.2001']
	},
	{
		name: 'month edges, date 30.11.2001, delta 1',
		data: ['30.11.2001'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['01.12.2001', '02.12.2001']
	},
	{
		name: 'month edges, date 31.12.2001, delta 1',
		data: ['31.12.2001'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['01.01.2002', '02.01.2002']
	},
]

let test_dates_monthEdgesOtherDir: AutoFillTestData[] = [
	{
		name: 'date 01.01.2020, delta 1 (other dir)',
		data: ['01.01.2020'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['31.12.2019', '30.12.2019', '29.12.2019'].reverse()
	},
	{
		name: 'month edges, date 01.02.2001, delta 1 (other dir)',
		data: ['01.02.2001'],
		targetCount: 2,
		isNormalDirection: false,
		expected: ['31.01.2001', '30.01.2001'].reverse()
	},
	//february is special, already tested (leapyear and no leapyear)
	{
		name: 'leapyear date 01.03.2020, delta 1 (other dir)',
		data: ['01.03.2020'],
		targetCount: 2,
		isNormalDirection: false,
		expected: ['29.02.2020', '28.02.2020'].reverse()
	},
	{
		name: 'no leapyear date 01.03.2020, delta 1 (other dir)',
		data: ['01.03.2021'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['28.02.2021', '27.02.2021', '26.02.2021'].reverse()
	},

	{
		name: 'month edges, date 01.04.2001, delta 1 (other dir)',
		data: ['01.04.2001'],
		targetCount: 2,
		isNormalDirection: false,
		expected: ['31.03.2001', '30.03.2001'].reverse()
	},
	{
		name: 'month edges, date 01.05.2001, delta 1 (other dir)',
		data: ['01.05.2001'],
		targetCount: 2,
		isNormalDirection: false,
		expected: ['30.04.2001', '29.04.2001'].reverse()
	},
	{
		name: 'month edges, date 01.06.2001, delta 1 (other dir)',
		data: ['01.06.2001'],
		targetCount: 2,
		isNormalDirection: false,
		expected: ['31.05.2001', '30.05.2001'].reverse()
	},
	{
		name: 'month edges, date 01.07.2001, delta 1 (other dir)',
		data: ['01.07.2001'],
		targetCount: 2,
		isNormalDirection: false,
		expected: ['30.06.2001', '29.06.2001'].reverse()
	},
	{
		name: 'month edges, date 01.08.2001, delta 1 (other dir)',
		data: ['01.08.2001'],
		targetCount: 2,
		isNormalDirection: false,
		expected: ['31.07.2001', '30.07.2001'].reverse()
	},
	{
		name: 'month edges, date 01.09.2001, delta 1 (other dir)',
		data: ['01.09.2001'],
		targetCount: 2,
		isNormalDirection: false,
		expected: ['31.08.2001', '30.08.2001'].reverse()
	},
	{
		name: 'month edges, date 01.10.2001, delta 1 (other dir)',
		data: ['01.10.2001'],
		targetCount: 2,
		isNormalDirection: false,
		expected: ['30.09.2001', '29.09.2001'].reverse()
	},
	{
		name: 'month edges, date 01.11.2001, delta 1 (other dir)',
		data: ['01.11.2001'],
		targetCount: 2,
		isNormalDirection: false,
		expected: ['31.10.2001', '30.10.2001'].reverse()
	},
	{
		name: 'month edges, date 01.12.2001, delta 1 (other dir)',
		data: ['01.12.2001'],
		targetCount: 2,
		isNormalDirection: false,
		expected: ['30.11.2001', '29.11.2001'].reverse()
	},
]

let test_allSupportedFormats: AutoFillTestData[] = [
	//--- YYYY-MM-DD
	{
		name: 'YYYY-MM-DD, delta 1, separators . .',
		data: ['2020.02.03'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['2020.02.04']
	},
	{
		name: 'YYYY-MM-DD, delta 1, separators - -',
		data: ['2020-02-03'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['2020-02-04']
	},
	{
		name: 'YYYY-MM-DD, delta 1, separators / /',
		data: ['2020/02/03'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['2020/02/04']
	},
	//mixed
	{
		name: 'YYYY-MM-DD, delta 1, separators . -',
		data: ['2020.02-03'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['2020.02-04']
	},
	{
		name: 'YYYY-MM-DD, delta 1, separators - .',
		data: ['2020-02.03'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['2020-02.04']
	},
	{
		name: 'YYYY-MM-DD, delta 1, separators - /',
		data: ['2020-02/03'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['2020-02/04']
	},
	{
		name: 'YYYY-MM-DD, delta 1, separators / -',
		data: ['2020/02-03'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['2020/02-04']
	},
	{
		name: 'YYYY-MM-DD, delta 1, separators . /',
		data: ['2020.02/03'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['2020.02/04']
	},
	{
		name: 'YYYY-MM-DD, delta 1, separators / .',
		data: ['2020/02.03'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['2020/02.04']
	},

	//from now on, only one separator: .
	//--- YYYY-M-DD
	{
		name: 'YYYY-M-DD, delta 1',
		data: ['2020.2.03'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['2020.2.04']
	},
	{
		name: 'YYYY-MM-D, delta 1',
		data: ['2020.02.3'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['2020.02.4']
	},
	{
		name: 'YYYY-M-D, delta 1',
		data: ['2020.2.3'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['2020.2.4']
	},
	{
		name: 'DD-M-YYYY, delta 1',
		data: ['03.2.2020'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['04.2.2020']
	},
	{
		name: 'D-MM-YYYY, delta 1',
		data: ['3.02.2020'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['4.02.2020']
	},
	{
		name: 'D-M-YYYY, delta 1',
		data: ['3.2.2020'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['4.2.2020']
	},
	//03.02.2020
	{
		name: 'DD-MM-YY, delta 1',
		data: ['03.02.20'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['04.02.20']
	},
	{
		name: 'DD-M-YY, delta 1',
		data: ['03.2.20'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['04.2.20']
	},
	{
		name: 'D-MM-YY, delta 1',
		data: ['3.02.20'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['4.02.20']
	},
	{
		name: 'D-M-YY, delta 1',
		data: ['3.2.20'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['4.2.20']
	},
]

//deltas are [days, months, years]
let test_dates_deltas: AutoFillTestData[] = [
	{
		name: 'date 01.01.2020, deltas: [1, 0, 0]',
		data: ['01.01.2020', '02.01.2020'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['03.01.2020', '04.01.2020']
	},
	{
		name: 'date 01.01.2020, deltas: [0, 1, 0]',
		data: ['01.01.2020', '01.02.2020'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['01.03.2020', '01.04.2020']
	},
	{
		name: 'date 01.01.2020, deltas: [0, 0, 1]',
		data: ['01.01.2020', '01.01.2021'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['01.01.2022', '01.01.2023']
	},
	{
		name: 'date 01.01.2020, deltas: [1, 1, 0] -> [32, 0, 0]', //if diff in days is != 0, then we only use the distance in days
		data: ['01.01.2020', '02.02.2020'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['05.03.2020', '06.04.2020']
	},
	{
		name: 'date 01.01.2020, deltas: [1, 0, 1] -> [367, 0, 0]', //if diff in days is != 0, then we only use the distance in days
		data: ['01.01.2020', '01.01.2021'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['01.01.2022', '01.01.2023']
	},
	{
		name: 'date 01.01.2020, deltas: [0, 1, 1]',
		data: ['01.01.2020', '01.02.2021'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['01.03.2022', '01.04.2023']
	},
	{
		name: 'date 01.01.2020, deltas: [1, 1, 1] -> [398, 0, 0]', //if diff in days is != 0, then we only use the distance in days
		data: ['01.01.2020', '02.02.2021'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['07.03.2022', '09.04.2023']
	},
	//--- other deltas
	{
		name: 'date 01.01.2020, deltas: [3, 0, 0]', //if diff in days is != 0, then we only use the distance in days
		data: ['01.01.2020', '04.01.2020'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['07.01.2020', '10.01.2020']
	},
	{
		name: 'date 01.01.2020, deltas: [0, 3, 0]',
		data: ['01.01.2020', '01.04.2020'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['01.07.2020', '01.10.2020']
	},
	{
		name: 'date 01.01.2020, deltas: [0, 0, 3]',
		data: ['01.01.2020', '01.01.2023'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['01.01.2026', '01.01.2029']
	},
	{
		name: 'date 01.01.2020, deltas: [3, 2, 0] -> [63, 0, 0]', //if diff in days is != 0, then we only use the distance in days
		data: ['01.01.2020', '04.03.2020'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['06.05.2020', '08.07.2020']
	},
	{
		name: 'date 01.01.2020, deltas: [3, 0, 4] -> [1464, 0, 0]', //if diff in days is != 0, then we only use the distance in days
		data: ['01.01.2020', '04.01.2024'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['07.01.2028', '10.01.2032']
	},
	{
		name: 'date 01.01.2020, deltas: [0, 2, 3]',
		data: ['01.01.2020', '01.03.2023'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['01.05.2026', '01.07.2029']
	},
	{
		name: 'date 01.01.2020, deltas: [4, 3, 4] -> [1556, 0, 0]', //if diff in days is != 0, then we only use the distance in days
		data: ['01.01.2020', '05.04.2024'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['09.07.2028', '12.10.2032']
	},
	
	//--- special
	{
		name: 'date 11.12.2020, 11.01.2021, (0 year delta) deltas: [0, 1, 0]',
		data: ['11.12.2020', '11.01.2021'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['11.02.2021', '11.03.2021']
	},
	{
		name: 'date 30.12.2020, (0 year delta) deltas: [0, 1, 0]',
		data: ['30.12.2020', '30.01.2021'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['28.02.2021', '30.03.2021', '30.04.2021']
	},
	{
		name: 'date 30.12.2020, (0 year delta) deltas: [0, 13, 0]',
		data: ['30.12.2020', '30.01.2022'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['28.02.2023', '30.03.2024', '30.04.2025']
	},
	{
		name: 'date 30.06.2020, (0 year delta) deltas: [0, 11, 0]',
		data: ['30.06.2020', '30.05.2021'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['30.04.2022', '30.03.2023', '29.02.2024']
	},
	{
		name: 'date 30.06.20, (0 year delta) deltas: [0, 23, 0]',
		data: ['30.06.20', '30.05.22'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['30.04.24', '30.03.26', '29.02.28']
	},
	


]

let test_dates_defaultToCopy: AutoFillTestData[] = [
	{
		name: 'date 01.01.2020, different deltas days [1, 2]',
		data: ['01.01.2020', '02.01.2020', '04.01.2020'],
		targetCount: 5,
		isNormalDirection: true,
		expected: ['01.01.2020', '02.01.2020', '04.01.2020', '01.01.2020', '02.01.2020']
	},
]

let test_dates_invalid: AutoFillTestData[] = [
	{
		name: 'invalid date interpolation -> gets coerced to valid date (by dayjs)',
		data: ['30.11.2020', '30.12.2020'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['30.01.2021', '28.02.2021', '30.03.2021']
	},
	{
		name: 'date interpolation only value in cell 1, starts with int',
		data: ['30.11.2020 30.11.2020'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['31.11.2020 30.11.2020', '32.11.2020 30.11.2020']
	},
	{
		name: 'datem text, but date starts with int',
		data: ['30.11.2020 abc'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['31.11.2020 abc', '32.11.2020 abc']
	},
	{
		name: 'text, date, but date starts with int',
		data: ['abc 30.11.2020'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['abc 30.11.2021', 'abc 30.11.2022']
	},
	{
		name: 'text, date, text, but date starts with int',
		data: ['abc 30.11.2020 abc'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['abc 30.11.2020 abc', 'abc 30.11.2020 abc']
	},
	//--- 
	{
		name: 'valid date leapyear',
		data: ['29.02.2020'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['01.03.2020', '02.03.2020']
	},
	{
		name: 'invalid date will use first int (no leapyer)',
		data: ['29.02.2021'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['30.02.2021', '31.02.2021']
	},
	{
		name: 'invalid date will use first int (no leapyer) (other dir)',
		data: ['29.02.2021'],
		targetCount: 2,
		isNormalDirection: false,
		expected: ['28.02.2021', '27.02.2021'].reverse()
	},
	{
		name: 'starts with int and contains date',
		data: ['1 30.11.2020 abc'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['2 30.11.2020 abc', '3 30.11.2020 abc']
	},
	{
		name: 'date text int, but date starts with int',
		data: ['30.11.2020 abc 1'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['31.11.2020 abc 1', '32.11.2020 abc 1']
	},
	{
		name: 'starts with float and contains date',
		data: ['1.5 30.11.2020 abc'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['2.5 30.11.2020 abc', '3.5 30.11.2020 abc']
	},
]

//TODO invalid dates...

//TODO date with text -> copy or starts with float?

let allTests: AutoFillTestSuit[] = [
	{
		name: 'test date month edges',
		tests: test_dates_monthEdges
	},
	{
		name: 'test date month edges other direction',
		tests: test_dates_monthEdgesOtherDir
	},
	{
		name: 'test all supported formats',
		tests: test_allSupportedFormats
	},
	{
		name: 'test dates with deltas',
		tests: test_dates_deltas
	},
	{
		name: 'test dates default to copy',
		tests: test_dates_defaultToCopy
	},
	{
		name: 'test invalid dates',
		tests: test_dates_invalid
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

}
