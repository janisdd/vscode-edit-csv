import { registerTranslation } from "../i18n"

const zhCnTranslation: Record<string, string> = {
	//--- notifications
	"Open a csv editor first to show the source csv file": "请先打开一个 csv 编辑器,以显示源 csv 文件",
	"Open a csv file first to show the csv editor or file too large (> 50MB)": "请先打开一个 csv 文件以显示 csv 编辑器,或者文件太大(> 50MB)",
	"Open a csv editor first to apply changes": "请先打开一个 csv 编辑器以应用更改",
	"No settings object provided": "未提供设置对象",

	//--- errors
	"Could not find the source file for the editor (no instance found), error: {0}": "找不到该编辑器的源文件(未找到实例),错误:{0}",
	"Could not create an editor instance, error: {0}": "无法创建编辑器实例,错误:{0}",
	"Could not find the editor instance, error: {0}": "找不到编辑器实例,错误:{0}",
	"Could not destroy an editor instance, error: {0}": "无法销毁编辑器实例,错误:{0}",
	"Could not dispose source file watcher for file {0}, error: {1}": "无法释放文件 {0} 的源文件监视器,错误:{1}",
	"could not read the source file, error: {0}": "无法读取源文件,错误:{0}",
	"Error applying edits": "应用编辑时出错",
	"Could apply changed because the source file could not be found": "无法应用更改,因为找不到源文件",
	"Edits could not be applied": "无法应用编辑",
	"Could not save csv file": "无法保存 csv 文件",
	"Error saving csv file": "保存 csv 文件时出错",
	"Could not save new source file (old was deleted)": "无法保存新的源文件(原文件已被删除)",
	"Could not save new source file (old was deleted), error: {0}": "无法保存新的源文件(原文件已被删除),错误:{0}",
	"Could not create new source file (old was deleted), error: {0}": "无法创建新的源文件(原文件已被删除),错误:{0}",
	"Could not open new source file, error: {0}": "无法打开新的源文件,错误:{0}",

	//--- configuration
	"Could not find option: {0} in csv-edit configuration": "在 csv-edit 配置中找不到选项:{0}",
	"unknown setting '{0}', skipping this setting": "未知的设置“{0}”,将跳过该设置",
}

registerTranslation("zh-cn", zhCnTranslation)
registerTranslation("zh-hans", zhCnTranslation)
registerTranslation("zh", zhCnTranslation)
