import {workspace} from 'vscode'
import {LanguageClient, TransportKind} from 'vscode-languageclient/node.js'

/**
 * @param {import('vscode').ExtensionContext} context
 */
export function activate(context) {
  /**
   * @type {import('vscode-languageclient/node').ServerOptions}
   */
  const serverOptions = {
    run: {
      module: context.asAbsolutePath('./out/remark-language-server.js'),
      transport: TransportKind.ipc,
      args: [],
      options: {
        env: {},
        execArgv: []
      }
    },
    debug: {
      module: context.asAbsolutePath('./out/remark-language-server.js'),
      transport: TransportKind.ipc,
      args: [],
      options: {
        env: {},
        execArgv: ['--nolazy', '--inspect=6009']
      }
    }
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
