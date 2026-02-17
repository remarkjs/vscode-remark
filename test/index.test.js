/**
 * @import {LanguageClient} from 'vscode-languageclient/node.js'
 * @import {Extension as VsCodeExtension} from 'vscode'
 */
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const {test, afterEach} = require('node:test')
const {commands, extensions, window, workspace} = require('vscode')

const filePath = path.join(__dirname, 'test.md')

/**
 * @type {LanguageClient}
 */

afterEach(async () => {
  await fs.rm(filePath, {force: true})
})

/**
 * @typedef {LanguageClient} LanguageClient
 * @typedef {VsCodeExtension<LanguageClient>} Extension
 */

module.exports.run = async () => {
  // Make a temp dir to prevent the repo from having stray files when tests crash
  const temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), 'vscode-remark-')
  )

  /**
   * @type {Extension | undefined}
   */
  const extension = extensions.getExtension('unifiedjs.vscode-remark')
  if (!extension) assert.fail('Extension was not found')
  const client = await extension.activate()

  const filePath = path.join(temporaryDirectory, 'test.md')

  try {
    await test('use the language server', async () => {
      await fs.writeFile(filePath, '- remark\n- lsp\n- vscode\n')
      const document = await workspace.openTextDocument(filePath)
      await window.showTextDocument(document)
      await commands.executeCommand('editor.action.formatDocument')

      assert.equal(document.getText(), '* remark\n* lsp\n* vscode\n')
    })

    await test('restart the language server', async () => {
      const restarted = waitForRestartNotification(client)

      await commands.executeCommand('remark.restart')
      await restarted
    })

    await test('restart a stopped language server', async () => {
      const restarted = waitForRestartNotification(client)
      await client.stop()

      await commands.executeCommand('remark.restart')
      await restarted
    })
  } finally {
    await fs.rm(temporaryDirectory, {recursive: true, force: true})
  }
}

/**
 * @param {import('vscode-languageclient/node').LanguageClient} client
 * @returns {Promise<void>}
 */
async function waitForRestartNotification(client) {
  return new Promise((resolve) => {
    client.sendNotification = () => {
      resolve()
      return Promise.resolve()
    }
  })
}
