const zhCnTranslation: Record<string, string> = {
	//--- options bar
	"Read options": "读取选项",
	"Write options": "写入选项",
	Preview: "预览",
	"Refresh the preview": "刷新预览",
	"Creates the preview and copies it to the clipboard":
		"生成预览并复制到剪贴板",
	"Redraws the table. This can fix some measuring issues (e.g. after the font size changed)":
		"重新绘制表格,可修复某些尺寸测量问题(例如更改字体大小后)",
	"Resizes all column widths to match their content":
		"将所有列宽调整为内容宽度",
	"Resizes all row heights to match their content": "将所有行高调整为内容高度",
	"Reload the csv file content (from disk)": "重新加载 csv 文件内容(从磁盘)",
	"Set fixed rows top": "设置顶部固定行",
	"Set fixed columns left": "设置左侧固定列",
	"fixed rows:": "固定行:",
	"fixed columns:": "固定列:",
	"Toggls the readonly table mode (SET IN CODE AT STARTUP)":
		"切换表格只读模式(启动时由代码设置)",
	"Sets the table to edit mode": "将表格切换为编辑模式",
	"Sets the table to readonly mode": "将表格切换为只读模式",
	"Resets the table content zoom": "重置表格内容缩放",
	"The csv source file is not monitored for changes. Changes to the source file are ignored if the source file is changed by vs code or an external programme. To manually reload the contents of the source file, use the 'manual refresh button'.":
		"未监视 csv 源文件的变化。如果源文件被 vs code 或外部程序修改,这些更改将被忽略。要手动重新加载源文件内容,请使用“手动刷新按钮”。",
	"You might have unsaved changes": "可能有未保存的更改",

	//--- read options
	Encoding: "编码",
	"Auto detect": "自动检测",
	"Has header": "包含表头",
	"Use the first row as header in the table. Note that changing this option will also change the write header option. It will also clear the undo/redo stack! If the table has only one row this cannot be applied immediately, it will be applied if the table has more than one row. [the readOption_hasHeader and tryToGuessHasHeader settings can control this]":
		"将第一行用作表格表头。注意,更改此选项也会更改“写入表头”选项,并且会清空撤销/重做记录!如果表格只有一行,则无法立即应用,当表格超过一行时会自动应用。[readOption_hasHeader 和 tryToGuessHasHeader 设置可以控制此行为]",
	"Activated automatically, if table has >= 2 rows":
		"当表格行数不少于 2 行时自动启用",
	Delimiter: "分隔符",
	"Set to tab character": "设为制表符",
	"Empty to auto detect": "留空则自动检测",
	auto: "自动",
	Comment: "注释",
	"Comments before and after csv data are preserved. Comments between data rows are ignored. Empty to treat every line as data (no comments).":
		"csv 数据前后的注释会被保留,数据行之间的注释会被忽略。留空则将所有行都视为数据(没有注释)。",
	"Empty for no comments": "留空表示没有注释",
	QuoteChar: "引号字符",
	EscapeChar: "转义字符",
	"The character used to escape the QuoteChar inside field values":
		"用于在字段值中转义引号字符的字符",
	"Placeholder Text": "占位文本",
	"Reset data and apply read options": "重置数据并应用读取选项",
	"The input file content was stored locally and is used as data. Thus this view is independent of the source file":
		"输入文件的内容已保存在本地并用作数据,因此该视图与源文件无关",

	//--- write options
	"Write header": "写入表头",
	"Checked: writes the header row, unchecked: not":
		"勾选时写入表头行,未勾选则不写入",
	"Empty to use delimiter from read": "留空则使用读取时的分隔符",
	"Empty for no comments. Comments before and after csv data are written if char is present. Empty to exclude comments.":
		"留空表示没有注释。如果设置了字符,csv 数据前后的注释会被写入;留空则排除注释。",
	"Quote all fields": "引用所有字段",
	"End of line terminator": "行结束符",
	EOL: "行尾符",
	"Same as read": "与读取相同",
	"Same as input": "与输入相同",
	"Linux/Mac (LF)": "Linux/Mac(LF)",
	"Windows (CRLF)": "Windows(CRLF)",
	"Please use only the first cell in comment row (others are not exported)":
		"注释行请只使用第一个单元格(其他单元格不会被导出)",

	//--- table actions
	"Add row": "添加行",
	"Add column": "添加列",
	"Apply changes to file and save": "应用更改并保存",
    	"Applies the csv content back to the source file and saves the source file (if something changed) [ctrl+s/cmd+s]": "将 CSV 内容应用回源文件并保存源文件（如果有更改）[ctrl+s/cmd+s]",
	"Apply changes to file": "应用更改到文件",
    	"Applies the csv content back to the source file (if something changed). After this the editor has no unsaved changes.": "将 CSV 内容应用回源文件（如果有更改）。执行后编辑器将没有未保存的更改。",
	"Show comments": "显示注释",
	"Hide comments": "隐藏注释",
	"Hides rows starting with a comment. The row headers will display an indicator if a row above or below is hidden. Hidden rows are also exported!":
		"隐藏以注释开头的行。如果某行的上方或下方有隐藏行,行标题会显示提示。隐藏的行也会被导出!",
	Tools: "工具",
	Trim: "修剪",
	"Trims every cell (including header row) in the table (removes leading and trailing spaces, tabs, ...). This will clear undo/redo stack!":
		"修剪表格中的每个单元格(包括表头行),去除首尾的空格、制表符等。这会清空撤销/重做记录!",
	Transpose: "转置",
	"Swaps columns and rows. This excludes the header row. Slow for large tables! This will clear undo/redo stack!":
		"交换行与列(不包括表头行)。对大表格较慢!这会清空撤销/重做记录!",
	Help: "帮助",

	//--- context menu
	"Hide column(s)": "隐藏列",
	"Unhide all columns": "取消隐藏所有列",
	"Copy column name(s)": "复制列名",
	"Edit header cell": "编辑表头单元格",
	"Resize row to {0}px": "将行高设为 {0}px",
	"Resize column to {0}px": "将列宽设为 {0}px",
	"Selection to file cursors": "将选区设为源文件光标",
	"Cursor at cell start": "光标在单元格开头",
	"Cursor at cell end": "光标在单元格结尾",
	"Cursor select entire cell": "光标选中整个单元格",

	//--- side panel (stats)
	"Numbers sum": "数值总和",
	"The sum of numbers in the selected cells (only connected cells). Only the first number of a cell is used. Arbitrary-precision is powered by big.js":
		"所选单元格中数字的总和(仅限连续区域),只使用单元格中的第一个数字。任意精度由 big.js 提供支持",
	"Selected cells": "已选单元格",
	"The number of selected cells": "所选单元格的数量",
	"Not empty": "非空",
	"The selected cells count where the value is not empty (whitespace is counted as value)":
		"所选单元格中值不为空的数量(空白字符也计为值)",
	"Selected rows": "已选行",
	"The selected rows count": "所选行的数量",
	"Selected cols": "已选列",
	"The selected columns count": "所选列的数量",
	"Rows count": "行数",
	"Cols count": "列数",
	"Numbers style": "数字格式",
	"The number style only applies for the stats, does not affect sorting! Change before selecting cells.":
		"数字格式仅用于统计,不影响排序!请先更改,再选择单元格。",
	"Decimal separator: '.' Thousand separator: a single whitespace or ','":
		"小数分隔符:“.”;千位分隔符:单个空白字符或“,”",
	"Decimal separator: ',' Thousand separator: a single whitespace or '.'":
		"小数分隔符:“,”;千位分隔符:单个空白字符或“.”",
	"Some invalid num": "含无效数字",

	//--- table
	"No data received": "未收到数据",

	//--- status bar
	Error: "错误",
	"Receiving csv...": "正在接收 csv……",
	"Rendering table...": "正在渲染表格……",
	"Performing last steps...": "正在执行最后步骤……",
	"Swapping finished, rendering...": "交换完成,正在渲染……",

	//--- find widget
	"Find...": "查找……",
	"Enter to start search": "回车开始搜索",
	"No results": "无结果",
	Cancelled: "已取消",
	"Match case": "区分大小写",
	"Match whole cell value": "匹配整个单元格",
	"Trims the cell value before comparing": "比较前先去除单元格内容两端的空白",
	"Use regular expression": "使用正则表达式",
	"Start search (Enter)": "开始搜索(回车)",
	"Cancel search (Escape)": "取消搜索(Esc)",
	"The table has changed, thus the search is outdated. Click to refresh the search.":
		"表格已更改,搜索结果已过期。点击刷新搜索。",
	"Previous match (⇧F3)": "上一个匹配项(⇧F3)",
	"Next match (F3)": "下一个匹配项(F3)",
	"Close (Escape)": "关闭(Esc)",

	//--- cell links
	"(ctrl + click)": "(Ctrl + 点击)",
	"(cmd + click)": "(⌘ + 点击)",

	//--- modals
	Reset: "重置",
	Cancel: "取消",
	Reload: "重新加载",
	"Reload file content and discard changes": "重新加载文件内容并放弃更改",
	"Are you sure you want to read the source file again?":
		"确定要重新读取源文件吗?",
	"All changes to the table will be discarded!":
		"对表格所做的全部更改都将被丢弃!",
	"This also updates the snapshot of the file that is used for the 'reset data' function.":
		"这也会更新“重置数据”功能所使用的文件快照。",
	"Are you sure that you want to overwrite the table with the initial content (snapshot) of the source file?":
		"确定要用源文件的初始内容(快照)覆盖当前表格吗?",
	"This will use the original data (when opening the CSV editor) and discard all changes applied to the table!":
		"这将使用原始数据(打开 CSV 编辑器时的内容),并放弃对表格所做的全部更改!",
	"Please note that the content of the csv file will not be read or loaded again (a snapshot of the file was stored in memory when the csv editor was opened)!":
		"请注意,csv 文件的内容不会被重新读取或加载(打开 csv 编辑器时,文件快照已保存在内存中)!",
	"Source file changed": "源文件已更改",
	"The source file has been changed, so the table is no longer up-to-date.":
		"源文件已被更改,表格内容已不是最新的。",
	"You can reload the contents of the file, which will discard all changes to the table!":
		"你可以重新加载文件内容,但这会丢弃对表格所做的全部更改!",
	"Or you can ignore the changes.": "也可以忽略这些更改。",
	"This will also update the snapshot of the file that is used for the 'reset data' feature.":
		"这也会更新“重置数据”功能所使用的文件快照。",
	Ignore: "忽略",

	//--- help modal
	"Features/Shortcuts": "功能 / 快捷键",
	"Undo/Redo": "撤销 / 重做",
	"Click on column header text to sort": "点击列标题文字即可排序",
	"Click left next to the row/column header text to select then drag to rearrange":
		"点击行/列标题文字左侧可选中整行/整列,然后拖动即可调整顺序",
	"Resize row/column": "调整行/列大小",
	"to move to the first cell in a row": "移到本行的第一个单元格",
	"to move to the last cell in a row": "移到本行的最后一个单元格",
	"to move to the first cell in a column": "移到本列的第一个单元格",
	"to move to the last cell in a column": "移到本列的最后一个单元格",
	"to cancel editing and close cell editor": "取消编辑并关闭单元格编辑器",
	"to add a line break in a cell": "在单元格内插入换行",
	"To delete a row/column hover over it and click the trash-icon":
		"要删除某行/某列,将鼠标移到其上并点击垃圾桶图标",
	"Double click on a column resize handle to fit content, double click on an auto sized column to set width to 200px (good for very wide columns)":
		"双击列宽调整手柄可使列宽适应内容;双击自动列宽的列可将其宽度设为 200px(适合非常宽的列)",
	"For a full list of shortcuts see": "完整快捷键列表请见",
	Hints: "提示",
	"Sorting is not automatically updated after data has changed":
		"数据更改后,排序结果不会自动更新",
	"Sorting state is exported": "排序状态也会被导出",
	"Similar to Excel, you can hold down the":
		"与 Excel 类似,你可以在松开鼠标按键前按住",
	"key before releasing the mouse button to copy the cell values. No interpolation is carried out.":
		"键来复制单元格的值,不会进行插值计算。",
	"You can use ctrl/cmd click on a column header to sort by multiple columns":
		"按住 ctrl/cmd 点击列标题可按多列排序",
	"The unsaved changes indicator is display on any change (never cleared until you apply the changes, even if you revert manually)":
		"只要发生更改就会显示未保存更改指示器(即使你手动撤销也不会清除,直到应用更改为止)",
	"When you see the unsaved changes indicator right after the table was loaded then some rows were expanded (to ensure all rows have the same length)":
		"如果表格刚加载就出现未保存更改指示器,说明有些行被扩展了(以确保所有行的长度一致)",
	"You can right-click on the table to get a context menu":
		"右键点击表格可打开右键菜单",
	"Hidden rows/columns are also exported": "隐藏的行/列也会被导出",
	"Comment rows will export only the first cell/column. If you use a cell other than the first for comments the cell color will indicate this.":
		"注释行只导出第一个单元格/列。如果注释不在第一个单元格,单元格颜色会有所提示。",
	"If you edit an unnamed (csv) file and close it then the editor will be closed too (unsaved changes will be lost)!":
		"如果编辑的是未命名的 (csv) 文件,关闭它时编辑器也会被关闭(未保存的更改将会丢失)!",
	"Copy & Past use tab (": "复制粘贴使用制表符(",
	") as separator (same as excel)": ")作为分隔符(与 Excel 一致)",
	"You cannot change the new line character (because vs code automatically converts it to the file setting i think)":
		"无法更改换行符(因为 vs code 会自动将其转换为文件设置)",
	"If a row has more cell than the others empty cells are added to match the row with the highest cell count":
		"如果某一行的单元格比其他行多,会为其他行补充空单元格,使所有行与单元格最多的行一致",
	"Extension configuration is only applied for new editors":
		"扩展配置只对新打开的编辑器生效",
	"You can delete multiple rows/cols by selecting them via shift and right click then remove (or":
		"可以按住 shift 右键点击选择多行/多列并删除(或按",

	//--- tooltips with dynamic parts
	"{0} (detected: {1})": "{0}(检测到:{1})",
}

registerTranslation("zh-cn", zhCnTranslation)
registerTranslation("zh-hans", zhCnTranslation)
registerTranslation("zh", zhCnTranslation)
