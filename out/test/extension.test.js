"use strict";
//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'assert' provides assertion methods from node
const assert = require("assert");
const vscode = require("vscode");
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
// import * as myExtension from '../extension';
// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", function () {
    // Defines a Mocha unit test
    test("Something 1", function () {
        assert.equal(-1, [1, 2, 3].indexOf(5));
        assert.equal(-1, [1, 2, 3].indexOf(0));
    });
    //see https://vscode.rocks/testing/
    test('execute command', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const newFile = vscode.Uri.parse('untitled:Untitled-2');
            const document = yield vscode.workspace.openTextDocument(newFile);
            const textEditor = yield vscode.window.showTextDocument(document);
            yield vscode.commands.executeCommand('edit-csv.edit');
            // await sleep(1000)
            assert.equal(textEditor, vscode.window.activeTextEditor);
        });
    });
});
// function sleep(ms: number): Promise<void> {
//     return new Promise(resolve => {
//       setTimeout(resolve, ms)
//     })
//   }
//# sourceMappingURL=extension.test.js.map