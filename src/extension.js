import {workspace} from 'vscode'
import {LanguageClient, TransportKind} from 'vscode-languageclient/node.js'

/**
 * @type {LanguageClient}
 */
let client

/**
 * @param {import('vscode').ExtensionContext} context
 */
export async function activate(context) {
  /**
   * @type {import('vscode-languageclient/node').NodeModule}
   */
  const run = {
    module: context.asAbsolutePath('out/remark-language-server.js'),
    transport: TransportKind.ipc
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

  client = new LanguageClient('remark', serverOptions, clientOptions)

  await client.start()
}

export async function deactivate() {
  if (client) {
    await client.stop()
  }
}
