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
		const configPath = path.join(__dirname, '..', '..', '..', 'test', '.remarkrc');
		console.log('configPath', configPath);
		const files =  [ vscode.Uri.parse(configPath) ];
		const config = await workspace.parseWorkspaceConfig(files);

		expect(config, 'config').to.not.be.null;
	});
});
