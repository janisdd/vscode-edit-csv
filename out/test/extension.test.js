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
// import * as vscode from 'vscode'
const util_1 = require("../util");
// Defines a Mocha unit test
// test("Something 1", function() {
//     assert.equal(-1, [1, 2, 3].indexOf(5));
//     assert.equal(-1, [1, 2, 3].indexOf(0));
// });
//see https://vscode.rocks/testing/
// const newFile = vscode.Uri.parse('untitled:Untitled-2')
// const document = await vscode.workspace.openTextDocument(newFile)
// const textEditor = await vscode.window.showTextDocument(document)
// await vscode.commands.executeCommand('edit-csv.edit')
// // await sleep(1000)
// assert.equal(textEditor, vscode.window.activeTextEditor)
// function sleep(ms: number): Promise<void> {
//     return new Promise(resolve => {
//       setTimeout(resolve, ms)
//     })
//   }
// Defines a Mocha test suite to group tests of similar kind together
suite("partitionString working properly", function () {
    test('partition size not fitting', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const text = '0123456789';
            const parts = util_1.partitionString(text, 3);
            const margedText = parts.map(p => p.text).join('');
            assert.equal(margedText, text);
        });
    });
    test('partition size larger than text', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const text = '0123456789';
            const parts = util_1.partitionString(text, text.length + 10);
            const margedText = parts.map(p => p.text).join('');
            assert.equal(margedText, text);
        });
    });
    test('partition size perfect fit', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const text = '0123456789';
            const parts = util_1.partitionString(text, text.length);
            const margedText = parts.map(p => p.text).join('');
            assert.equal(margedText, text);
        });
    });
});
//# sourceMappingURL=extension.test.js.map