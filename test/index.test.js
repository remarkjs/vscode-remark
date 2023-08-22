const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const {test} = require('node:test')
const {commands, extensions, window, workspace} = require('vscode')

module.exports.run = async () => {
  const filePath = path.join(__dirname, 'test.md')

  const ext = extensions.getExtension('unifiedjs.vscode-remark')
  await ext?.activate()

  await test('use the language server', async () => {
    await fs.writeFile(filePath, '- remark\n- lsp\n- vscode\n')
    const doc = await workspace.openTextDocument(filePath)
    await window.showTextDocument(doc)
    await commands.executeCommand('editor.action.formatDocument')

    assert.equal(doc.getText(), '*   remark\n*   lsp\n*   vscode\n')
  })

  await fs.rm(filePath, {force: true})
}
