import { commands, window, workspace } from 'vscode'
import {
  LanguageClient,
  State,
  TransportKind
} from 'vscode-languageclient/node.js'

/**
 * @type {LanguageClient | undefined}
 */
let client
/**
 * @type {import('vscode').ExtensionContext}
 */
let extensionContext

/**
 * @type {import('vscode').Disposable | undefined}
 */
let restartCommand

/**
 * @param {import('vscode').ExtensionContext} context
 */
export async function activate(context) {
  // Create a language server
  extensionContext = context
  client = new LanguageClient(
    'remark',
    {
      module: extensionContext.asAbsolutePath('out/remark-language-server.js'),
      transport: TransportKind.ipc
    },
    {
      documentSelector: [{ scheme: 'file', language: 'markdown' }],
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

  // Register commands if they're not there already
  if (!restartCommand) {
    restartCommand = commands.registerCommand(
      'unifiedjs.vscode-remark.restart',
      () =>
        restart().catch((error) => {
          window.showErrorMessage(error.message, error.cause, error.stack)
          throw error
        }),
      client
    );
    context.subscriptions.push(restartCommand)
  }

  return { client, deactivate }
}

export async function deactivate() {
  if (client) {
    await client.stop()
    await client.dispose()
    client = undefined
  }

  if (restartCommand) {
    await restartCommand.dispose()
    restartCommand = undefined
  }
}

async function restart() {
  // If there is no client, create a new one
  if (!client) {
    await activate(extensionContext)
    return
  }

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
