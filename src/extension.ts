'use strict';

import * as vscode from 'vscode';
import * as remark from 'remark';
import { resolveMany } from 'npm-module-path';

import { fileRead } from './utils/fs';

let output: vscode.OutputChannel;

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

interface IResult {
	content: string;
	range: vscode.Range;
}

/**
 * Show message in output channel.
 */
function showOutput(msg: string): void {
	msg = msg.toString();

	if (!output) {
		output = vscode.window.createOutputChannel('Remark');
	}

	output.clear();
	output.appendLine('[Remark]');
	output.append(msg);
	output.show();
}

function getWorkspaceConfig() {
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

function getPlugins(list: string[]): Promise<IPlugin[]> {
	const root = vscode.workspace.rootPath || '';

	const pluginList = list.map((name) => {
		if (typeof name === 'string') {
			return 'remark-' + name;
		} else {
			return 'remark-' + name[0];
		}
	});

	return resolveMany(pluginList, root).then((filepaths) => {
		return filepaths.map((filepath, index) => <IPlugin>{
			name: list[index],
			package: filepath !== undefined ? require(filepath) : undefined,
			settings: typeof list[index] !== 'string' ? list[index][1] : undefined
		});
	});
}

async function getRemarkSettings() {
	let config;
	let remarkSettings;

	if (vscode.workspace.rootPath) {
		config = await getWorkspaceConfig();
	}
	if (config && Object.keys(config).length !== 0) {
		remarkSettings = config;
		remarkSettings.rules = config.settings;
		remarkSettings.plugins = config.plugins || [];
		return remarkSettings;
	}

	remarkSettings = vscode.workspace.getConfiguration('remark').get<IRemarkSettings>('format');
	remarkSettings = Object.assign(<IRemarkSettings>{
		plugins: [],
		rules: {}
	}, remarkSettings);

	return remarkSettings;
}

async function runRemark(document: vscode.TextDocument, range: vscode.Range): Promise<any> {
	let api = remark();
	let errors: IPluginError[] = [];
	const remarkSettings = await getRemarkSettings();

	let plugins = [];
	if (remarkSettings.plugins.length !== 0) {
		plugins = await getPlugins(remarkSettings.plugins);
	}

	api = api.use({ settings: remarkSettings.rules });

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
				const settings = plugin.settings !== undefined
					? plugin.settings : remarkSettings[plugin.name];
				if (settings !== undefined) {
					api = api.use(plugin.package, settings);
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
		let message = '';
		errors.forEach((error) => {
			if (error.err === 'Package not found') {
				message += `[${error.name}]: ${error.err.toString()}. Use **npm i remark-${error.name}** or **npm i -g remark-${error.name}**.\n`;
				return;
			}

			message += `[${error.name}]: ${error.err.toString()}\n`;
		});

		return <any>Promise.reject(message);
	}

	let text;
	if (!range) {
		const lastLine = document.lineAt(document.lineCount - 1);
		const start = new vscode.Position(0, 0);
		const end = new vscode.Position(document.lineCount - 1, lastLine.text.length);

		range = new vscode.Range(start, end);
		text = document.getText();
	} else {
		text = document.getText(range);
	}

	return api.process(text).then((result) => {
		if (result.messages.length !== 0) {
			let message = '';
			result.messages.forEach((message) => {
				message += message.toString() + '\n';
			});

			return Promise.reject(message);
		}

		return Promise.resolve({
			content: result.contents,
			range
		});
	});
}

export function activate(context: vscode.ExtensionContext) {
	const supportedDocuments: vscode.DocumentSelector = [
		{ language: 'markdown', scheme: 'file' }
	];

	const command = vscode.commands.registerTextEditorCommand('remark.reformat', (textEditor: vscode.TextEditor) => {
		runRemark(textEditor.document, null)
			.then((result: IResult) => {
				textEditor.edit((editBuilder) => {
					editBuilder.replace(result.range, result.content);
				});
			})
			.catch(showOutput);
	});

	const formatCode = vscode.languages.registerDocumentRangeFormattingEditProvider(supportedDocuments, {
		provideDocumentRangeFormattingEdits(document, range) {
			return runRemark(document, range).then((result: IResult) => {
				return [vscode.TextEdit.replace(range, result.content)];
			}).catch(showOutput);
		}
	});

	// Subscriptions
	context.subscriptions.push(command);
	context.subscriptions.push(formatCode);
}
