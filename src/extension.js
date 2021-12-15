const {workspace} = require('vscode')
const {LanguageClient} = require('vscode-languageclient/node')

/**
 * @param {import('vscode').ExtensionContext} context
 */
function activate(context) {
  const command = require.resolve('remark-language-server')
  const args = ['--stdio']

  /**
   * @type {import('vscode-languageclient/node').ServerOptions}
   */
  const serverOptions = {
    run: {command, args},
    debug: {
      command: 'node',
      args: ['--inspect=6009', command, ...args]
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
    'Remark Language Server',
    serverOptions,
    clientOptions
  )

  context.subscriptions.push(client.start())
}

module.exports.activate = activate
