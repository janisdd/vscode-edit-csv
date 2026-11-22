/**
 * Simplified Chinese dictionary for the texts that are rendered by handsontable itself
 * (e.g. the context menu items, the alignment submenu, ...)
 *
 * handsontable uses its own dictionary format, so the keys are the handsontable
 * dictionary keys ({@link Handsontable.languages.dictionaryKeys}) and not the english texts
 *
 * the dictionary must be registered before the table is created and is activated with
 * the `language` setting (see createTable in ui.ts)
 */
const handsontableDictionary: Handsontable.I18n.LanguageDictionary = {
	languageCode: "zh-cn",

	// context menu
	"ContextMenu:items.insertRowAbove": "在上方插入行",
	"ContextMenu:items.insertRowBelow": "在下方插入行",
	"ContextMenu:items.insertColumnOnTheLeft": "在左侧插入列",
	"ContextMenu:items.insertColumnOnTheRight": "在右侧插入列",
	"ContextMenu:items.removeRow": "删除行",
	"ContextMenu:items.removeColumn": "删除列",

	// context menu - alignment submenu
	"ContextMenu:items.align": "对齐",
	"ContextMenu:items.align.left": "左对齐",
	"ContextMenu:items.align.center": "水平居中",
	"ContextMenu:items.align.right": "右对齐",
	"ContextMenu:items.align.justify": "两端对齐",
	"ContextMenu:items.align.top": "顶端对齐",
	"ContextMenu:items.align.middle": "垂直居中",
	"ContextMenu:items.align.bottom": "底端对齐",
}

Handsontable.languages.registerLanguageDictionary(handsontableDictionary)
