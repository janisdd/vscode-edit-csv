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
