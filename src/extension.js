import { commands, workspace } from 'vscode'
import { LanguageClient, State, TransportKind } from 'vscode-languageclient/node.js'

/**
 * @type {LanguageClient}
 */
let client
/**
 * @type {import('vscode').ExtensionContext}
 */
let extensionContext

/**
 * @param {ExtensionContext} context
 */
export async function activate(context) {

  extensionContext = context;

  createClient();
  await client.start()

  registerCommands()

  return client
}

function createClient() {

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

}

export async function deactivate() {
  if (client) {
    await client.stop()
    await client.dispose()
  }
}

export async function restart() {
  if (client.state === State.Starting) return;

  // If there is no client or if it's stopped the process crashed
  if (!client) return await activate(extensionContext)
  if (client.state === State.Stopped) {
    await client.dispose();
    createClient()
    await client.start()
    return;
  }

  client?.info('User requested server restart')
  await client.restart()

  client.info('Remark server restarted')
  await client.sendNotification('unifiedjs.vscode-remark.restarted')
}

function registerCommands() {
  commands.registerCommand('unifiedjs.vscode-remark.restart',
    () => restart().catch(err => { throw err; }),
    client
  )
}
