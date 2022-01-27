#!/usr/bin/env node
const process = require('process')

const {runTests} = require('@vscode/test-electron')

async function go() {
  const extensionTestsPath = require.resolve('./test/index.test.js')
  console.log('x1:', [extensionTestsPath])

  await runTests({
    extensionDevelopmentPath: __dirname,
    extensionTestsPath,
    launchArgs: []
  })
}

go().then(
  (result) => {
    console.log('x2:ok', [result])
  },
  (error) => {
    console.log('x2:err', [error])
    console.error(error)
    process.exit(1)
  }
)
