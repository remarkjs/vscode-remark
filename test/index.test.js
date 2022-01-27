const path = require('path')

const test = require('tape')
const {extensions, languages, Uri, window, workspace} = require('vscode')

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

      console.log('xxx:', workspace.workspaceFolders)

      const fp = path.resolve(__dirname, '../readme.md')
      const file = Uri.file(fp)

      await window.showTextDocument(file)

      // https://github.com/microsoft/vscode-extension-samples/blob/main/lsp-sample/client/src/test/helper.ts
      await sleep(20_000) // Wait for file to be edited.

      console.log('y3', languages.getDiagnostics())

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

    let failed = false

    test.onFinish(() => {
      if (!failed) {
        console.log('z:finish')
        resolve()
      }
    })
    test.onFailure(function () {
      failed = true
      console.log('z:failure', arguments)
      reject(new Error('Tests failed'))
    })
  })
