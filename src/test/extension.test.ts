//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import * as vscode from 'vscode'

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
// import * as myExtension from '../extension';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", function () {

    // Defines a Mocha unit test
    test("Something 1", function() {
        assert.equal(-1, [1, 2, 3].indexOf(5));
        assert.equal(-1, [1, 2, 3].indexOf(0));
    });

    //see https://vscode.rocks/testing/
    test('execute command', async function () {
        
        const newFile = vscode.Uri.parse('untitled:Untitled-2')

        const document = await vscode.workspace.openTextDocument(newFile)
        const textEditor = await vscode.window.showTextDocument(document)

        await vscode.commands.executeCommand('edit-csv.edit')

        // await sleep(1000)
        assert.equal(textEditor, vscode.window.activeTextEditor)


    })
});


// function sleep(ms: number): Promise<void> {
//     return new Promise(resolve => {
//       setTimeout(resolve, ms)
//     })
//   }