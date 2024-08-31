import { expect, test, suite } from 'vitest'
import { AutoFillTestData, AutoFillTestSuit } from "./setup";


let tests_monthNames: AutoFillTestData[] = [
	{
		name: 'jan to feb',
		data: ['jan'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['feb']
	},
	{
		name: 'feb to mar',
		data: ['feb'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['mar']
	},
	{
		name: 'mar to apr',
		data: ['mar'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['apr']
	},
	{
		name: 'apr to may',
		data: ['apr'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['may']
	},
	{
		name: 'may to jun (special because may has only 3 letters -> full name)',
		data: ['may'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['june']
	},
	{
		name: 'jun to jul',
		data: ['jun'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['jul']
	},
	{
		name: 'jul to aug',
		data: ['jul'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['aug']
	},
	{
		name: 'aug to sep',
		data: ['aug'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['sep']
	},
	{
		name: 'sep to oct',
		data: ['sep'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['oct']
	},
	{
		name: 'oct to nov',
		data: ['oct'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['nov']
	},
	{
		name: 'nov to dec',
		data: ['nov'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['dec']
	},
	{
		name: 'dec to jan',
		data: ['dec'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['jan']
	},
	{
		name: 'jan target count 2',
		data: ['jan'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['feb', 'mar']
	},
	{
		name: 'jan target count 3',
		data: ['jan'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['feb', 'mar', 'apr']
	},
	{
		name: 'jan target count 13 (wrap around)',
		data: ['jan'],
		targetCount: 13,
		isNormalDirection: true,
		expected: ['feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb']
	},
	//--- delta > 1
	{
		name: 'jan, mar -> delta 2',
		data: ['jan', 'mar'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['may']
	},
	{
		name: 'jan, mar -> delta 2',
		data: ['jan', 'mar'],
		targetCount: 13,
		isNormalDirection: true,
		expected: ['may', 'jul', 'sep', 'nov', 'jan', 'mar', 'may', 'jul', 'sep', 'nov', 'jan', 'mar', 'may']
	},
	{
		name: 'feb, apr -> delta 2',
		data: ['feb', 'apr'],
		targetCount: 13,
		isNormalDirection: true,
		expected: ['jun', 'aug', 'oct', 'dec', 'feb', 'apr', 'jun', 'aug', 'oct', 'dec', 'feb', 'apr', 'jun']
	},
	{
		name: 'feb, apr -> delta 5 (no divider of 12)',
		data: ['jan', 'jun'],
		targetCount: 5,
		isNormalDirection: true,
		expected: ['nov', 'apr', 'sep', 'feb', 'jul']
	},

	// upper case information
	{
		name: 'feb, apr -> delta 2 upper case first',
		data: ['Feb', 'apr'],
		targetCount: 13,
		isNormalDirection: true,
		expected: ['Jun', 'aug', 'Oct', 'dec', 'Feb', 'apr', 'Jun', 'aug', 'Oct', 'dec', 'Feb', 'apr', 'Jun']
	},
	{
		name: 'feb, apr -> delta 2 upper case next',
		data: ['feb', 'Apr'],
		targetCount: 13,
		isNormalDirection: true,
		expected: ['jun', 'Aug', 'oct', 'Dec', 'feb', 'Apr', 'jun', 'Aug', 'oct', 'Dec', 'feb', 'Apr', 'jun']
	},
	{
		name: 'feb, apr -> delta 5 (no divider of 12) upper case all',
		data: ['Jan', 'Jun'],
		targetCount: 5,
		isNormalDirection: true,
		expected: ['Nov', 'Apr', 'Sep', 'Feb', 'Jul']
	},

	//--- other direction

	{
		name: 'jan delta 1 (other dir)',
		data: ['jan'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['dec']
	},
	{
		name: 'feb delta 1 (other dir)',
		data: ['feb'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['jan']
	},
	{
		name: 'mar delta 1 (other dir)',
		data: ['mar'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['feb']
	},
	{
		name: 'apr delta 1 (other dir)',
		data: ['apr'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['mar']
	},
	{
		name: 'may delta 1 (special case because may has only 3 letters -> use full name) (other dir)',
		data: ['may'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['april']
	},
	{
		name: 'jun delta 1 (other dir)',
		data: ['jun'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['may']
	},
	{
		name: 'jul delta 1 (other dir)',
		data: ['jul'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['jun']
	},
	{
		name: 'aug delta 1 (other dir)',
		data: ['aug'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['jul']
	},
	{
		name: 'sep delta 1 (other dir)',
		data: ['sep'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['aug']
	},
	{
		name: 'oct delta 1 (other dir)',
		data: ['oct'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['sep']
	},
	{
		name: 'nov delta 1 (other dir)',
		data: ['nov'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['oct']
	},
	{
		name: 'dec delta 1 (other dir)',
		data: ['dec'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['nov']
	},
	{
		name: 'jan target count 2 (other dir)',
		data: ['jan'],
		targetCount: 2,
		isNormalDirection: false,
		expected: ['dec', 'nov'].reverse()
	},
	{
		name: 'jan target count 3 (other dir)',
		data: ['jan'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['dec', 'nov', 'oct'].reverse()
	},
	{
		name: 'jan target count 13 (wrap around) (other dir)',
		data: ['jan'],
		targetCount: 13,
		isNormalDirection: false,
		expected: ['dec', 'nov', 'oct', 'sep', 'aug', 'jul', 'jun', 'may', 'apr', 'mar', 'feb', 'jan', 'dec'].reverse()
	},
	//--- delta > 1
	{
		name: 'jan, mar -> delta 2, target count 1 (other dir)',
		data: ['jan', 'mar'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['nov']
	},
	{
		name: 'jan, mar -> delta 2, target count 13 (other dir)',
		data: ['jan', 'mar'],
		targetCount: 13,
		isNormalDirection: false,
		expected: ['nov', 'sep', 'jul', 'may', 'mar', 'jan', 'nov', 'sep', 'jul', 'may', 'mar', 'jan', 'nov'].reverse()
	},
	{
		name: 'feb, apr -> delta 2 (other dir)',
		data: ['feb', 'apr'],
		targetCount: 13,
		isNormalDirection: false,
		expected: ['dec', 'oct', 'aug', 'jun', 'apr', 'feb', 'dec', 'oct', 'aug', 'jun', 'apr', 'feb', 'dec'].reverse()
	},
	{
		name: 'feb, apr -> delta 5 (no divider of 12) (other dir)',
		data: ['jan', 'jun'],
		targetCount: 5,
		isNormalDirection: false,
		expected: ['aug', 'mar', 'oct', 'may', 'dec'].reverse()
	},

	// upper case information
	{
		name: 'feb, apr -> delta 2 upper case first (other dir)',
		data: ['Feb', 'apr'],
		targetCount: 13,
		isNormalDirection: true,
		expected: ['Jun', 'aug', 'Oct', 'dec', 'Feb', 'apr', 'Jun', 'aug', 'Oct', 'dec', 'Feb', 'apr', 'Jun']
	},
	{
		name: 'feb, apr -> delta 2 upper case next (other dir)',
		data: ['feb', 'Apr'],
		targetCount: 13,
		isNormalDirection: true,
		expected: ['jun', 'Aug', 'oct', 'Dec', 'feb', 'Apr', 'jun', 'Aug', 'oct', 'Dec', 'feb', 'Apr', 'jun']
	},
	{
		name: 'feb, apr -> delta 5 (no divider of 12) upper case all (other dir)',
		data: ['Jan', 'Jun'],
		targetCount: 5,
		isNormalDirection: true,
		expected: ['Nov', 'Apr', 'Sep', 'Feb', 'Jul']
	},
]

let tests_monthNamesFull: AutoFillTestData[] = [
	{
		name: 'january to february',
		data: ['january'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['february']
	},
	{
		name: 'february to march',
		data: ['february'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['march']
	},
	{
		name: 'march to april',
		data: ['march'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['april']
	},
	{
		name: 'april to may',
		data: ['april'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['may']
	},
	{
		name: 'may to june',
		data: ['may'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['june']
	},
	{
		name: 'june to july',
		data: ['june'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['july']
	},
	{
		name: 'july to august',
		data: ['july'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['august']
	},
	{
		name: 'august to september',
		data: ['august'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['september']
	},
	{
		name: 'september to october',
		data: ['september'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['october']
	},
	{
		name: 'october to november',
		data: ['october'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['november']
	},
	{
		name: 'november to december',
		data: ['november'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['december']
	},
	{
		name: 'december to january',
		data: ['december'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['january']
	},
	{
		name: 'january target count 2',
		data: ['january'],
		targetCount: 2,
		isNormalDirection: true,
		expected: ['february', 'march']
	},
	{
		name: 'january target count 3',
		data: ['january'],
		targetCount: 3,
		isNormalDirection: true,
		expected: ['february', 'march', 'april']
	},
	{
		name: 'january target count 13 (wrap around)',
		data: ['january'],
		targetCount: 13,
		isNormalDirection: true,
		expected: ['february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', 'january', 'february']
	},
	//--- delta > 1
	{
		name: 'january, march -> delta 2',
		data: ['january', 'march'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['may']
	},
	{
		name: 'january, march -> delta 2',
		data: ['january', 'march'],
		targetCount: 13,
		isNormalDirection: true,
		expected: ['may', 'july', 'september', 'november', 'january', 'march', 'may', 'july', 'september', 'november', 'january', 'march', 'may']
	},
	{
		name: 'february, april -> delta 2',
		data: ['february', 'april'],
		targetCount: 13,
		isNormalDirection: true,
		expected: ['june', 'august', 'october', 'december', 'february', 'april', 'june', 'august', 'october', 'december', 'february', 'april', 'june']
	},
	{
		name: 'february, april -> delta 5 (no divider of 12)',
		data: ['january', 'june'],
		targetCount: 5,
		isNormalDirection: true,
		expected: ['november', 'april', 'september', 'february', 'july']
	},

	// upper case information
	{
		name: 'february, april -> delta 2 upper case first',
		data: ['February', 'april'],
		targetCount: 13,
		isNormalDirection: true,
		expected: ['June', 'august', 'October', 'december', 'February', 'april', 'June', 'august', 'October', 'december', 'February', 'april', 'June']
	},
	{
		name: 'february, april -> delta 2 upper case next',
		data: ['february', 'April'],
		targetCount: 13,
		isNormalDirection: true,
		expected: ['june', 'August', 'october', 'December', 'february', 'April', 'june', 'August', 'october', 'December', 'february', 'April', 'june']
	},
	{
		name: 'february, april -> delta 5 (no divider of 12) upper case all',
		data: ['January', 'June'],
		targetCount: 5,
		isNormalDirection: true,
		expected: ['November', 'April', 'September', 'February', 'July']
	},

	//--- other direction

	{
		name: 'january delta 1 (other dir)',
		data: ['january'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['december']
	},
	{
		name: 'february delta 1 (other dir)',
		data: ['february'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['january']
	},
	{
		name: 'march delta 1 (other dir)',
		data: ['march'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['february']
	},
	{
		name: 'april delta 1 (other dir)',
		data: ['april'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['march']
	},
	{
		name: 'may delta 1 (other dir)',
		data: ['may'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['april']
	},
	{
		name: 'june delta 1 (other dir)',
		data: ['june'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['may']
	},
	{
		name: 'july delta 1 (other dir)',
		data: ['july'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['june']
	},
	{
		name: 'august delta 1 (other dir)',
		data: ['august'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['july']
	},
	{
		name: 'september delta 1 (other dir)',
		data: ['september'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['august']
	},
	{
		name: 'october delta 1 (other dir)',
		data: ['october'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['september']
	},
	{
		name: 'november delta 1 (other dir)',
		data: ['november'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['october']
	},
	{
		name: 'december delta 1 (other dir)',
		data: ['december'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['november']
	},
	{
		name: 'january target count 2 (other dir)',
		data: ['january'],
		targetCount: 2,
		isNormalDirection: false,
		expected: ['december', 'november'].reverse()
	},
	{
		name: 'january target count 3 (other dir)',
		data: ['january'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['december', 'november', 'october'].reverse()
	},
	{
		name: 'january target count 13 (wrap around) (other dir)',
		data: ['january'],
		targetCount: 13,
		isNormalDirection: false,
		expected: ['december', 'november', 'october', 'september', 'august', 'july', 'june', 'may', 'april', 'march', 'february', 'january', 'december'].reverse()
	},
	//--- delta > 1
	{
		name: 'january, march -> delta 2 (other dir)',
		data: ['january', 'march'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['november']
	},
	{
		name: 'january, march -> delta 2 (other dir)',
		data: ['january', 'march'],
		targetCount: 13,
		isNormalDirection: false,
		expected: ['november', 'september', 'july', 'may', 'march', 'january', 'november', 'september', 'july', 'may', 'march', 'january', 'november'].reverse()
	},
	{
		name: 'february, april -> delta 2 (other dir)',
		data: ['february', 'april'],
		targetCount: 13,
		isNormalDirection: false,
		expected: ['december', 'october', 'august', 'june', 'april', 'february', 'december', 'october', 'august', 'june', 'april', 'february', 'december'].reverse()
	},
	{
		name: 'february, april -> delta 5 (no divider of 12) (other dir)',
		data: ['january', 'june'],
		targetCount: 5,
		isNormalDirection: false,
		expected: ['august', 'march', 'october', 'may', 'december'].reverse()
	},

	// upper case information
	{
		name: 'february, april -> delta 2 upper case first (other dir)',
		data: ['February', 'april'],
		targetCount: 13,
		isNormalDirection: false,
		expected: ['december', 'October', 'august', 'June', 'april', 'February', 'december', 'October', 'august', 'June', 'april', 'February', 'december'].reverse()
	},
	{
		name: 'february, April (full) -> delta 2 upper case next (other dir)',
		data: ['february', 'April'],
		targetCount: 13,
		isNormalDirection: false,
		expected: ['December', 'october', 'August', 'june', 'April', 'february', 'December', 'october', 'August', 'june', 'April', 'february', 'December'].reverse()
	},
	{
		name: 'february, april -> delta 5 (no divider of 12) upper case all (other dir)',
		data: ['January', 'June'],
		targetCount: 5,
		isNormalDirection: false,
		expected: ['August', 'March', 'October', 'May', 'December'].reverse()
	},
]


let allTests: AutoFillTestSuit[] = [
	{
		name: 'month names tests',
		tests: tests_monthNames
	},
	{
		name: 'month names full tests',
		tests: tests_monthNamesFull
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
