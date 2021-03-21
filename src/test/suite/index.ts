'use strict';

import * as path from 'path';
import * as Mocha from 'mocha';
import * as glob from 'glob';

// The test coverage approach is inspired by https://github.com/microsoft/vscode-js-debug/blob/master/src/test/testRunner.ts
function setupCoverage() {
    const NYC = require('nyc');
	const nyc = new NYC({
		cwd: path.join(__dirname, '..', '..', '..'),
		exclude: ['**/test/**', '.vscode-test/**'],
		reporter: ['text', 'html'],
		all: true,
		instrument: true,
		hookRequire: true,
		hookRunInContext: true,
		hookRunInThisContext: true,
	});

    nyc.reset();
    nyc.wrap();

    return nyc;
}

export async function run(): Promise<void> {
	const nyc = process.env.COVERAGE ? setupCoverage() : null;
	const mocha = new Mocha({
		ui: 'tdd',
		color: true,
		timeout: 10 * 1000
	});
	const testsRoot = path.resolve(__dirname, '..');
	const files = glob.sync('**/*.test.js', { cwd: testsRoot });
	files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

	try {
		await new Promise((resolve, reject) =>
			mocha.run(failures =>
				failures ? reject(new Error(`${failures} tests failed`)) : resolve(undefined),
			)
		);
	} finally {
		if (nyc) {
			nyc.writeCoverageFile();
			await nyc.report();
		}
	}
}
