import * as fs from "fs"
import * as path from "path"
import * as fse from "fs-extra";
import * as jsdom from "jsdom";
import { exit } from "process";
import * as readlineSync from "readline-sync";
const { JSDOM } = jsdom

/*
builds the browser website
actually this does only parses the given sites and places all
script
link
tag targets into the dist folder...
*/


// console.log(__dirname)
//see output of console.log(__dirname)
const pathModPath = `../../../browser/`
const basePath = path.join(__dirname, pathModPath)

const distPath = path.join(basePath, `dist`)
const assetsPrefixDir = `assets`
const assetsDistPath = path.join(distPath, assetsPrefixDir)

const sourceMapLineRegex = /^\/\/# sourceMappingURL=(.*)$/gm

type PathNameTuple = {
	outputName: string
	originalFullPath: string
}
//because we collapse the paths to only start with assets/[NAME]
//we could get name collisions... we use these vars to indicate duplicate names and throw an error (must be fixed manually somehow)
const jsScriptPathNames = new Map<string, PathNameTuple>()
const cssLinkPathNames = new Map<string, PathNameTuple>()
const imgPathNames = new Map<string, PathNameTuple>()

//this is relative to csvEditorHtml/browser/
const htmlFilePathsToBuild: string[] = [
	`indexBrowser.html`,
	`legalNotice.html`,
	`privacy.html`,
]

//this is relative to csvEditorHtml/browser/
//directories ends with /
const justCopyPaths = [
	[`../../thirdParty/fortawesome/fontawesome-free/webfonts/`, `webfonts/`]
]

//we inject the hash into the file name and .htaccess should rewrite the urls...
const buildHash = uuidv4()

