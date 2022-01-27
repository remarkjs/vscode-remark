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
      await ext.activate()
      await sleep(2000) // Wait for server activation

      const fp = path.resolve(__dirname, '../readme.md')
      const file = Uri.file(fp)
      const doc = await workspace.openTextDocument(file)

      const editor = await window.showTextDocument(doc)
      const text = doc.getText()
      editor.edit((builder) => {
        builder.replace(
          new Range(doc.positionAt(0), doc.positionAt(text.length)),
          '-   invalid\n-   list\n-   style\n'
        )
      })

      // https://github.com/microsoft/vscode-extension-samples/blob/main/lsp-sample/client/src/test/helper.ts
      await sleep(10_000) // Wait for file to be opened.

      console.log('y3', [doc.getText()])

      const diagnostics = languages
        .getDiagnostics(file)
        .map((diagnostic) => diagnostic.message)
      console.log('y4', languages.getDiagnostics(file), diagnostics)

      t.deepEquals(diagnostics, [
        'Marker style should be `*`',
        'Marker style should be `*`',
        'Marker style should be `*`'
      ])
      console.log('y5')
    })

    test.onFinish(() => {
      console.log('z:finish')
      resolve()
    })
    test.onFailure(function () {
      console.log('z:failure', arguments)
      reject(new Error('Tests failed'))
    })
  })
