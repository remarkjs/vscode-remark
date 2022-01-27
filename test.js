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

go().then(
  (result) => {
    console.log('x:ok', [result])
  },
  (error) => {
    console.log('x:err', [error])
    console.error(error)
    process.exit(1)
  }
)
