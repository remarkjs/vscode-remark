/**
 * @import {LanguageClient} from 'vscode-languageclient/node.js'
 */

const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const {before, beforeEach, afterEach} = require('mocha')
const {commands, extensions, window, workspace} = require('vscode')
const {State} = require('vscode-languageclient')

/** @type {LanguageClient} */
let client
const filePath = path.join(__dirname, 'test.md')

before(async () => {
  const extension = extensions.getExtension('unifiedjs.vscode-remark')
  assert(extension, 'Expected the extension to exist')
  client = await extension.activate()
})

// Give the server a moment to finish any in-flight work (e.g. plugin
// loading triggered by a document open) before each test starts.
// Without this, the format request in the first test can arrive before
// the server has finished initializing on slower platforms like macOS in github-actions.
beforeEach(async () => {
  await new Promise((resolve) => {
    setTimeout(resolve, 500)
  })
})

afterEach(async () => {
  await commands.executeCommand('workbench.action.closeAllEditors')
  await fs.rm(filePath, {force: true})
})

test('use the language server', async () => {
  await fs.writeFile(filePath, '-   remark\n-   lsp\n-   vscode\n')
  const document = await workspace.openTextDocument(filePath)
  await window.showTextDocument(document)
  await commands.executeCommand('editor.action.formatDocument')

  assert.equal(document.getText(), '* remark\n* lsp\n* vscode\n')
})

test('restart the language server', async () => {
  /** @type {State[]} */
  const states = []
  await new Promise(
    /** @param {(value?: undefined) => void} resolve */
    (resolve) => {
      const disposable = client.onDidChangeState((event) => {
        states.push(event.newState)
        if (event.newState === State.Running) {
          resolve()
          disposable.dispose()
        }
      })
      commands.executeCommand('remark.restart')
    }
  )

  assert.deepEqual(states, [State.Stopped, State.Starting, State.Running])
})

test('restart a stopped language server', async () => {
  await client.stop()

  /** @type {State[]} */
  const states = []
  await new Promise(
    /** @param {(value?: undefined) => void} resolve */
    (resolve) => {
      const disposable = client.onDidChangeState((event) => {
        states.push(event.newState)
        if (event.newState === State.Running) {
          resolve()
          disposable.dispose()
        }
      })
      commands.executeCommand('remark.restart')
    }
  )

  assert.deepEqual(states, [State.Starting, State.Running])
})
