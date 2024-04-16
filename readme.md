# remark for Visual Studio Code

[![Build][build-badge]][build]
[![Downloads][downloads-badge]][marketplace]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

Visual Studio Code extension to format and lint markdown files with remark.

## Contents

* [What is this?](#what-is-this)
* [When should I use this?](#when-should-i-use-this)
* [Install](#install)
* [Use](#use)
* [Formatting](#formatting)
* [Plugins](#plugins)
* [Compatibility](#compatibility)
* [Security](#security)
* [Contribute](#contribute)
* [License](#license)

## What is this?

This project is a Visual Studio Code (VS Code) extension that you can use in
your editor to inspect and change markdown files.
This extension is built around remark, which is a very popular ecosystem of
plugins that work with markdown.
You can choose from the 150+ plugins that already exist or make your own.

See [remark][] for info on what the remark ecosystem is.

## When should I use this?

You can use this extension if you want to check (lint) and format markdown
files from within your editor.

To configure this extension, you define your preferred markdown style in a
configuration file (`.remarkrc`, `.remarkrc.js`, etc. or in `package.json`).
This file is picked up by `vscode-remark` and other tools (useful for
contributors that don’t use VS Code).

The configuration file is also used by [`remark-cli`][remark-cli], which is
recommended to be used alongside `vscode-remark`, as an npm script and/or in
CI, to enforce the markdown style.

## Install

[Get it on the VS Code Marketplace][marketplace] or install it by using Quick
Open (<kbd>Ctrl</kbd> + <kbd>P</kbd>) and running the following:

```txt
ext install unifiedjs.vscode-remark
```

## Use

To use this extension, set up [`remark-cli`][remark-cli] like you normally would
in your project with a configuration file.
The extension will find the configuration in your workspace just like running
`remark-cli` in your terminal would.
You will be able to see your linter work as you type and you can format your
code if you want it to.

Now, you can open markdown files in your project, and you’ll see squiggly lines
and warnings in the `Problems` pane if the code doesn’t adhere to the coding
standards.
Here’s an example that should produce problems you can use to verify:

```markdown
1) Hello, _Jupiter_ and *Neptune*!
```

## Formatting

This extension can format markdown files.

To format a file, pull up the command pallete (<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>), choose `Format Document With…`, and select
`remark`.

To make `vscode-remark` the default formatter for markdown, add the following to
your `settings.json` (which you can open with <kbd>Ctrl</kbd> + <kbd>,</kbd>):

```json
{
  "[markdown]": {
    "editor.defaultFormatter": "unifiedjs.vscode-remark"
  }
}
```

Now markdown documents can be formatted using <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd>.

You can optionally choose to automatically format when saving with
`editor.formatOnSave`:

```json
{
  "[markdown]": {
    "editor.defaultFormatter": "unifiedjs.vscode-remark",
    "editor.formatOnSave": true
  }
}
```

## Plugins

The **remark** ecosystem has a variety of plugins available.
Most notably you’ll want to check out [`remark-lint`][remark-lint].
See this curated [list of plugins][list-of-plugins] for more remark plugins.

## Compatibility

This extension is compatible with Visual Studio Code versions 1.67.0 and
greater.

## Security

This plugin loads configuration files, plugins, and presets from your workspace.
Only use this plugin in workspaces you trust.

## Contribute

See [`contributing.md`][contributing] in [`remarkjs/.github`][health] for ways
to get started.
See [`support.md`][support] for ways to get help.
Join us in [Discussions][chat] to chat with the community and contributors.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © Denis Malinochkin

<!-- Definitions -->

[build-badge]: https://github.com/remarkjs/vscode-remark/workflows/main/badge.svg

[build]: https://github.com/remarkjs/vscode-remark/actions

[downloads-badge]: https://img.shields.io/visual-studio-marketplace/d/unifiedjs.vscode-remark

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/remarkjs/remark/discussions

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[health]: https://github.com/remarkjs/.github

[contributing]: https://github.com/remarkjs/.github/blob/main/contributing.md

[support]: https://github.com/remarkjs/.github/blob/main/support.md

[coc]: https://github.com/remarkjs/.github/blob/main/code-of-conduct.md

[collective]: https://opencollective.com/unified

[license]: license

[marketplace]: https://marketplace.visualstudio.com/items?itemName=unifiedjs.vscode-remark

[remark-lint]: https://github.com/remarkjs/remark-lint

[remark]: https://github.com/remarkjs/remark

[remark-cli]: https://github.com/remarkjs/remark/tree/main/packages/remark-cli

[list-of-plugins]: https://github.com/remarkjs/remark/blob/main/doc/plugins.md
