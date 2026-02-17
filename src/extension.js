/**
 * @import {ExtensionContext} from 'vscode'
 */
import {commands, workspace} from 'vscode'
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

  // Create restart
  async function restart() {
    if (client.state === State.Starting) return
    if (client.state === State.Stopped) {
      await client.start()
      return
    }

    client.info('User requested server restart')
    await client.restart()

    client.info('The remark server restarted')
    await client.sendNotification('remark.restarted')
  }

  // Register commands to the context
  context.subscriptions.push(
    commands.registerCommand(
      'remark.restart',
      async () => {
        try {
          await restart()
        } catch (error) {
          client.error('Failed to restart the remark server', error)
        }
      },
      client
    )
  )

  return client
}

export async function deactivate() {
  if (client) {
    await client.stop()
  }
}
