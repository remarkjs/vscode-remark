/**
 * @import {ExtensionContext} from 'vscode'
 */
import {commands, workspace} from 'vscode'
import {
  LanguageClient,
  State,
  TransportKind
} from 'vscode-languageclient/node.js'

/** @type {LanguageClient | undefined} */
let client

/**
 * @param {ExtensionContext} context
 */
export async function activate(context) {
  client = new LanguageClient(
    'remark',
    {
      module: context.asAbsolutePath('out/remark-language-server.js'),
      transport: TransportKind.ipc
    },
    {
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
  )

  await client.start()

  context.subscriptions.push(
    commands.registerCommand('remark.restart', restart)
  )

  return client

  /**
   * Restart the language server
   */
  async function restart() {
    if (!client) {
      return
    }

    if (client.state === State.Starting) {
      return
    }

    await client.restart()
  }
}

export async function deactivate() {
  await client?.dispose()
  client = undefined
}
