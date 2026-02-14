import {defineConfig} from '@vscode/test-cli'

export default defineConfig({
  files: 'test/**/*.test.js',
  mocha: {
    timeout: 30_000
  }
})
