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
	t: (enText: string) => string
	translateDom: () => void
}

// Mount to window object
window.registerTranslation = registerTranslation
window.setLanguage = setLanguage
window.t = t
window.translateDom = translateDom
