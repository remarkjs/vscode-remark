import * as vscode from 'vscode'
import * as remark from 'remark'
import type {VFileContents} from 'vfile'
import type {Plugin} from 'unified'
import {resolveMany} from 'npm-module-path'

import {getWorkspaceConfig} from './utils/workspace'

let output: vscode.OutputChannel

interface IPlugin {
  name: string
  package: Plugin
  settings: unknown
}

interface IPluginError {
  name: string
  err: 'Package not found' | unknown
}

interface IRemarkSettings {
  plugins: string[]
  rules: remark.PartialRemarkOptions
}

interface IResult {
  content: VFileContents
  range: vscode.Range
}

/**
 * Show message in output channel.
 */
function showOutput(message: string): void {
  message = message.toString()

  if (!output) {
    output = vscode.window.createOutputChannel('Remark')
  }

  output.clear()
  output.appendLine('[Remark]')
  output.append(message)
  output.show()
}

async function getPlugins(list: string[]): Promise<IPlugin[]> {
  const root = vscode.workspace.rootPath ?? ''

  const pluginList = list.map((name) => {
    if (typeof name === 'string') {
      return 'remark-' + name
    }

    return 'remark-' + name[0]
  })

  return resolveMany(pluginList, root).then((filepaths) => {
    return filepaths.map(
      (filepath, index): IPlugin => ({
        name: list[index],
        package: filepath === undefined ? undefined : require(filepath),
        settings: typeof list[index] === 'string' ? undefined : list[index][1]
      })
    )
  })
}

async function getRemarkSettings() {
  let config
  let remarkSettings

  if (vscode.workspace.rootPath) {
    config = await getWorkspaceConfig()
  }

  if (config && Object.keys(config).length > 0) {
    remarkSettings = config
    remarkSettings.rules = config.settings
    remarkSettings.plugins = config.plugins || []
    return remarkSettings
  }

  remarkSettings = vscode.workspace
    .getConfiguration('remark')
    .get<IRemarkSettings>('format')
  remarkSettings = Object.assign(
    {
      plugins: [],
      rules: {}
    } as IRemarkSettings,
    remarkSettings
  )

  return remarkSettings
}

async function runRemark(
  document: vscode.TextDocument,
  range: vscode.Range
): Promise<IResult> {
  let api = remark()
  const errors: IPluginError[] = []
  const remarkSettings = await getRemarkSettings()

  let plugins: IPlugin[] = []
  if (remarkSettings.plugins.length > 0) {
    plugins = await getPlugins(remarkSettings.plugins)
  }

  api = api.use({settings: remarkSettings.rules})

  if (plugins.length > 0) {
    for (const plugin of plugins) {
      if (plugin.package === undefined) {
        errors.push({
          name: plugin.name,
          err: 'Package not found'
        })
        continue
      }

      try {
        const settings =
          plugin.settings === undefined
            ? remarkSettings[plugin.name]
            : plugin.settings
        api =
          settings === undefined
            ? api.use(plugin.package)
            : api.use(plugin.package, settings)
      } catch (error) {
        console.error(error)
        errors.push({
          name: plugin.name,
          err: error
        })
      }
    }
  }

  if (errors.length > 0) {
    let message = ''
    for (const error of errors) {
      if (error.err === 'Package not found') {
        message += `[${
          error.name
        }]: ${error.err.toString()}. Use **npm i remark-${
          error.name
        }** or **npm i -g remark-${error.name}**.\n`
        continue
      }

      message += `[${error.name}]: ${
        (error.err instanceof Error && error.err.toString()) || 'unknown error'
      }\n`
    }

    return Promise.reject(message)
  }

  let text
  if (range) {
    text = document.getText(range)
  } else {
    const lastLine = document.lineAt(document.lineCount - 1)
    const start = new vscode.Position(0, 0)
    const end = new vscode.Position(
      document.lineCount - 1,
      lastLine.text.length
    )

    range = new vscode.Range(start, end)
    text = document.getText()
  }

  return api.process(text).then(async (result) => {
    if (result.messages.length > 0) {
      let message = ''

      for (const value of result.messages) {
        message += value.toString() + '\n'
      }

      return Promise.reject(message)
    }

    return Promise.resolve({
      content: result.contents,
      range
    })
  })
}

export function activate(context: vscode.ExtensionContext) {
  const supportedDocuments: vscode.DocumentSelector = [
    {language: 'markdown', scheme: 'file'}
  ]

  const command = vscode.commands.registerTextEditorCommand(
    'remark.reformat',
    (textEditor: vscode.TextEditor) => {
      const emptyRange = new vscode.Range(
        new vscode.Position(0, 0),
        new vscode.Position(0, 0)
      )
      runRemark(textEditor.document, emptyRange)
        .then((result: IResult) =>
          textEditor.edit((editBuilder) => {
            editBuilder.replace(result.range, result.content.toString())
          })
        )
        .catch(showOutput)
    }
  )

  const formatCode =
    vscode.languages.registerDocumentRangeFormattingEditProvider(
      supportedDocuments,
      {
        async provideDocumentRangeFormattingEdits(document, range) {
          try {
            const action = await runRemark(document, range).then(
              (result: IResult) => {
                return [
                  vscode.TextEdit.replace(range, result.content.toString())
                ]
              }
            )

            return action
          } catch (error: any) {
            showOutput(error)
          }
        }
      }
    )

  // Subscriptions
  context.subscriptions.push(command, formatCode)
}