function main() {

	const ensureDistDirAndAssetsExists = () => {
		try {
			if (fs.existsSync(distPath)) {
				console.log(`[INFO] dist path exists ${distPath}`)
			} else {
				console.log(`[INFO] dist path does NOT exist ... creating dir ${distPath}`)
				fs.mkdirSync(distPath)
			}
		} catch (error) {
			console.log(`[ERROR] could not check or create dist path ${distPath}`)
			console.log(`[ERROR] error`, error)
			exit(1)
			return
		}

		try {
			if (fs.existsSync(assetsDistPath)) {
				console.log(`[INFO] dist path assets exists ${assetsDistPath}`)
			} else {
				console.log(`[INFO] dist assets path does NOT exist ... creating dir ${assetsDistPath}`)
				fs.mkdirSync(assetsDistPath)
			}
		} catch (error) {
			console.log(`[ERROR] could not check or create dist assets path ${assetsDistPath}`)
			console.log(`[ERROR] error`, error)
			exit(1)
			return
		}
	}

	ensureDistDirAndAssetsExists()

	let _distEntries: string[] = []
	try {
		_distEntries = fs.readdirSync(distPath)
	} catch (error) {
		//this is ok if the dist path does not exists
		console.log(`[ERROR] could not check if the dist dist dir is empty ${distPath}`)
		console.log(`[ERROR] error`, error)
		exit(1)
		return
	}

	if (_distEntries.length > 0) {

		console.log(`[INFO] dist dir: ${distPath}`)
		const should = readlineSync.question(`[QUESTION] the dist dir already contains output, do you want to clear it (else we just overwrite)? (y/n) (default n)`)

		if (should === 'y') {
			try {
				fse.removeSync(distPath)
			} catch (error) {
				console.log(`[ERROR] could not delete dist dir content ${distPath}`)
				console.log(`[ERROR] error`, error)
				exit(1)
				return
			}

			//after we deleted everything, we need to re-create the dirs
			ensureDistDirAndAssetsExists()
		}
	}


	//--- just copy section

	console.log()
	console.log(`[INFO] --- just copying ---`)
	console.log()
	{
		for (let i = 0; i < justCopyPaths.length; i++) {
			const justCopyPath = justCopyPaths[i];
			const sourcePath = path.join(basePath, justCopyPath[0])
			const outputPath = path.join(distPath, justCopyPath[1])

			console.log(`[INFO] copying recursively from ${sourcePath} to ${outputPath}`)

			try {
				fse.copySync(sourcePath, outputPath)
			} catch (error) {
				console.log(`[ERROR] could not copy from ${sourcePath} to ${outputPath}`)
				console.log(`[ERROR] error`, error)
				exit(1)
			}
		}
	}

	console.log()
	console.log(`[INFO] --- processing html files ---`)
	console.log()
	for (let i = 0; i < htmlFilePathsToBuild.length; i++) {
		const htmlFilePath = htmlFilePathsToBuild[i]

		const absoluteHtmlFilePath = path.join(basePath, htmlFilePath)

		try {
			const stat = fs.statSync(absoluteHtmlFilePath)

			if (!stat.isFile()) {
				console.log(`[ERROR] file: ${absoluteHtmlFilePath} is not a file (found directory)`)
				exit(1)
				continue
			}

		} catch (error) {

			console.log(`[ERROR] could not find file: ${absoluteHtmlFilePath}`)
			console.log(`[ERROR] error: `, error)
			exit(1)
			continue
		}

		//read file
		let content = ''
		try {
			content = fs.readFileSync(absoluteHtmlFilePath, 'utf8')
		} catch (error) {
			console.log(`[ERROR] could not read file: ${absoluteHtmlFilePath}`)
			console.log(`[ERROR] error: `, error)
			exit(1)
			continue
		}

		console.log(``)
		console.log(``)
		console.log(`[INFO] read file ${absoluteHtmlFilePath}`)
		console.log(``)
		console.log(``)

		const dom = new JSDOM(content)
		const { document } = dom.window

		const links = getAllCssLinkElements(document)
		const scripts = getAllScriptElements(document)
		const imgs = getAllImgElements(document)
		const allAnchors = getAllAnchorElements(document)
		const comments = getAllCommentElements(document, dom)

		//--- now copy files to dist dir

		console.log()
		console.log(`[INFO] --- removing comments (${comments.length}) ---`)
		for (let j = 0; j < comments.length; j++) {
			const commentNode = comments[j]
			commentNode.remove()
			console.log(`[INFO] removed comment: ${commentNode.textContent}`)
		}

		// const afterCopiedHandlers: Array<() => void> = []

		console.log()
		console.log(`[INFO] --- css files (${links.length}) ---`)
		for (let j = 0; j < links.length; j++) {
			const cssLink = links[j]

			let fileName = path.basename(cssLink.href)
			let fileParts = getFilePars(fileName)
			let hrefPath = cssLink.href.substr(0, cssLink.href.length - fileName.length)

			const newFileName = `${fileParts.namePart}.${buildHash}.${fileParts.extensionPart}`

			const cssLinkSourcePath = path.join(basePath, cssLink.href)
			const outputPath = path.join(assetsDistPath, fileName)

			console.log(`[INFO] found candidate css file (${j + 1}) relative path: ${cssLink.href}, absolute path: ${cssLinkSourcePath} ...`)

			checkAndAddCssFilePath(fileName, cssLinkSourcePath)

			//copy is step 1
			try {
				fs.copyFileSync(cssLinkSourcePath, outputPath)
				console.log(`[INFO] ... copyied css file ${cssLinkSourcePath} to ${outputPath}`)
			} catch (error) {
				console.log(`[ERROR] ... error copying css file ${cssLinkSourcePath} to ${outputPath}`)
				throw error
			}

			//now we need to replace the path in the html file...
			const _pathKeepDepth = cssLink.getAttribute('data-path-keep-depth')

			if (!_pathKeepDepth) {
				cssLink.href = path.join(assetsPrefixDir, newFileName)
			} else {

				const pathKeepDepth = parseInt(_pathKeepDepth)

				if (isNaN(pathKeepDepth)) {
					console.log(`[ERROR] invalid data-path-keep-depth value`)
					exit(1)
					return
				}
				cssLink.removeAttribute('data-path-keep-depth')

				let dirPaths: string[] = []

				for (let k = 0; k < pathKeepDepth; k++) {
					let dirName = path.basename(hrefPath)
					dirPaths.unshift(dirName)
					hrefPath = hrefPath.substr(0, hrefPath.length - dirName.length - 1) //1 because the trailing /
				}

				//now we need to replace the path in the html file...

				cssLink.href = path.join(...dirPaths, newFileName)
			}

		}

		console.log()
		console.log(`[INFO] --- script files (${scripts.length}) ---`)
		for (let j = 0; j < scripts.length; j++) {
			const scriptTag = scripts[j]
			const scriptSourceSrcPath = path.join(basePath, scriptTag.src)


			let fileName = path.basename(scriptSourceSrcPath)
			let fileParts = getFilePars(fileName)
			const newFileName = `${fileParts.namePart}.${buildHash}.${fileParts.extensionPart}`

			const outputPath = path.join(assetsDistPath, fileName)

			console.log(`[INFO] found candidate script file (${j + 1}) relative path: ${scriptTag.src}, absolute path: ${scriptSourceSrcPath}`)

			checkAndAddJsFilePath(fileName, scriptSourceSrcPath)

			//copy is step 1
			try {
				copyFileSyncAndChangeContent(scriptSourceSrcPath, outputPath, replaceJsSourceMapLine)
				console.log(`[INFO] ... copyied script file ${scriptSourceSrcPath} to ${outputPath}`)
			} catch (error) {
				console.log(`[ERROR] ... error copying script file ${scriptSourceSrcPath} to ${outputPath}`)
				throw error
			}

			//now we need to replace the path in the html file...
			scriptTag.src = path.join(assetsPrefixDir, newFileName)
		}

		console.log()
		console.log(`[INFO] --- img files (${imgs.length}) ---`)
		for (let j = 0; j < imgs.length; j++) {
			const imgTag = imgs[j]
			const imgSourceSrcPath = path.join(basePath, imgTag.src)

			let fileName = path.basename(imgTag.src)
			let fileParts = getFilePars(fileName)
			const newFileName = `${fileParts.namePart}.${buildHash}.${fileParts.extensionPart}`

			const outputPath = path.join(assetsDistPath, fileName)

			console.log(`[INFO] found candidate img file (${j + 1}) relative path: ${imgTag.src}, absolute path: ${imgSourceSrcPath} ...`)

			checkAndAddImgFilePath(fileName, imgSourceSrcPath)

			//copy is step 1
			try {
				fs.copyFileSync(imgSourceSrcPath, outputPath)
				console.log(`[INFO] ... copyied img file ${imgSourceSrcPath} to ${outputPath}`)
			} catch (error) {
				console.log(`[ERROR] ... error copying img file ${imgSourceSrcPath} to ${outputPath}`)
				throw error
			}

			//now we need to replace the path in the html file...
			imgTag.src = path.join(assetsPrefixDir, newFileName)
		}

		//--- all fiels are copied now create html file with replaced paths

		//make sure all anchors use no
		{
			for (let j = 0; j < allAnchors.length; j++) {
				const anchor = allAnchors[j]
				anchor.rel = `noopener noreferrer`
			}
		}

		const outputHtml = dom.serialize()

		const htmlOutputPath = path.join(distPath, path.basename(absoluteHtmlFilePath))
		console.log(`[IFNO] writing re-written html file to ${htmlOutputPath}`)

		fs.writeFileSync(htmlOutputPath, outputHtml, 'utf8')

	}

	console.log(``)
	console.log(`[INFO] finished`)
}

