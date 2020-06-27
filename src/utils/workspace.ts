'use strict';

import * as vscode from 'vscode';
import { fileRead } from './fs';

export function getWorkspaceConfig() {
	return vscode.workspace.findFiles('**/*remarkrc*', '**/node_modules/**').then((files) => {
		if (files.length === 0) {
			return null;
		}

		if (files[0].fsPath.endsWith('.js')) {
			try {
				return require(files[0].fsPath);
			} catch (err) {
				return 'SyntaxError';
			}
		}

		return fileRead(files[0].fsPath).then((content) => {
			try {
				return JSON.parse(content);
			} catch (err) {
				return 'SyntaxError';
			}
		});
	});
}
