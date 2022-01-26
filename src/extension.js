import {workspace} from 'vscode'
import {LanguageClient, TransportKind} from 'vscode-languageclient/node.js'

/**
 * @param {import('vscode').ExtensionContext} context
 */
export function activate(context) {
  /**
   * @type {import('vscode-languageclient/node').NodeModule}
   */
  const run = {
    module: require.resolve('./remark-language-server'),
    transport: TransportKind.ipc,
    args: ['--node-ipc']
  }

  /**
   * @type {import('vscode-languageclient/node').ServerOptions}
   */
  const serverOptions = {
    run,
    debug: {...run, options: {execArgv: ['--inspect=6009']}}
  }

  /**
   * @type {import('vscode-languageclient').LanguageClientOptions}
   */
  const clientOptions = {
    documentSelector: [{scheme: 'file', language: 'markdown'}],
    synchronize: {
      fileEvents: [
        workspace.createFileSystemWatcher(
          '**/.remark{ignore,rc,rc.cjs,rc.js,rc.json,rc.mjs,rc.yaml,rc.yml}'
        ),
        workspace.createFileSystemWatcher('**/package.json')
      ]
    }
  }

  const client = new LanguageClient(
    'remarkLanguageServer',
    'remark Language Server',
    serverOptions,
    clientOptions
  )

  context.subscriptions.push(client.start())
}
