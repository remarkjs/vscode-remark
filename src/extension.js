import {commands, window, workspace} from 'vscode'
import {
  LanguageClient,
  State,
  TransportKind
} from 'vscode-languageclient/node.js'

/**
 * @type {LanguageClient}
 */
let client

/**
 * @param {import('vscode').ExtensionContext} context
 */
export async function activate(context) {
  // Create a language server
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

  // Start the server
  await client.start()

  // Create restart command
  async function restart() {
    if (client.state === State.Starting) return
    if (client.state === State.Stopped) {
      await client.start()
      return
    }

    client.info('User requested server restart')
    await client.restart()

    client.info('The remark server restarted')
    await client.sendNotification('unifiedjs.vscode-remark.restarted')
  }

  // Register commands to the context
  context.subscriptions.push(
    commands.registerCommand(
      'unifiedjs.vscode-remark.restart',
      () =>
        restart().catch((error) => {
          window.showErrorMessage(error.message, error.cause, error.stack)
          throw error
        }),
      client
    )
  )

  return {client, deactivate}
}

export async function deactivate() {
  if (client) {
    await client.stop()
    await client.dispose()
  }
}
