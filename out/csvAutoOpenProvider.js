"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvAutoOpenProvider = void 0;
const vscode = require("vscode");
const extension_1 = require("./extension");
/**
 * A simple custom editor provider that auto-opens the CSV table editor.
 * This directly calls the editor creation function without needing activeTextEditor.
 */
class CsvAutoOpenProvider {
    /**
     * Called when a CSV file is opened.
     */
    openCustomDocument(uri, openContext, token) {
        return __awaiter(this, void 0, void 0, function* () {
            // Return a minimal document
            return {
                uri,
                dispose: () => { }
            };
        });
    }
    /**
     * Called to render the custom editor.
     * We pass the panel to the table editor to reuse it (no flicker!)
     */
    resolveCustomEditor(document, webviewPanel, token) {
        return __awaiter(this, void 0, void 0, function* () {
            // Show loading spinner while we prepare the table editor
            webviewPanel.webview.html = `
			<!DOCTYPE html>
			<html>
			<head>
				<style>
					body {
						display: flex;
						justify-content: center;
						align-items: center;
						height: 100vh;
						margin: 0;
						font-family: var(--vscode-font-family);
						color: var(--vscode-foreground);
						background: var(--vscode-editor-background);
					}
					.loader-container {
						text-align: center;
					}
					.spinner {
						border: 6px solid rgba(128, 128, 128, 0.2);
						border-top: 6px solid #0f9423;
						border-radius: 50%;
						width: 80px;
						height: 80px;
						animation: spin 1s linear infinite;
						margin: 0 auto 20px;
					}
					@keyframes spin {
						0% { transform: rotate(0deg); }
						100% { transform: rotate(360deg); }
					}
					.message {
						font-size: 18px;
						margin-top: 10px;
						font-weight: 500;
					}
				</style>
			</head>
			<body>
				<div class="loader-container">
					<div class="spinner"></div>
					<div class="message">Loading CSV editor...</div>
				</div>
			</body>
			</html>
		`;
            // // Load the document and open the table editor
            const textDocument = yield vscode.workspace.openTextDocument(document.uri);
            // // Pass the panel to reuse it
            // // If editor already exists, it will be revealed and this panel disposed
            // // If new editor created, it will reuse this panel
            yield (0, extension_1.openCsvEditorForDocument)(textDocument, null, webviewPanel);
        });
    }
}
exports.CsvAutoOpenProvider = CsvAutoOpenProvider;
//# sourceMappingURL=csvAutoOpenProvider.js.map