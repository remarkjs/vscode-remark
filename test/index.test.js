const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const { test, before, afterEach } = require('node:test')
const { commands, extensions, window, workspace } = require('vscode')

const filePath = path.join(__dirname, 'test.md')

/**
 * @type {import('vscode-languageclient/node.js').LanguageClient}
 */
let client;

before(async () => {
  const extension = extensions.getExtension('unifiedjs.vscode-remark')
  assert(extension, 'Expected the extension to exist')
  client = await extension.activate()
})

afterEach(async () => {
  await fs.rm(filePath, {force: true})
})

test('use the language server', async () => {
  try {
    await fs.writeFile(filePath, '- remark\n- lsp\n- vscode\n')
    const document = await workspace.openTextDocument(filePath)
    await window.showTextDocument(document)
    await commands.executeCommand('editor.action.formatDocument')

    assert.equal(document.getText(), '* remark\n* lsp\n* vscode\n')
  } finally {
    await fs.rm(filePath, { force: true })
  }
})

test('restart the language server', async () => {

  const restarted = waitForRestartNotification(client);

  await commands.executeCommand('unifiedjs.vscode-remark.restart')
  await restarted
})

test('restart the language server', async () => {
  const restarted = waitForRestartNotification(client)

  await commands.executeCommand('unifiedjs.vscode-remark.restart')
  await restarted
})

test('restart a stopped language server', async () => {

  const restarted = waitForRestartNotification(client);

  await client.stop();

  await commands.executeCommand('unifiedjs.vscode-remark.restart')
  await restarted
})

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
