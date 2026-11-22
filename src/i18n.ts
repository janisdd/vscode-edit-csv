/**
 * lightweight i18n for the extension side, e.g. the vs code notifications
 * (the webview has its own i18n, see csvEditorHtml/i18n.ts)
 */

// Current language
let currentLanguage = "en"

// Translation dictionaries
const allTranslations: Record<string, Record<string, string>> = {}

/**
 * Register a translation dictionary for a specific language
 */
export function registerTranslation(lang: string, dict: Record<string, string>) {
	allTranslations[lang.toLowerCase()] = dict
}

/**
 * Set the active language
 */
export function setLanguage(lang: string) {
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
export function t(enText: string): string {
	const dict = allTranslations[currentLanguage]
	if (dict && dict[enText]) {
		return dict[enText]
	}
	return enText
}

/**
 * Translation helper for texts that contain dynamic parts
 * "{0}", "{1}", ... are replaced with the corresponding value of values
 * e.g. tFormat("Could not open new source file, error: {0}", error.message)
 */
export function tFormat(enText: string, ...values: (string | number)[]): string {
	let text = t(enText)
	for (let i = 0; i < values.length; i++) {
		text = text.replace(`{${i}}`, String(values[i]))
	}
	return text
}
