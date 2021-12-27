import path from 'path'

import {workspace} from 'vscode'
import {LanguageClient} from 'vscode-languageclient/node.js'

/**
 * @param {import('vscode').ExtensionContext} context
 */
export function activate(context) {
  const command = 'node'
  const args = [path.join(__dirname, 'remark-language-server.js'), '--stdio']

  /**
   * @type {import('vscode-languageclient/node').ServerOptions}
   */
  const serverOptions = {
    run: {command, args},
    debug: {command, args: ['--inspect=6009', ...args]}
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
    'Remark Language Server',
    serverOptions,
    clientOptions
  )

  context.subscriptions.push(client.start())
}
