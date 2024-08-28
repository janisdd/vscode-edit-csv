import { expect, test, suite } from 'vitest'

type AutoFillTestSuit = {
	name: string
	tests: AutoFillTestData[]
}

type AutoFillTestData = {
	name: string
	data: string[]
	targetCount: number
	/**
	 * true: is down or right, false: is up or left (reverse)
	 */
	isNormalDirection: boolean
	expected: string[]
}

//TODO const are not added to window, functions are
const knownNumberStylesMap: KnownNumberStylesMap = {
	"en": {
		key: 'en',
		/**
		 * this allows:
		 * 0(000)
		 * 0(000).0(000)
		 * .0(000)
		 * all repeated with - in front (negative numbers)
		 * all repeated with e0(000) | e+0(000) | e-0(000)
		 */
		regex: /-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?/,
		regexStartToEnd: /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/,
		thousandSeparator: /(\,| )/gm,
		thousandSeparatorReplaceRegex: /((\,| )\d{3})+/gm
	},
	"non-en": {
		key: 'non-en',
		/**
		 * this allows:
		 * 0(000)
		 * 0(000),0(000)
		 * ,0(000)
		 * all repeated with - in front (negative numbers)
		 * all repeated with e0(000) | e+0(000) | e-0(000)
		 */
		regex: /-?(\d+(\,\d*)?|\,\d+)(e[+-]?\d+)?/,
		regexStartToEnd: /^-?(\d+(\,\d*)?|\,\d+)(e[+-]?\d+)?$/,
		thousandSeparator: /(\.| )/gm,
		thousandSeparatorReplaceRegex: /((\.| )\d{3})+/gm
	}
}

function getNumbersStyleFromUi(): NumbersStyle {
	return knownNumberStylesMap['en']
}
window.getNumbersStyleFromUi = getNumbersStyleFromUi

//add toFormat to big numbers
//@ts-ignore
toFormat(Big)

// special test
test('holding alt will copy only (uses handsontable default auto fill func)', async function () {
	let result = customAutoFillFunc(['1', '2', '3'], 1, true, { altKey: true } as MouseEvent)
	expect(result).toEqual([])
})

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

