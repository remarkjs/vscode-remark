'use strict';

import * as vscode from 'vscode';
import { fileRead } from './fs';
import * as yaml from 'yaml';

export async function getWorkspaceConfig() {
	const files = await vscode.workspace.findFiles('**/*remarkrc*', '**/node_modules/**');
	return await parseWorkspaceConfig(files);
}

export async function parseWorkspaceConfig(files : vscode.Uri[]) {
	if (files.length === 0) {
		return null;
	}

	const fileName = files[0].fsPath;

	if (fileName.endsWith('.js')) {
		try {
			return require(files[0].fsPath);
		}
		catch (err) {
			console.error(err);
			return 'SyntaxError';
		}
	}

	const content = await fileRead(files[0].fsPath);
	
	try {
		if (fileName.endsWith('.yml') || fileName.endsWith('.yaml')) {
			return yaml.parse(content);
		}
		
		return JSON.parse(content);
	}
	catch (err) {
		console.error(err);
		return 'SyntaxError';
	}
}
