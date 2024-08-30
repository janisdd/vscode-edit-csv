
// ------------------------------ auto fill stuff ------------------------------

const intRegex = /-?\d+/g
const floatRegexEn = /-?\d+\.\d+/g
const floatRegexNonEn = /-?\d+\,\d+/g

// currently only english months are supported
const monthRegexLen3 = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)$/gi
const monthRegexFull = /^(january|february|march|april|may|june|july|august|september|october|november|december)$/gi
const monthFullNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const monthShortNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

type KnownDateFormat = {
	regex: RegExp
}

const allKnownSeparatorRegex = /[\-\/\.]/g // - / .

//as key we always use the `-` separator but we also support `/` and `.` as separators
const allKnownDateFormats = new Map<string, KnownDateFormat>()
allKnownDateFormats.set(`YYYY-MM-DD`, {
	regex: /^(\d{4})[\-\/\.](\d{2})[\-\/\.](\d{2})$/g,
})
allKnownDateFormats.set(`YYYY-M-DD`, {
	regex: /^(\d{4})[\-\/\.](\d{1})[\-\/\.](\d{2})$/g,
})
allKnownDateFormats.set(`YYYY-MM-D`, {
	regex: /^(\d{4})[\-\/\.](\d{2})[\-\/\.](\d{1})$/g,
})
allKnownDateFormats.set(`YYYY-M-D`, {
	regex: /^(\d{4})[\-\/\.](\d{1})[\-\/\.](\d{1})$/g,
})
allKnownDateFormats.set(`DD-MM-YYYY`, {
	regex: /^(\d{2})[\-\/\.](\d{2})[\-\/\.](\d{4})$/g,
})
allKnownDateFormats.set(`DD-M-YYYY`, {
	regex: /^(\d{2})[\-\/\.](\d{1})[\-\/\.](\d{4})$/g,
})
allKnownDateFormats.set(`D-MM-YYYY`, {
	regex: /^(\d{1})[\-\/\.](\d{2})[\-\/\.](\d{4})$/g,
})
allKnownDateFormats.set(`D-M-YYYY`, {
	regex: /^(\d{1})[\-\/\.](\d{1})[\-\/\.](\d{4})$/g,
})

allKnownDateFormats.set(`DD-MM-YY`, {
	regex: /^(\d{2})[\-\/\.](\d{2})[\-\/\.](\d{2})$/g,
})
allKnownDateFormats.set(`DD-M-YY`, {
	regex: /^(\d{2})[\-\/\.](\d{1})[\-\/\.](\d{2})$/g,
})
allKnownDateFormats.set(`D-MM-YY`, {
	regex: /^(\d{1})[\-\/\.](\d{2})[\-\/\.](\d{2})$/g,
})
allKnownDateFormats.set(`D-M-YY`, {
	regex: /^(\d{1})[\-\/\.](\d{1})[\-\/\.](\d{2})$/g,
})


/**
 * real interpolation because only number
 */
type GroupInterpolationInfo_Number = {
	type: 'int'
	//not needed, we just check that the string matches a regex and then use the string from the selected data
	// numberToUse: number
}

/**
 * no real interpolation but only +1 for every copy
 */
type GroupInterpolationInfo_ContainsNumber = {
	type: 'containsInt' //big js handles ints and floats
	/**
	 * 0-based index of the number to interpolate (used for substring)
	 */
	startIndexNumber: number
	/**
	 * end offset
	 */
	endIndexNumber: number

	// numberToUse: number
	/**
	 * the original number string
	 */
	numberString: string
}

/**
 * real interpolation because only number
 */
type GroupInterpolationInfo_MonthName = {
	type: 'month'

	/**
	 * the original month string
	 */
	monthString: string
	monthIndex: number
	isFullName: boolean
	isUpperCase: boolean
}

type GroupInterpolationInfo_Date = {
	type: 'date'
	originalDate: Dayjs
	separator1String: string
	separator2String: string
	displayFormat: string
}

/**
 * will be copied only
 */
type GroupInterpolationInfo_Unknown = {
	type: 'unknown'
}

type GroupInterpolationInfo =
	| GroupInterpolationInfo_Number
	| GroupInterpolationInfo_ContainsNumber
	| GroupInterpolationInfo_MonthName
	| GroupInterpolationInfo_Date
	| GroupInterpolationInfo_Unknown

