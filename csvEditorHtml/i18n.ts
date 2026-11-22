// Current language
let currentLanguage = "en"

// Translation dictionaries
const allTranslations: Record<string, Record<string, string>> = {}

/**
 * Register a translation dictionary for a specific language
 */
function registerTranslation(lang: string, dict: Record<string, string>) {
	allTranslations[lang.toLowerCase()] = dict
}

/**
 * Set the active language
 */
function setLanguage(lang: string) {
	if (lang) {
		const lower = lang.toLowerCase()
		// Normalize Chinese locales (e.g. zh-cn, zh-hans, zh-CN -> zh-cn)
		if (lower.startsWith("zh")) {
			currentLanguage = "zh-cn"
		} else {
			currentLanguage = lower
		}
	}
}

/**
 * Returns the currently active language code (e.g. "zh-cn")
 */
function getLanguage(): string {
	return currentLanguage
}

/**
 * Translation helper that falls back to the original English text
 */
function t(enText: string): string {
	const dict = allTranslations[currentLanguage]
	if (dict && dict[enText]) {
		return dict[enText]
	}
	return enText
}

/**
 * Translation helper for texts that contain dynamic parts
 * "{0}", "{1}", ... are replaced with the corresponding value of values
 * e.g. tFormat("Resize row to {0}px", 106)
 */
function tFormat(enText: string, ...values: (string | number)[]): string {
	let text = t(enText)
	for (let i = 0; i < values.length; i++) {
		text = text.replace(`{${i}}`, String(values[i]))
	}
	return text
}

/**
 * Traverse DOM and translate elements marked with data-i18n attributes
 */
function translateDom() {
	// Translate text content
	document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
		const key = el.getAttribute("data-i18n")
		if (key) {
			el.textContent = t(key)
		}
	})

	// Translate tooltips
	document.querySelectorAll<HTMLElement>("[data-i18n-title]").forEach((el) => {
		const key = el.getAttribute("data-i18n-title")
		if (key) {
			el.title = t(key)
		}
	})

	// Translate tooltips (custom css tooltips, see the data-tooltip attribute)
	document
		.querySelectorAll<HTMLElement>("[data-i18n-tooltip]")
		.forEach((el) => {
			const key = el.getAttribute("data-i18n-tooltip")
			if (key) {
				el.setAttribute("data-tooltip", t(key))
			}
		})

	// Translate input placeholders
	document
		.querySelectorAll<HTMLInputElement>("[data-i18n-placeholder]")
		.forEach((el) => {
			const key = el.getAttribute("data-i18n-placeholder")
			if (key) {
				el.placeholder = t(key)
			}
		})
}

// Extend global Window interface
interface Window {
	registerTranslation: (lang: string, dict: Record<string, string>) => void
	setLanguage: (lang: string) => void
	getLanguage: () => string
	t: (enText: string) => string
	tFormat: (enText: string, ...values: (string | number)[]) => string
	translateDom: () => void
}

// Mount to window object
window.registerTranslation = registerTranslation
window.setLanguage = setLanguage
window.getLanguage = getLanguage
window.t = t
window.tFormat = tFormat
window.translateDom = translateDom
