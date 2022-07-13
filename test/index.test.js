const assert = require('assert')
const fs = require('fs/promises')
const path = require('path')

const {commands, extensions, Uri, window, workspace} = require('vscode')

module.exports.run = async () => {
  const filePath = path.join(__dirname, 'test.md')
  try {
    const ext = extensions.getExtension('unifiedjs.vscode-remark')
    await ext?.activate()

    fs.writeFile(filePath, '- remark\n- lsp\n- vscode\n')
    const uri = Uri.file(filePath)
    const doc = await workspace.openTextDocument(uri)
    await window.showTextDocument(doc)
    await commands.executeCommand('editor.action.formatDocument')

    assert.equal(
      doc.getText(),
      '*   remark\n*   lsp\n*   vscode\n',
      'format document'
    )
  } catch (error) {
    throw error
  } finally {
    await fs.rm(filePath)
  }
}