main()

/**
 * returns all css linkls that have a href
 * use data-path-keep-depth attribute to keep the number of dirs from the path (from target to root), then we don't use the assets prefix dir
 * @param document 
 */
function getAllCssLinkElements(document: Document): HTMLLinkElement[] {

	const cssLinkElements: HTMLLinkElement[] = []
	const allCssLinks = document.querySelectorAll(`link`)

	for (let j = 0; j < allCssLinks.length; j++) {
		const cssLink = allCssLinks.item(j)

		if (!cssLink.href) continue

		cssLinkElements.push(cssLink)
	}

	return cssLinkElements
}

/**
 * returns all script tags that have a src
 * @param document 
 */
function getAllScriptElements(document: Document): HTMLScriptElement[] {

	const scriptElements: HTMLScriptElement[] = []
	const allScripts = document.querySelectorAll(`script`)

	for (let j = 0; j < allScripts.length; j++) {
		const scriptTag = allScripts.item(j)

		if (!scriptTag.src) continue

		//external scripts
		if (scriptTag.src.startsWith("http")) continue

		scriptElements.push(scriptTag)
	}

	return scriptElements
}

/**
 * returns all img tags that have a src
 * @param document 
 */
function getAllImgElements(document: Document): HTMLImageElement[] {

	const imgElements: HTMLImageElement[] = []
	const allImgs = document.querySelectorAll(`img`)

	for (let j = 0; j < allImgs.length; j++) {
		const imgTag = allImgs.item(j)

		if (!imgTag.src) continue

		imgElements.push(imgTag)
	}

	return imgElements
}

