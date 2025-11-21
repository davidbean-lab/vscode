/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// @ts-check

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const verbose = args.includes('--verbose') || args.includes('-v');
const dryRun = args.includes('--dry-run');
const help = args.includes('--help') || args.includes('-h');

if (help) {
	console.log(`
Update All Extensions Utility

Usage: node update-all-extensions.js [options]

Options:
	--verbose, -v    Show detailed output
	--dry-run        Check for updates without installing them
	--help, -h       Show this help message

Description:
	This utility updates all installed VS Code extensions to their latest compatible versions.
	It uses the VS Code CLI infrastructure to perform the updates.

Examples:
	node update-all-extensions.js
	node update-all-extensions.js --verbose
	node update-all-extensions.js --dry-run
`);
	process.exit(0);
}

const rootDir = path.join(__dirname, '..');
const outDir = path.join(rootDir, 'out');

if (!fs.existsSync(outDir)) {
	console.error('Error: VS Code must be built before running this script.');
	console.error('Please run: npm run compile or npm run watch');
	process.exit(1);
}

const codeCliPath = path.join(rootDir, 'scripts', 'code-cli.sh');

if (!fs.existsSync(codeCliPath)) {
	console.error('Error: code-cli.sh not found.');
	console.error('Expected location:', codeCliPath);
	process.exit(1);
}

console.log('VS Code Extension Update Utility');
console.log('================================\n');

if (dryRun) {
	console.log('Running in DRY-RUN mode - checking for updates without installing\n');
	
	const listArgs = ['--list-extensions', '--show-versions'];
	if (verbose) {
		console.log('Executing:', codeCliPath, listArgs.join(' '));
	}
	
	const listProcess = spawn(codeCliPath, listArgs, {
		cwd: rootDir,
		stdio: 'inherit'
	});
	
	listProcess.on('close', (code) => {
		if (code === 0) {
			console.log('\nTo update all extensions, run without --dry-run flag');
		}
		process.exit(code);
	});
	
	listProcess.on('error', (err) => {
		console.error('Error executing code-cli.sh:', err);
		process.exit(1);
	});
} else {
	console.log('Updating all installed extensions to their latest compatible versions...\n');
	
	const updateArgs = ['--update-extensions'];
	if (verbose) {
		console.log('Executing:', codeCliPath, updateArgs.join(' '));
	}
	
	const updateProcess = spawn(codeCliPath, updateArgs, {
		cwd: rootDir,
		stdio: 'inherit'
	});
	
	updateProcess.on('close', (code) => {
		if (code === 0) {
			console.log('\nExtension update process completed successfully');
		} else {
			console.error('\nExtension update process failed with code:', code);
		}
		process.exit(code);
	});
	
	updateProcess.on('error', (err) => {
		console.error('Error executing code-cli.sh:', err);
		process.exit(1);
	});
}
