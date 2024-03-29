const fs = require('fs');
const path = require('path');
const componentsExcludeList = require('../excludedTests');

const componentsIncludList = process.argv.reduce((includedList, itemToInclude) => {
	if (itemToInclude.substr(0, 4) === 'vwc-') {
		includedList.push(itemToInclude);
	}
	return includedList;
}, []);

function getFilteredTestFolders(workingFolder = '../tests') {
	return getTestFolders(workingFolder)
		.filter((testName) => {
			return componentsIncludList.length ? componentsIncludList.includes(testName) : !componentsExcludeList.includes(testName);
		});
}

function getTestFolders(workingFolder = '../tests') {
	const testFolders = [];
	const testsFolder = path.join(__dirname, workingFolder);
	fs.readdirSync(testsFolder)
		.forEach((testFolder) => {
			const absolutePath = path.join(testsFolder, testFolder);
			if (fs.statSync(absolutePath)
				.isDirectory()) {
				testFolders.push(testFolder);
			}
		});
	return testFolders;
}

async function saveFile(relativeFilePath, fileContents) {
	const savedFolder = path.join(__dirname, relativeFilePath);
	await ensureExists(savedFolder);
	fs.writeFileSync(savedFolder, fileContents);
}

function readFile(relativePath) {
	return fs.readFileSync(path.join(__dirname, relativePath));
}

async function ensureExists(folderPath, mask = 0o777) {
	const folders = folderPath.split('/');
	folders.splice(-1, 1);
	let rebuiltFolderPath = '';
	const ensureFolderExists = ensureFolderExistsFactory(mask);
	for (let i = 0; i < folders.length; i++) {
		const folderName = folders[i];
		if (!folderName) continue;
		rebuiltFolderPath += `/${folderName}`;
		await ensureFolderExists(rebuiltFolderPath);
	}
}

function ensureFolderExistsFactory(mask) {
	return function (folderPath) {
		return new Promise((res, rej) => {
			const resolveFolderPath = path.resolve(folderPath);
			fs.mkdir(resolveFolderPath, mask, function (err) {
				if (err) {
					if (err.code == 'EEXIST') {
						res(null);
					} else {
						rej(err);
					}
				} else {
					res(null);
				}
			});
		});
	};
}

module.exports = {
	getTestFolders,
	saveFile,
	readFile,
	getFilteredTestFolders
};