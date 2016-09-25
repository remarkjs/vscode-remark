'use strict';

import * as vscode from 'vscode';
import * as remark from 'remark';
import { resolveMany } from 'npm-module-path';

interface IPlugin {
	name: string;
	package: any;
}

interface IPluginError {
	name: string;
	err: any;
}

interface IRemarkSettings {
	plugins: string[];
	rules: any;
}

interface IRemarkResult {
	data: any;
	messages: any;
	history: any;
	cwd: string;
	contents: string;
}

function getPlugins(list: string[]): Promise<IPlugin[]> {
	const root = vscode.workspace.rootPath || '';

	const pluginList = list.map((name) => 'remark-' + name);

	return resolveMany(pluginList, root).then((filepaths) => {
		return filepaths.map((filepath, index) => <IPlugin>{
			name: list[index],
			package: filepath !== undefined ? require(filepath) : undefined
		});
	});
}

function runRemark(textEditor: vscode.TextEditor, settings: IRemarkSettings, plugins: IPlugin[]): void {
	let api = remark();
	let errors: IPluginError[] = [];

	if (plugins.length !== 0) {
		plugins.forEach((plugin) => {
			if (plugin.package === undefined) {
				errors.push({
					name: plugin.name,
					err: 'Package not found'
				});
				return;
			}

			try {
				if (settings[plugin.name]) {
					api = api.use(plugin.package, settings[plugin.name]);
				} else {
					api = api.use(plugin.package);
				}
			} catch (err) {
				errors.push({
					name: plugin.name,
					err
				});
			}
		});
	}

	if (errors.length !== 0) {
		errors.forEach((error) => {
			if (error.err === 'Package not found') {
				vscode.window.showErrorMessage(`[${error.name}]: ${error.err.toString()}. Use **npm i ${error.name}** or **npm i -g ${error.name}**.`);
				return;
			}

			vscode.window.showErrorMessage(`[${error.name}]: ${error.err.toString()}`);
		});

		return;
	}

	const text = textEditor.document.getText();

	api.process(text, settings.rules, (err, result: IRemarkResult) => {
		if (err) {
			console.log(err);
			vscode.window.showErrorMessage(`[remark]: ${err.toString()}`);
			return;
		}

		if (result.messages.length !== 0) {
			result.messages.forEach((message) => {
				vscode.window.showWarningMessage(`[remark]: ${message.toString()}`);
			});
		}

		textEditor.edit((editBuilder: vscode.TextEditorEdit) => {
			const document = textEditor.document;
			const lastLine = document.lineAt(document.lineCount - 1);
			const start = new vscode.Position(0, 0);
			const end = new vscode.Position(document.lineCount - 1, lastLine.text.length);
			const range = new vscode.Range(start, end);

			editBuilder.replace(range, result.contents);
		});
	});
}

export function activate(context: vscode.ExtensionContext) {
	const toDisposable = vscode.commands.registerTextEditorCommand('remark.reformat', (textEditor: vscode.TextEditor) => {
		if (textEditor.document.languageId !== 'markdown') {
			return;
		}

		const remarkSettings = vscode.workspace.getConfiguration('remark').get<IRemarkSettings>('format');

		if (remarkSettings.plugins.length !== 0) {
			return getPlugins(remarkSettings.plugins).then((plugins) => {
				runRemark(textEditor, remarkSettings, plugins);
			});
		}

		runRemark(textEditor, remarkSettings, []);
	});

	context.subscriptions.push(toDisposable);
}
