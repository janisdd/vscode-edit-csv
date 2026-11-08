// csvEditorHtml/i18n.ts

// 当前语言
let currentLanguage = 'en';

// 所有语言包注册表
const allTranslations: Record<string, Record<string, string>> = {};

/**
 * 注册语言包
 */
function registerTranslation(lang: string, dict: Record<string, string>) {
	allTranslations[lang.toLowerCase()] = dict;
}

/**
 * 设置当前语言
 */
function setLanguage(lang: string) {
	if (lang) {
		currentLanguage = lang.toLowerCase();
	}
}

/**
 * 作者要求的 t(enText) 函数
 * 全局可用，直接传英文，有翻译就返回中文，没有就返回原英文
 */
function t(enText: string): string {
	const dict = allTranslations[currentLanguage];
	if (dict && dict[enText]) {
		return dict[enText];
	}
	return enText;
}

/**
 * 遍历 DOM 替换静态文本
 */
function translateDom() {
	// 翻译标签内的文字内容
	document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
		const key = el.getAttribute('data-i18n');
		if (key) {
			el.textContent = t(key);
		}
	});

	// 翻译悬停提示 title
	document.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach((el) => {
		const key = el.getAttribute('data-i18n-title');
		if (key) {
			el.title = t(key);
		}
	});

	// 翻译输入框占位符 placeholder
	document.querySelectorAll<HTMLInputElement>('[data-i18n-placeholder]').forEach((el) => {
		const key = el.getAttribute('data-i18n-placeholder');
		if (key) {
			el.placeholder = t(key);
		}
	});
}

// 显式挂载到全局 window，确保其他脚本 100% 能直接调用
window.registerTranslation = registerTranslation;
window.setLanguage = setLanguage;
window.t = t;
window.translateDom = translateDom;