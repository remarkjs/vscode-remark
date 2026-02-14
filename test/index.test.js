const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const {before, afterEach} = require('mocha')
const {commands, extensions, window, workspace} = require('vscode')

const filePath = path.join(__dirname, 'test.md')

before(async () => {
  const extension = extensions.getExtension('unifiedjs.vscode-remark')
  assert(extension, 'Expected the extension to exist')
  await extension.activate()
})

afterEach(async () => {
  await fs.rm(filePath, {force: true})
})

test('use the language server', async () => {
  await fs.writeFile(filePath, '-   remark\n-   lsp\n-   vscode\n')
  const document = await workspace.openTextDocument(filePath)
  await window.showTextDocument(document)
  await commands.executeCommand('editor.action.formatDocument')

  assert.equal(document.getText(), '* remark\n* lsp\n* vscode\n')
})
