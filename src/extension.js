/**
 * @import {ExtensionContext} from 'vscode'
 */
import {commands, window, workspace} from 'vscode'
import {
  LanguageClient,
  State,
  TransportKind
} from 'vscode-languageclient/node.js'

/**
 * @param {ExtensionContext} context
 */
export async function activate(context) {
  const packageJsonWatcher =
    workspace.createFileSystemWatcher('**/package.json')
  const remarkConfigWatcher = workspace.createFileSystemWatcher(
    '**/.remark{ignore,rc,rc.cjs,rc.js,rc.json,rc.mjs,rc.yaml,rc.yml}'
  )
  const outputChannel = window.createOutputChannel('remark')

  const client = new LanguageClient(
    'remark',
    {
      module: context.asAbsolutePath('out/remark-language-server.js'),
      transport: TransportKind.ipc
    },
    {
      documentSelector: [{scheme: 'file', language: 'markdown'}],
      outputChannel,
      synchronize: {
        fileEvents: [remarkConfigWatcher, packageJsonWatcher]
      }
    }
  )

  context.subscriptions.push(
    remarkConfigWatcher,
    packageJsonWatcher,
    outputChannel,
    commands.registerCommand('remark.restart', restart),
    client
  )

  await client.start()

  return client

  /**
   * Restart the language server
   */
  async function restart() {
    try {
      if (client.state === State.Starting) {
        return
      }

      if (client.state === State.Stopped) {
        await client.start()
        return
      }

      client.info('User requested server restart')
      await client.restart()
      client.info('The remark server restarted')
    } catch (error) {
      client.error('Failed to restart the remark server', error)
    }
  }
}
