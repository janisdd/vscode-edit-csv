const readline = require('readline')


//see https://stackoverflow.com/questions/18193953/waiting-for-user-to-enter-input-in-node-js

/**
 * 
 * @param {string} query 
 * @returns {Promise<string>}
 */
function askQuestion(query) {
	const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
	})

	return new Promise(resolve => rl.question(query, ans => {
			rl.close();
			resolve(ans);
	}))
}

//see https://stackoverflow.com/questions/46515764/how-can-i-use-async-await-at-the-top-level

/**
 * @returns {Promise<number>} exit code
 */
async function main() {
	const answer = await askQuestion('Did you upload the .vsix file? (y/n)')
	return answer === 'y' ? 0 : 1
}

// main().then(p => {
// 	console.log(p);
// })

// const exitCode = await main()
// process.exit()
(async () => {
	try {
		const exitCode = await main()
		process.exit(exitCode)
	} catch (e) {
	}
})();


