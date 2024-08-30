import { expect, test, suite } from 'vitest'

export type AutoFillTestSuit = {
	name: string
	tests: AutoFillTestData[]
}

export type AutoFillTestData = {
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
export var knownNumberStylesMap: KnownNumberStylesMap = {
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

export function getNumbersStyleFromUi(): NumbersStyle {
	return knownNumberStylesMap['en']
}
// window.getNumbersStyleFromUi = getNumbersStyleFromUi
// window.knownNumberStylesMap = knownNumberStylesMap

//add toFormat to big numbers
//@ts-ignore
toFormat(Big)
