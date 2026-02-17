/**
 * @import {LanguageClient} from 'vscode-languageclient/node.js'
 * @import {Extension as VsCodeExtension} from 'vscode'
 * @typedef {LanguageClient} LanguageClient
 * @typedef {VsCodeExtension<LanguageClient>} Extension
 */
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const {test, beforeEach, afterEach} = require('mocha')
const {commands, extensions, window, workspace} = require('vscode')

// Make a temp dir to prevent the repo from having stray files when tests crash
let temporaryDirectory = './vscode-remark'
/** @type { LanguageClient} */
let client

beforeEach(async () => {
  temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), 'vscode-remark-')
  )

  /** @type {Extension | undefined} */
  const extension = extensions.getExtension('unifiedjs.vscode-remark')
  if (!extension) assert.fail('Extension was not found')
  client = await extension.activate()
})

afterEach(async () => {
  await fs.rm(temporaryDirectory, {recursive: true, force: true})
  client.dispose()
})

const filePath = path.join(temporaryDirectory, 'test.md')

test('use the language server', async () => {
  await fs.writeFile(filePath, '- remark\n- lsp\n- vscode\n')
  const document = await workspace.openTextDocument(filePath)
  await window.showTextDocument(document)
  await commands.executeCommand('editor.action.formatDocument')

  assert.equal(document.getText(), '* remark\n* lsp\n* vscode\n')
})

test('restart the language server', async () => {
  const restarted = waitForRestartNotification(client)

  await commands.executeCommand('remark.restart')
  await restarted
})

test('restart a stopped language server', async () => {
  const restarted = waitForRestartNotification(client)
  await client.stop()

  await commands.executeCommand('remark.restart')
  await restarted
})

/**
 * @param {LanguageClient} client
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
