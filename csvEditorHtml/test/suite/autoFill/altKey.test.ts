import { expect, test, suite } from 'vitest'


suite("alt key pressed tests", () => {

	// special test
	test('holding alt will copy only (uses handsontable default auto fill func)', async function () {
		let result = customAutoFillFunc(['1', '2', '3'], 1, true, { altKey: true } as MouseEvent)
		expect(result).toEqual([])
	})

})