let tests_containsBumbersInts: AutoFillTestData[] = [
	{
		name: 'normal direction',
		data: ['1', '2', '3'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['4']
	}
]

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
		name: 'may to jun',
		data: ['may'],
		targetCount: 1,
		isNormalDirection: true,
		expected: ['jun']
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
		expected: ['Jun', 'aug', 'Oct', 'dec', 'Feb', 'apr', 'Jun', 'Aug', 'oct', 'Dec', 'feb', 'Apr', 'jun']
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
		name: 'jan delta 1',
		data: ['jan'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['dec']
	},
	{
		name: 'feb delta 1',
		data: ['feb'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['jan']
	},
	{
		name: 'mar delta 1',
		data: ['mar'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['feb']
	},
	{
		name: 'apr delta 1',
		data: ['apr'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['mar']
	},
	{
		name: 'may delta 1',
		data: ['may'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['apr']
	},
	{
		name: 'jun delta 1',
		data: ['jun'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['may']
	},
	{
		name: 'jul delta 1',
		data: ['jul'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['jun']
	},
	{
		name: 'aug delta 1',
		data: ['aug'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['jul']
	},
	{
		name: 'sep delta 1',
		data: ['sep'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['aug']
	},
	{
		name: 'oct delta 1',
		data: ['oct'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['sep']
	},
	{
		name: 'nov delta 1',
		data: ['nov'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['oct']
	},
	{
		name: 'dec delta 1',
		data: ['dec'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['nov']
	},
	{
		name: 'jan target count 2',
		data: ['jan'],
		targetCount: 2,
		isNormalDirection: false,
		expected: ['dec', 'nov']
	},
	{
		name: 'jan target count 3',
		data: ['jan'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['dec', 'nov', 'oct']
	},
	{
		name: 'jan target count 13 (wrap around)',
		data: ['jan'],
		targetCount: 13,
		isNormalDirection: false,
		expected: ['dec', 'nov', 'oct', 'sep', 'aug', 'jul', 'jun', 'may', 'apr', 'mar', 'feb', 'jan', 'dec']
	},
	//--- delta > 1
	{
		name: 'jan, mar -> delta 2',
		data: ['jan', 'mar'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['nov']
	},
	{
		name: 'jan, mar -> delta 2',
		data: ['jan', 'mar'],
		targetCount: 13,
		isNormalDirection: false,
		expected: ['nov', 'sep', 'jul', 'may', 'mar', 'jan', 'nov', 'sep', 'jul', 'may', 'mar', 'jan', 'nov']
	},
	{
		name: 'feb, apr -> delta 2',
		data: ['feb', 'apr'],
		targetCount: 13,
		isNormalDirection: false,
		expected: ['dec', 'oct', 'aug', 'jun', 'apr', 'feb', 'dec', 'oct', 'aug', 'jun', 'apr', 'feb', 'dec']
	},
	{
		name: 'feb, apr -> delta 5 (no divider of 12)',
		data: ['jan', 'jun'],
		targetCount: 5,
		isNormalDirection: false,
		expected: ['aug', 'mar', 'oct', 'may', 'dec']
	},

	// upper case information
	{
		name: 'feb, apr -> delta 2 upper case first',
		data: ['Feb', 'apr'],
		targetCount: 13,
		isNormalDirection: true,
		expected: ['Nov', 'sep', 'Jul', 'may', 'Mar', 'jan', 'Nov', 'sep', 'Jul', 'May', 'mar', 'Jan', 'nov']
	},
	{
		name: 'feb, apr -> delta 2 upper case next',
		data: ['feb', 'Apr'],
		targetCount: 13,
		isNormalDirection: true,
		expected: ['dec', 'Oct', 'aug', 'Jun', 'apr', 'Feb', 'dec', 'Oct', 'aug', 'Jun', 'apr', 'Feb', 'dec']
	},
	{
		name: 'feb, apr -> delta 5 (no divider of 12) upper case all',
		data: ['Jan', 'Jun'],
		targetCount: 5,
		isNormalDirection: true,
		expected: ['Aug', 'Mar', 'Oct', 'May', 'Dec']
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
		expected: ['June', 'august', 'October', 'december', 'February', 'april', 'June', 'August', 'october', 'December', 'february', 'april', 'june']
	},
	{
		name: 'february, april -> delta 2 upper case next',
		data: ['february', 'april'],
		targetCount: 13,
		isNormalDirection: true,
		expected: ['june', 'August', 'october', 'December', 'february', 'april', 'june', 'August', 'october', 'December', 'february', 'april', 'june']
	},
	{
		name: 'february, april -> delta 5 (no divider of 12) upper case all',
		data: ['January', 'June'],
		targetCount: 5,
		isNormalDirection: true,
		expected: ['November', 'april', 'September', 'February', 'July']
	},

	//--- other direction

	{
		name: 'january delta 1',
		data: ['january'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['december']
	},
	{
		name: 'february delta 1',
		data: ['february'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['january']
	},
	{
		name: 'march delta 1',
		data: ['march'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['february']
	},
	{
		name: 'april delta 1',
		data: ['april'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['march']
	},
	{
		name: 'may delta 1',
		data: ['may'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['april']
	},
	{
		name: 'june delta 1',
		data: ['june'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['may']
	},
	{
		name: 'july delta 1',
		data: ['july'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['june']
	},
	{
		name: 'august delta 1',
		data: ['august'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['july']
	},
	{
		name: 'september delta 1',
		data: ['september'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['august']
	},
	{
		name: 'october delta 1',
		data: ['october'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['september']
	},
	{
		name: 'november delta 1',
		data: ['november'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['october']
	},
	{
		name: 'december delta 1',
		data: ['december'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['november']
	},
	{
		name: 'january target count 2',
		data: ['january'],
		targetCount: 2,
		isNormalDirection: false,
		expected: ['december', 'november']
	},
	{
		name: 'january target count 3',
		data: ['january'],
		targetCount: 3,
		isNormalDirection: false,
		expected: ['december', 'november', 'october']
	},
	{
		name: 'january target count 13 (wrap around)',
		data: ['january'],
		targetCount: 13,
		isNormalDirection: false,
		expected: ['december', 'november', 'october', 'september', 'august', 'july', 'june', 'may', 'april', 'march', 'february', 'january', 'december']
	},
	//--- delta > 1
	{
		name: 'january, march -> delta 2',
		data: ['january', 'march'],
		targetCount: 1,
		isNormalDirection: false,
		expected: ['november']
	},
	{
		name: 'january, march -> delta 2',
		data: ['january', 'march'],
		targetCount: 13,
		isNormalDirection: false,
		expected: ['november', 'september', 'july', 'may', 'march', 'january', 'november', 'september', 'july', 'may', 'march', 'january', 'november']
	},
	{
		name: 'february, april -> delta 2',
		data: ['february', 'april'],
		targetCount: 13,
		isNormalDirection: false,
		expected: ['december', 'october', 'august', 'june', 'april', 'february', 'december', 'october', 'august', 'june', 'april', 'february', 'december']
	},
	{
		name: 'february, april -> delta 5 (no divider of 12)',
		data: ['january', 'june'],
		targetCount: 5,
		isNormalDirection: false,
		expected: ['august', 'march', 'october', 'may', 'december']
	},

	// upper case information
	{
		name: 'february, april -> delta 2 upper case first',
		data: ['February', 'april'],
		targetCount: 13,
		isNormalDirection: true,
		expected: ['November', 'september', 'July', 'may', 'Mar', 'january', 'November', 'september', 'July', 'May', 'march', 'January', 'november']
	},
	{
		name: 'february, april -> delta 2 upper case next',
		data: ['february', 'april'],
		targetCount: 13,
		isNormalDirection: true,
		expected: ['december', 'October', 'august', 'June', 'april', 'February', 'december', 'October', 'august', 'June', 'april', 'February', 'december']
	},
	{
		name: 'february, april -> delta 5 (no divider of 12) upper case all',
		data: ['January', 'June'],
		targetCount: 5,
		isNormalDirection: true,
		expected: ['August', 'Mar', 'October', 'May', 'December']
	},
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