#!/usr/bin/env node
const process = require('process')

const {runTests} = require('@vscode/test-electron')

async function go() {
  const extensionTestsPath = require.resolve('./test/index.test.js')

  await runTests({
    extensionDevelopmentPath: __dirname,
    extensionTestsPath,
    launchArgs: []
  })
}

go().catch((error) => {
  console.error(error)
  process.exit(1)
})
