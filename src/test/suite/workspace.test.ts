'use strict'

import * as vscode from 'vscode'
import * as workspace from '../../utils/workspace'
import {after} from 'mocha'
import {before} from 'mocha'
import * as chai from 'chai'
import * as path from 'path'
import * as check from 'check-types'

const assert = chai.assert
const expect = chai.expect
const should = chai.should()

suite('Extension Test Suite', () => {
  before(() => {
    vscode.window.showInformationMessage('Start all tests.')
  })

  after(() => {
    vscode.window.showInformationMessage('All tests done!')
  })

  const parseWorkspaceConfigTest = async (configPath: string) => {
    const files = [vscode.Uri.parse(configPath)]
    const config = await workspace.parseWorkspaceConfig(files)

    expect(config, 'config').to.not.be.null
    expect(config.plugins, 'config.plugins').to.not.be.null

    expect(check.array(config.plugins), 'config.plugins').to.be.true
    expect(config.plugins, 'config.plugins').to.have.lengthOf(2)
    expect(config.plugins[0], 'config.plugins[0]').to.eq('first-heading')
    expect(config.plugins[1], 'config.plugins[1]').to.eq('github')

    expect(check.object(config.settings), 'config.settings').to.be.true
    expect(config.plugins.closeAtx, 'config.settings.closeAtx').not.to.be.true

    expect(check.object(config.github), 'config.github').to.be.true
    expect(config.github.repository, 'config.github.repository').to.be.eq(
      'https://github.com/mrmlnc/vscode-remark'
    )

    console.log(JSON.stringify(config))

    expect(check.object(config['first-heading']), 'config["first-heading"]').to
      .be.true
    expect(
      config['first-heading'].heading,
      'config["first-heading"].heading'
    ).to.be.eq('Hello, .remarkrc file!')
  }

  test('parseWorkspaceConfig(json)', async () => {
    // The configPath looks overly convoluted since `__dirname` points to the directory of the resulting .js
    // file inside the `out` directory and not this source .ts file.
    const configPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'src',
      'test',
      'suite',
      'json',
      '.remarkrc'
    )
    await parseWorkspaceConfigTest(configPath)
  })

  test('parseWorkspaceConfig(yaml)', async () => {
    // The configPath looks overly convoluted since `__dirname` points to the directory of the resulting .js
    // file inside the `out` directory and not this source .ts file.
    const configPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'src',
      'test',
      'suite',
      'yaml',
      '.remarkrc.yml'
    )
    await parseWorkspaceConfigTest(configPath)
  })
})
