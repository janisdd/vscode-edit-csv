//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
// import * as vscode from 'vscode'
import { partitionString } from '../util';


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

    test('partition size not fitting', async function () {
        
        const text = '0123456789'

        const parts = partitionString(text, 3)

        const margedText = parts.map(p => p.text).join('')

        assert.equal(margedText, text)
    })

    test('partition size larger than text', async function () {
        
        const text = '0123456789'

        const parts = partitionString(text, text.length+10)

        const margedText = parts.map(p => p.text).join('')

        assert.equal(margedText, text)
    })

    test('partition size perfect fit', async function () {
        
        const text = '0123456789'

        const parts = partitionString(text, text.length)

        const margedText = parts.map(p => p.text).join('')

        assert.equal(margedText, text)
    })

});