/**
 * returns all a tags that have a href
 * @param document 
 */
function getAllAnchorElements(document: Document): HTMLAnchorElement[] {

	const elements: HTMLAnchorElement[] = []
	const allTags = document.querySelectorAll(`a`)

	for (let j = 0; j < allTags.length; j++) {
		const imgTag = allTags.item(j)

		if (!imgTag.href) continue

		elements.push(imgTag)
	}

	return elements
}

/**
 * returns all comment nodes
 * @param document 
 */
function getAllCommentElements(document: Document, dom: jsdom.JSDOM): Comment[] {

	const elements: Comment[] = []

	const commentIterator = document.createNodeIterator(document,
		dom.window.NodeFilter.SHOW_COMMENT, {
		acceptNode: (node) => dom.window.NodeFilter.FILTER_ACCEPT
	})

	while (commentIterator.nextNode()) {
		const commentNode = commentIterator.referenceNode as Comment
		elements.push(commentNode)
	}
	return elements
}

function copyFileSyncAndChangeContent(filePath: string, outputPath: string, replaceFunc: (content: string) => string) {


	try {
		const content = fs.readFileSync(filePath, 'utf8')
		const newContent = replaceFunc(content)
		fs.writeFileSync(outputPath, newContent, 'utf8')
	} catch (error) {
		throw error
	}

}

function replaceJsSourceMapLine(jsFileContent: string): string {
	const cleanJs = jsFileContent.replace(sourceMapLineRegex, '\n')
	return cleanJs
}

/**
 * used for cache busting, see https://css-tricks.com/strategies-for-cache-busting-css/
 * better not use query string ... better: file.hash.ext
 * see https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
 */
function uuidv4(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8)
		return v.toString(16);
	})
}
type FileParts = {
	namePart: string
	extensionPart: string
}
/**
 * returns the parts (name, extension) of a file name (not a path!)
 */
function getFilePars(fileName: string): FileParts {

	if (fileName.indexOf("/") !== -1 || fileName.indexOf("\\") !== -1) throw new Error(`only file names are allowed`)

	const parts = fileName.split('.')

	return {
		namePart: parts[0],
		extensionPart: parts.slice(1).join('.')
	}
}

function checkAndAddCssFilePath(cssFileName: string, fullCssLinkSourcePath: string) {
	if (cssLinkPathNames.has(cssFileName)) {

		const otherFile = cssLinkPathNames.get(cssFileName)

		//this can actually happen if we use the exact same css file twice e.g. with preloading

		if (otherFile?.originalFullPath !== fullCssLinkSourcePath) {
			//we already got this file name... throw
			throw new Error(`[ERROR] other CSS file has the same output name '${cssFileName}'! The other file full path is '${otherFile?.originalFullPath}', the current file full path is '${fullCssLinkSourcePath}'`)
		}
	}

	cssLinkPathNames.set(cssFileName, {
		outputName: cssFileName,
		originalFullPath: fullCssLinkSourcePath
	})
}

function checkAndAddJsFilePath(jsFileName: string, fullJsLinkSourcePath: string) {
	if (cssLinkPathNames.has(jsFileName)) {

		const otherFile = jsScriptPathNames.get(jsFileName)
		//we already got this file name... throw
		throw new Error(`[ERROR] other JS file has the same output name '${jsFileName}'! The other file full path is '${otherFile?.originalFullPath}', the current file full path is '${fullJsLinkSourcePath}'`)
	}

	jsScriptPathNames.set(jsFileName, {
		outputName: jsFileName,
		originalFullPath: fullJsLinkSourcePath
	})
}

function checkAndAddImgFilePath(imgFileName: string, fullImgLinkSourcePath: string) {
	if (cssLinkPathNames.has(imgFileName)) {

		const otherFile = imgPathNames.get(imgFileName)
		//we already got this file name... throw
		throw new Error(`[ERROR] other IMG file has the same output name '${imgFileName}'! The other file full path is '${otherFile?.originalFullPath}', the current file full path is '${fullImgLinkSourcePath}'`)
	}

	imgPathNames.set(imgFileName, {
		outputName: imgFileName,
		originalFullPath: fullImgLinkSourcePath
	})
}
