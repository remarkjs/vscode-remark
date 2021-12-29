const path = require('path')

const test = require('tape')
const {extensions, languages, Range, Uri, window, workspace} = require('vscode')

/**
 * Wait for a given amount of time.
 *
 * @param {number} ms How long to sleep in milliseconds
 */
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * @returns {Promise<void>}
 */
module.exports.run = () =>
  new Promise((resolve, reject) => {
    test('extension', async (t) => {
      const ext = extensions.getExtension('unifiedjs.vscode-remark')
      await ext?.activate()

      const uri = Uri.file(path.resolve(__dirname, '../readme.md'))
      const doc = await workspace.openTextDocument(uri)
      const editor = await window.showTextDocument(doc)
      const text = doc.getText()
      editor.edit((builder) => {
        builder.replace(
          new Range(doc.positionAt(0), doc.positionAt(text.length)),
          '-   invalid\n-   list\n-   style\n'
        )
      })
      // This is based on official example test code
      // https://github.com/microsoft/vscode-extension-samples/blob/main/lsp-sample/client/src/test/helper.ts
      await sleep(2000)
      const diagnostics = languages
        .getDiagnostics(uri)
        .map((diagnostic) => diagnostic.message)

      t.deepEquals(diagnostics, [
        'Marker style should be `*`',
        'Marker style should be `*`',
        'Marker style should be `*`'
      ])
    })

    test.onFinish(resolve)
    test.onFailure(() => reject(new Error('Tests failed')))
  })
