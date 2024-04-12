const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const {test} = require('node:test')
const {commands, extensions, window, workspace} = require('vscode')

module.exports.run = async () => {
  const filePath = path.join(__dirname, 'test.md')

  const extension = extensions.getExtension('unifiedjs.vscode-remark')
  await extension?.activate()

  await test('use the language server', async () => {
    await fs.writeFile(filePath, '- remark\n- lsp\n- vscode\n')
    const document = await workspace.openTextDocument(filePath)
    await window.showTextDocument(document)
    await commands.executeCommand('editor.action.formatDocument')

    assert.equal(document.getText(), '*   remark\n*   lsp\n*   vscode\n')
  })

  await fs.rm(filePath, {force: true})
}
