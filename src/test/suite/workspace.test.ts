'use strict';

import * as vscode from 'vscode';
import * as workspace from '../../utils/workspace';
import { after } from 'mocha';
import { before } from 'mocha';
import * as chai from 'chai';
import * as path from 'path';

const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

suite('Extension Test Suite', () => {
	before(() => {
		vscode.window.showInformationMessage('Start all tests.');
	});

	after(() => {
		vscode.window.showInformationMessage('All tests done!');
	});

	test('parseWorkspaceConfig', async () => {
		// The configPath looks overly convoluted since `__dirname` points to the directory of the resulting .js
		// file inside the `out` directory and not this source .ts file.
		const configPath = path.join(__dirname, '..', '..', '..', 'src', 'test', 'suite', 'json', '.remarkrc');
		console.log('configPath', configPath);
		const files =  [ vscode.Uri.parse(configPath) ];
		const config = await workspace.parseWorkspaceConfig(files);

		expect(config, 'config').to.not.be.null;
	});
});