/**
 * 
 * @param _data the selected data by the user to interpolate (x values)
 * @param targetCount the number of target items to interpolate (y values) (return)
 * @param isNormalDirection normal is top to bottom or left to right
 *   however, the user can also drag to top or to left (not normal), this is important for interpolation
 *   for copy only, this can be ignored!
 * @returns an array of interpolated strings
 */
function customAutoFillFunc(_data: string[], targetCount: number, isNormalDirection: boolean, mouseupEvent: MouseEvent): string[] {

	if (mouseupEvent.altKey) {
		// fallback to just copying
		return []
	}

	if (!isNormalDirection) {
		_data = [..._data].reverse()
	}

	//here are some obersevations from excel auto fill:
	// if all data are numbers (ints/floats) -> interpolate normal
	// if we have mixed data (not just plain numbers, then it's text)
	// if it's text
	//    if it's a date -> interpolate dates
	//    if it's a month (or starting characters of a month) -> interpolate months and use the same length of characters (we only interpolate 3 or all letters for performance!)
	// if it's text that also contains numbers -> it's a group
	//   groups are interpolated differently e.g. we select 3 cells then ever (x+3) cells are used for interpolation -> we have 3 groups
	//     e.g. 1 a, 2 b, 3 c -> 2 a, 3 b, 4 c -> 3 a, 4 b, 5 c 
	//     (1a -> 2a -> 3a) ...
	// 		 however, this is no real interpolation
	//     for numbers (ints only) interpolation means +1!
	//   this allows us to interpolate different types/data in the same column, e.g. group 1 may be numbers, group 2 may be months, ...
	//   for groups:
	//     if the cells starts with a number -> interpolate only first number
	//     if the cells ends with a number -> interpolate only last number
	//
	//     if the cells does not start or end with a number -> fallback to copy (but in groups)
	// EXCEPTION if we have multiple only ints is sequence -> interpolate normal for the sequence
	//  1 2 a 5 6 -> interpolate (1, 2) as sequence, copy a, interpolate (5, 6) as sequence

	//the following date formats are supported:
	// supported separators: . / - (examples use only -)
	// 2024-01-01 (YYYY-MM-DD)
	// 2024-1-01 (YYYY-M-DD)
	// 2024-01-1 (YYYY-MM-D)
	// 2024-1-1 (YYYY-M-D)

	// 01-01-2024 (DD-MM-YYYY)
	// 01-1-2024 (DD-M-YYYY)
	// 1-01-2024 (D-MM-YYYY)
	// 1-1-2024 (D-M-YYYY)

	// 01-01-2024 (DD-MM-YY)
	// 01-1-2024 (DD-M-YY)
	// 1-01-2024 (D-MM-YY)
	// 1-1-2024 (D-M-YY)

	//the following months are supported:
	// at least 3 letters of the months are needed
	// currently only enlish months are supported
	// the different in month indices must be the same in the selected data, else we copy
	// jan, mar, may (diff 2)
	// jan, mar apr (different diff) -> copy
	// the other props (uppercase, ...) are individual for every entry

	//style from stats ui
	let numbersStyleToUse = getNumbersStyleFromUi()

	let groupInterpolationInfos: GroupInterpolationInfo[] = []

	for (let i = 0; i < _data.length; i++) {
		const cellText = _data[i]

		//other
		//however, if we have mixed data, it's automatically grouped data, so do this anyway

		//could be: month, date or grouped data

		//grouped data

		{
			let checkOtherCases = true
			//check if starts or ends with number (ints only)

			const matchesInt = Array.from(cellText.matchAll(intRegex))

			let firstMatchInt = matchesInt.length > 0 ? matchesInt[0] : null
			let startsWithNumberInt = matchesInt.length > 0 && firstMatchInt && firstMatchInt.index === 0
			let lastMatchInt = matchesInt.length > 0 ? matchesInt[matchesInt.length - 1] : null
			let endsWithNumberInt = matchesInt.length > 0 && lastMatchInt && lastMatchInt.index! + lastMatchInt[0].length === cellText.length
			let onlyNumberInt = startsWithNumberInt && endsWithNumberInt && matchesInt.length === 1

			let matchesFloat: RegExpMatchArray[] = []

			if (numbersStyleToUse.key === 'en') {
				matchesFloat = Array.from(cellText.matchAll(floatRegexEn))
			} else {
				matchesFloat = Array.from(cellText.matchAll(floatRegexNonEn))
			}

			let firstMatchFloat = matchesFloat.length > 0 ? matchesFloat[0] : null
			let startsWithNumberFloat = matchesFloat.length > 0 && firstMatchFloat && firstMatchFloat.index === 0
			let lastMatchFloat = matchesFloat.length > 0 ? matchesFloat[matchesFloat.length - 1] : null
			let endsWithNumberFloat = matchesFloat.length > 0 && lastMatchFloat && lastMatchFloat.index! + lastMatchFloat[0].length === cellText.length
			let onlyNumberFloat = startsWithNumberFloat && endsWithNumberFloat && matchesFloat.length === 1


			if (onlyNumberFloat) {

				let groupInterpolationInfo_Int: GroupInterpolationInfo_Number = {
					type: 'int', //big js handles ints and floats
				}

				groupInterpolationInfos.push(groupInterpolationInfo_Int)
				checkOtherCases = false

			} else if (onlyNumberInt) {

				let groupInterpolationInfo_Int: GroupInterpolationInfo_Number = {
					type: 'int',
				}

				groupInterpolationInfos.push(groupInterpolationInfo_Int)
				checkOtherCases = false

			} else if (startsWithNumberInt && endsWithNumberInt) {
				//check date
				// fast check if it could be a date because we check a lot of regexes

				for (const [format, knownFormat] of allKnownDateFormats) {

					//TODO only use first?
					const dateMatches = Array.from(cellText.matchAll(knownFormat.regex))

					if (dateMatches.length === 0) continue

					// format = `YYYY-MM-DD`
					let dateMatch = dateMatches[0] // e.g. 2024.01.01
					let dateMatchString = dateMatch[0]

					//figure out separator
					const separatorMatches = Array.from(dateMatchString.matchAll(allKnownSeparatorRegex))

					if (separatorMatches.length !== 2) continue

					let separator1 = separatorMatches[0][0]
					let separator2 = separatorMatches[1][0]

					let displayFormat = format.replace(`-`, separator1).replace(`-`, separator2)

					let originalDate = dayjs(dateMatchString, displayFormat, true)

					if (originalDate.isValid() === false) continue

					let groupInterpolationInfo_Date: GroupInterpolationInfo_Date = {
						type: 'date',
						originalDate,
						displayFormat: displayFormat,
						separator1String: separator1,
						separator2String: separator2,
					}

					groupInterpolationInfos.push(groupInterpolationInfo_Date)
					checkOtherCases = false
					break //we found a date
				}

			}

			const monthNames = Array.from(cellText.matchAll(monthRegexLen3))
			const monthNamesFull = Array.from(cellText.matchAll(monthRegexFull))

			if (checkOtherCases) {

				if (startsWithNumberFloat && firstMatchFloat) {

					let groupInterpolationInfo_ContainsNumber: GroupInterpolationInfo_ContainsNumber = {
						type: 'containsInt',
						startIndexNumber: firstMatchFloat.index!,
						endIndexNumber: firstMatchFloat.index! + firstMatchFloat[0].length,
						numberString: firstMatchFloat[0]
					}

					groupInterpolationInfos.push(groupInterpolationInfo_ContainsNumber)

				} else if (endsWithNumberFloat && lastMatchFloat) {

					let groupInterpolationInfo_ContainsNumber: GroupInterpolationInfo_ContainsNumber = {
						type: 'containsInt',
						startIndexNumber: lastMatchFloat.index!,
						endIndexNumber: lastMatchFloat.index! + lastMatchFloat[0].length,
						numberString: lastMatchFloat[0]
					}

					groupInterpolationInfos.push(groupInterpolationInfo_ContainsNumber)

				} else if (startsWithNumberInt && firstMatchInt) {

					let groupInterpolationInfo_ContainsNumber: GroupInterpolationInfo_ContainsNumber = {
						type: 'containsInt',
						startIndexNumber: firstMatchInt.index!,
						endIndexNumber: firstMatchInt.index! + firstMatchInt[0].length,
						numberString: firstMatchInt[0]
					}

					groupInterpolationInfos.push(groupInterpolationInfo_ContainsNumber)

				} else if (endsWithNumberInt && lastMatchInt) {

					let groupInterpolationInfo_ContainsNumber: GroupInterpolationInfo_ContainsNumber = {
						type: 'containsInt',
						startIndexNumber: lastMatchInt.index!,
						endIndexNumber: lastMatchInt.index! + lastMatchInt[0].length,
						numberString: lastMatchInt[0]
					}

					groupInterpolationInfos.push(groupInterpolationInfo_ContainsNumber)

				} else if (monthNames.length === 1 || monthNamesFull.length === 1) {

					//can be a month or just a part of another word that is not a month!
					// for performance we only interpolate 3 or all letters of months
					// (else we would need to check whole words, search for whitespaces, ...)

					let info: GroupInterpolationInfo
					let monthIndex = -1
					let isFullName: boolean
					let isUpperCase: boolean = cellText[0] !== cellText[0].toLowerCase()

					if (monthNamesFull.length === 1) {
						//full match
						monthIndex = monthFullNames.indexOf(cellText.toLowerCase())
						isFullName = true
					}
					else {
						//only 3 letters
						monthIndex = monthShortNames.indexOf(cellText.toLowerCase())
						isFullName = false
					}

					if (monthIndex !== -1) {
						info = {
							type: 'month',
							monthString: cellText,
							monthIndex,
							isFullName,
							isUpperCase,
						} satisfies GroupInterpolationInfo_MonthName
					}
					else {
						console.warn(`Could not find month index for interpolation, defaulting to copying`)

						info = {
							type: 'unknown'
						} satisfies GroupInterpolationInfo_Unknown
					}

					groupInterpolationInfos.push(info)

				} else {
					//normal data, just copy

					let groupInterpolationInfo_Unknown: GroupInterpolationInfo_Unknown = {
						type: 'unknown'
					}

					groupInterpolationInfos.push(groupInterpolationInfo_Unknown)
				}
			}

		}

	}

	//--- interpolation data for numbers

	const bigZero = Big(0)
	//if we have numbers in consecutive cells -> they form a sequence for interpolation
	//we can have multiple sequences in the same column
	const interpolationNumberSequenceStrings: Array<string[]> = []
	let currentNumberStringSequence: string[] = []
	let dataIndexToInterpolationSequenceIndexNumbers: number[] = []

	const interpolationSequenceModelsNumbers = []
	const interpolationLastXValNumbers: Array<typeof bigZero> = []

	{
		for (let _i = 0; _i < groupInterpolationInfos.length; _i++) {
			const el = groupInterpolationInfos[_i]

			if (el.type === `int`) {
				currentNumberStringSequence.push(_data[_i])
				dataIndexToInterpolationSequenceIndexNumbers[_i] = interpolationNumberSequenceStrings.length

			} else {
				// not int

				dataIndexToInterpolationSequenceIndexNumbers[_i] = -1

				if (currentNumberStringSequence.length > 0) {
					interpolationNumberSequenceStrings.push(currentNumberStringSequence)
					currentNumberStringSequence = []
				}
			}
		}

		if (currentNumberStringSequence.length > 0) {
			interpolationNumberSequenceStrings.push(currentNumberStringSequence)
		}

		// create the interpolation models for number groups
		for (let i = 0; i < interpolationNumberSequenceStrings.length; i++) {
			const sequenceStrings = interpolationNumberSequenceStrings[i]

			let ints = sequenceStrings.map((p, index) => {

				let canonicalNumberString = getFirstCanonicalNumberStringInCell(p, numbersStyleToUse)
				if (canonicalNumberString === null) {
					console.warn(`Could not get canonical number string for interpolation at selection index: ${index}, defaulting to 0`)
					return bigZero
				}

				let num: typeof bigZero

				try {
					num = Big(canonicalNumberString)
				} catch (error) {
					console.warn(`Could not parse canonical number string for interpolation at selection index: ${index}, defaulting to 0`)
					return bigZero
				}

				return num
			})

			// special case, we want to increase +1
			let isSimpleIncrement = false
			if (ints.length === 1) {

				if (isNormalDirection) {
					ints.push(ints[0].add(1))
				} else {
					//add to front because we will reverse!
					// ints.unshift(ints[0] - 1)
					ints.push(ints[0].sub(1))
				}

				isSimpleIncrement = true
			}

			let dataPoints = ints.map((val, index) => [Big(index + 1), val])
			let model = regression.linearBig(dataPoints)
			interpolationSequenceModelsNumbers.push(model)

			if (isSimpleIncrement) {
				//we added a "fake" el to get linear interpolation (a line)
				interpolationLastXValNumbers.push(dataPoints[dataPoints.length - 2][0])
			} else {
				interpolationLastXValNumbers.push(dataPoints[dataPoints.length - 1][0])
			}
		}

	}

	let interpolationIndices = Array.from({ length: interpolationNumberSequenceStrings.length }, (_, i) => {
		return interpolationLastXValNumbers[i]
	})

	//--- interpolation contains number
	// we interpolate not only +1/-1 but any delta... delta must be the same in the group

	const interpolationContainsNumberSequenceIndices: Array<string[]> = [] //better use month indices instead of strings
	let currentSequenceContainsNumberIndices: string[] = []
	let curentSequenceContainsNumberGroupIndices: number[] = []

	let dataIndexToInterpolationSequenceIndexContainsNumber: number[] = []
	let interpolationIndexToDataGroupIndexContainsNumber: Array<number[]> = [] //entries are curentSequenceMonthGroupIndices

	//just a plain number to add
	const interpolationSequenceModelsContainsNumber: Array<typeof bigZero> = []
	const containsNumberInterpolationIndices: Array<typeof bigZero> = [] //we start with these indices for interpolation

	{
		for (let _i = 0; _i < groupInterpolationInfos.length; _i++) {
			const el = groupInterpolationInfos[_i]

			if (el.type === `containsInt`) {

				currentSequenceContainsNumberIndices.push(el.numberString)
				dataIndexToInterpolationSequenceIndexContainsNumber[_i] = interpolationContainsNumberSequenceIndices.length
				curentSequenceContainsNumberGroupIndices.push(_i)

			} else {
				// not contains int

				dataIndexToInterpolationSequenceIndexNumbers[_i] = -1

				if (currentSequenceContainsNumberIndices.length > 0) {
					interpolationContainsNumberSequenceIndices.push(currentSequenceContainsNumberIndices)
					interpolationIndexToDataGroupIndexContainsNumber.push(curentSequenceContainsNumberGroupIndices)
					currentSequenceContainsNumberIndices = []
					curentSequenceContainsNumberGroupIndices = []
				}
			}
		}

		if (currentSequenceContainsNumberIndices.length > 0) {
			interpolationContainsNumberSequenceIndices.push(currentSequenceContainsNumberIndices)
			interpolationIndexToDataGroupIndexContainsNumber.push(curentSequenceContainsNumberGroupIndices)
		}

		// create the interpolation models for number groups
		for (let i = 0; i < interpolationContainsNumberSequenceIndices.length; i++) {
			const sequenceStrings = interpolationContainsNumberSequenceIndices[i]

			let ints = sequenceStrings.map((p, index) => {

				let canonicalNumberString = getFirstCanonicalNumberStringInCell(p, numbersStyleToUse)
				if (canonicalNumberString === null) {
					console.warn(`Could not get canonical number string for interpolation at selection index: ${index}, defaulting to 0`)
					return bigZero
				}

				let num: typeof bigZero

				try {
					num = Big(canonicalNumberString)
				} catch (error) {
					console.warn(`Could not parse canonical number string for interpolation at selection index: ${index}, defaulting to 0`)
					return bigZero
				}

				return num
			})

			let delta: typeof bigZero

			//make sure all deltas are the same
			if (ints.length === 1) {
				//special case
				// will be +1/-1
				delta = isNormalDirection ? Big(1) : Big(-1)
			} else {
				delta = ints[1].sub(ints[0])
			}

			let allDeltasAreTheSame = true

			for (let j = 1; j < ints.length; j++) {
				let _delta = ints[j].sub(ints[j - 1])

				if (_delta.eq(delta) === false) {
					allDeltasAreTheSame = false
					break
				}
			}

			if (!allDeltasAreTheSame) {

				const groupIndicesThatContributedToThisGroup = interpolationIndexToDataGroupIndexContainsNumber[i]

				for (let k = 0; k < groupIndicesThatContributedToThisGroup.length; k++) {
					const groupIndex = groupIndicesThatContributedToThisGroup[k]

					//default to just copy
					groupInterpolationInfos[groupIndex] = {
						type: 'unknown',
					} satisfies GroupInterpolationInfo_Unknown

				}

				continue
			}


			interpolationSequenceModelsContainsNumber.push(delta)
			containsNumberInterpolationIndices.push(ints[ints.length - 1])

		}

	}

	//--- interpolation data for month indices

	const interpolationMonthSequenceIndices: Array<number[]> = [] //better use month indices instead of strings
	let currentSequenceMonthIndices: number[] = []
	let curentSequenceMonthGroupIndices: number[] = []

	let dataIndexToInterpolationSequenceIndexMonths: number[] = []
	let interpolationIndexToDataGroupIndexMonths: Array<number[]> = [] //entries are curentSequenceMonthGroupIndices

	//just a plain number to add
	const interpolationSequenceModelsMonths: number[] = []
	const monthInterpolationIndices: number[] = [] //we start with these indices for interpolation

	{
		for (let _i = 0; _i < groupInterpolationInfos.length; _i++) {
			const el = groupInterpolationInfos[_i]

			if (el.type === `month`) {
				currentSequenceMonthIndices.push(el.monthIndex)
				curentSequenceMonthGroupIndices.push(_i)

				dataIndexToInterpolationSequenceIndexMonths[_i] = interpolationMonthSequenceIndices.length

			} else {
				// not month

				dataIndexToInterpolationSequenceIndexMonths[_i] = -1


				if (currentSequenceMonthIndices.length > 0) {
					interpolationMonthSequenceIndices.push(currentSequenceMonthIndices)
					currentSequenceMonthIndices = []

					interpolationIndexToDataGroupIndexMonths.push(curentSequenceMonthGroupIndices)
					curentSequenceMonthGroupIndices = []
				}
			}
		}

		if (currentSequenceMonthIndices.length > 0) {
			interpolationMonthSequenceIndices.push(currentSequenceMonthIndices)

			interpolationIndexToDataGroupIndexMonths.push(curentSequenceMonthGroupIndices)
		}

		for (let i = 0; i < interpolationMonthSequenceIndices.length; i++) {
			const monthIndexSequence = interpolationMonthSequenceIndices[i]

			let delta: number

			//make sure all deltas are the same
			if (monthIndexSequence.length === 1) {
				// will be +1
				delta = isNormalDirection ? 1 : -1
			} else {
				delta = monthIndexSequence[1] - monthIndexSequence[0]
			}

			let allDeltasAreTheSame = true

			for (let j = 1; j < monthIndexSequence.length; j++) {
				if (monthIndexSequence[j] - monthIndexSequence[j - 1] !== delta) {
					allDeltasAreTheSame = false
					break
				}
			}

			if (!allDeltasAreTheSame) {

				const groupIndicesThatContributedToThisGroup = interpolationIndexToDataGroupIndexMonths[i]

				for (let k = 0; k < groupIndicesThatContributedToThisGroup.length; k++) {
					const groupIndex = groupIndicesThatContributedToThisGroup[k]

					//default to just copy
					groupInterpolationInfos[groupIndex] = {
						type: 'unknown',
					} satisfies GroupInterpolationInfo_Unknown

				}

				continue
			}

			interpolationSequenceModelsMonths.push(delta % 12)
			monthInterpolationIndices.push(monthIndexSequence[monthIndexSequence.length - 1])
		}

	}

	//--- interpolation data for dates

	//consecutive dates form a sequence for interpolation (a group)

	const interpolationDatesData: Array<GroupInterpolationInfo_Date["originalDate"][]> = [] //better use month indices instead of strings
	let currentSequenceDatesData: GroupInterpolationInfo_Date["originalDate"][] = []
	let curentSequenceDateGroupData: number[] = []

	let dataIndexToInterpolationSequenceIndexDates: number[] = []
	let interpolationIndexToDataGroupIndexDates: Array<number[]> = [] //entries are curentSequenceMonthGroupIndices

	//just a plain numbers to add
	const interpolationSequenceModelsDates: Array<[diffDays: number, diffMonths: number, diffYears: number]> = []
	const dateInterpolationStart: GroupInterpolationInfo_Date["originalDate"][] = [] //we start with these dates for interpolation

	{

		for (let _i = 0; _i < groupInterpolationInfos.length; _i++) {
			const el = groupInterpolationInfos[_i]

			if (el.type === `date`) {
				currentSequenceDatesData.push(el.originalDate)
				curentSequenceDateGroupData.push(_i)

				dataIndexToInterpolationSequenceIndexDates[_i] = interpolationDatesData.length

			} else {
				// not int

				dataIndexToInterpolationSequenceIndexDates[_i] = -1


				if (currentSequenceDatesData.length > 0) {
					interpolationDatesData.push(currentSequenceDatesData)
					currentSequenceDatesData = []

					interpolationIndexToDataGroupIndexDates.push(curentSequenceDateGroupData)
					curentSequenceDateGroupData = []
				}
			}
		}

		if (currentSequenceDatesData.length > 0) {
			interpolationDatesData.push(currentSequenceDatesData)

			interpolationIndexToDataGroupIndexDates.push(curentSequenceDateGroupData)
		}

		for (let i = 0; i < interpolationDatesData.length; i++) {
			const interpolationDateGroup = interpolationDatesData[i]

			let deltas: typeof interpolationSequenceModelsDates[number] = [0, 0, 0]

			//make sure all deltas are the same in the current group
			if (interpolationDateGroup.length === 1) {
				// special case when we only have 1 date -> increment by 1 day
				// will be +1 for days
				deltas = [isNormalDirection ? 1 : -1, 0, 0]
			} else {

				// we have the following cases for 2 dates (all others must have the same deltas or pattern)
				// days are same e.g. 20.02.2024 -> 20.03.2024 -> keep the day -> 20.04.2024 (add the diff in months)
				// days and months are the same e.g. 20.02.2024 -> 20.02.2025 -> keep the day and month -> 20.02.2026 (add the diff in years)
				// if days are different -> always add the diff in days as a constant

				let prevEl = interpolationDateGroup[0]
				let el = interpolationDateGroup[1]

				let diffInDays = el.date() - prevEl.date()
				let diffInMonths = el.month() - prevEl.month()
				let diffInYears = el.year() - prevEl.year()

				if (diffInDays === 0 && diffInMonths === 0) {

					deltas = [0, 0, diffInYears]
				}
				else if (diffInDays === 0) {

					deltas = [0, diffInMonths, diffInYears]
				}
				else {
					//diff in days is != 0

					let deltaInDays = el.diff(prevEl, 'day')
					deltas = [deltaInDays, 0, 0]
				}
			}

			let allDeltasAreTheSame = [true, true, true]

			// 2 because we already checked the first 2
			for (let j = 2; j < interpolationDateGroup.length; j++) {

				let prevEl = interpolationDateGroup[j - 1]
				let el = interpolationDateGroup[j]

				let diffInDays = el.date() - prevEl.date()
				let diffInMonths = el.month() - prevEl.month()
				let diffInYears = el.year() - prevEl.year()

				if (deltas[0] === 0 && deltas[1] === 0 && diffInDays == 0 && diffInMonths === 0) {

					if (diffInYears !== deltas[2]) {
						allDeltasAreTheSame[2] = false
					}
				}
				else if (deltas[0] === 0 && diffInDays == 0) {

					if (diffInYears !== deltas[2]) {
						allDeltasAreTheSame[2] = false
					}

					if (diffInMonths !== deltas[1]) {
						allDeltasAreTheSame[1] = false
					}
				}
				else {
					//diff in days is != 0

					let deltaInDays = el.diff(prevEl, 'day')

					if (deltaInDays !== deltas[0]) {
						allDeltasAreTheSame[0] = false
					}
				}
			}

			//if all deltas are different -> copy
			if (allDeltasAreTheSame.some(p => p === false)) {

				const groupIndicesThatContributedToThisGroup = interpolationIndexToDataGroupIndexDates[i]

				for (let k = 0; k < groupIndicesThatContributedToThisGroup.length; k++) {
					const groupIndex = groupIndicesThatContributedToThisGroup[k]

					//default to just copy
					groupInterpolationInfos[groupIndex] = {
						type: 'unknown',
					} satisfies GroupInterpolationInfo_Unknown

				}

				continue
			}

			//currently we are strict, all deltas must be the same
			// //reset deltas that are not the same
			// for (let k = 0; k < allDeltasAreTheSame.length; k++) {
			// 	const isTheSame = allDeltasAreTheSame[k]

			// 	if (!isTheSame) {
			// 		deltas[k] = 0
			// 	}
			// }

			interpolationSequenceModelsDates.push(deltas)
			//the last date is the start for the next interpolation
			dateInterpolationStart.push(interpolationDateGroup[interpolationDateGroup.length - 1])
		}

	}

	let interpolatedDataAsString: string[] = []

	console.debug(`auto fill numbersStyleToUse`, numbersStyleToUse)
	console.debug(`auto fill groupInterpolationInfos`, groupInterpolationInfos)

	// create output
	for (let i = 0; i < targetCount; i++) {

		//data.length === groupInterpolationInfos.length
		let relativI = i % _data.length

		let groupInterpolationInfo = groupInterpolationInfos[relativI]

		switch (groupInterpolationInfo.type) {
			case "int": {
				let sequenceIndex = dataIndexToInterpolationSequenceIndexNumbers[relativI]
				let model = interpolationSequenceModelsNumbers[sequenceIndex]
				//always +1 regardless of the direction (because we reverse the data points for the model)
				interpolationIndices[sequenceIndex] = interpolationIndices[sequenceIndex].add(1)
				let nextXVal = interpolationIndices[sequenceIndex]

				let predictedVal = model.predict(nextXVal)
				let numString = formatBigJsNumber(predictedVal[1], numbersStyleToUse)
				interpolatedDataAsString.push(numString)
				break
			}

			case "containsInt": {

				let sequenceIndex = dataIndexToInterpolationSequenceIndexContainsNumber[relativI]
				let delta = interpolationSequenceModelsContainsNumber[sequenceIndex]

				let currNumberToUse = containsNumberInterpolationIndices[sequenceIndex]
				let predictedVal = currNumberToUse.add(delta)

				// the cell contained more than just the number -> recreate the cell with the number replaced
				let cellText = _data[relativI]
				let numString = formatBigJsNumber(predictedVal, numbersStyleToUse)
				let newCellText = cellText.substring(0, groupInterpolationInfo.startIndexNumber) + numString + cellText.substring(groupInterpolationInfo.endIndexNumber)
				interpolatedDataAsString.push(newCellText)

				containsNumberInterpolationIndices[sequenceIndex] = predictedVal
				
				break
			}

			case "month": {

				let sequenceIndex = dataIndexToInterpolationSequenceIndexMonths[relativI]
				let delta = interpolationSequenceModelsMonths[sequenceIndex]

				let currMonthIndex = monthInterpolationIndices[sequenceIndex]

				let isFullName = groupInterpolationInfo.isFullName
				let isUpperCase = groupInterpolationInfo.isUpperCase

				let newMonthIndex = currMonthIndex + delta

				if (newMonthIndex < 0) {
					newMonthIndex = 12 + newMonthIndex
				}


				let nextMonthIndex = newMonthIndex % 12
				let nextMonth = isFullName ? monthFullNames[nextMonthIndex] : monthShortNames[nextMonthIndex]

				if (isUpperCase) {
					//make first letter uppercase
					nextMonth = nextMonth[0].toUpperCase() + nextMonth.substring(1)
				}

				monthInterpolationIndices[sequenceIndex] = nextMonthIndex

				interpolatedDataAsString.push(nextMonth)
				break
			}

			case "date": {

				let sequenceIndex = dataIndexToInterpolationSequenceIndexDates[relativI]
				let delta = interpolationSequenceModelsDates[sequenceIndex]

				let currStartDate = dateInterpolationStart[sequenceIndex]

				let nextDate = currStartDate.add(delta[0], 'day').add(delta[1], 'month').add(delta[2], 'year') as typeof currStartDate

				if (nextDate.isValid() === false) {
					//could get invalid date
					interpolatedDataAsString.push("INVALID DATE")
				} else {

					dateInterpolationStart[sequenceIndex] = nextDate
					let dateString = nextDate.format(groupInterpolationInfo.displayFormat)
					interpolatedDataAsString.push(dateString)

				}

				break
			}

			case "unknown": {
				//just copy
				interpolatedDataAsString.push(_data[relativI])
				break
			}

			default:
				notExhaustiveSwitch(groupInterpolationInfo)
		}

	}

	if (!isNormalDirection) {
		interpolatedDataAsString.reverse()
	}

	//just a smal sanity check
	if (interpolatedDataAsString.some(p => typeof p !== 'string')) {
		//something went wrong -> default
		return []
	}

	console.debug(`auto fill data`, interpolatedDataAsString)
	return interpolatedDataAsString
}
