# remark for Visual Studio Code

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

Visual Studio Code extension to format and lint markdown files with remark.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Use](#use)
    *   [Formatting](#formatting)
*   [Plugins](#plugins)
*   [Syntax](#syntax)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Contribute](#contribute)
*   [License](#license)

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

## Use

To start using this for a project, [`remark-cli`][remark-cli] needs to be
configured first.
First, install `remark-cli` and a plugin or preset.
Let’s use `remark-preset-lint-recommended` for our example.

```sh
npm install remark-cli remark-preset-lint-recommended
```

Now create a file named `.remarkrc.json` with the following content:

```json
{
  "plugins": ["preset-lint-recommended"]
}
```

Now let’s create a markdown file `readme.md` and add the following content:

```markdown
# My project

This is a [broken link][]

- A `*` should be used for list items
- Also 4 spaces should be used for indentation

[unused reference]: https://example.com
```

Now any syntax which doesn’t comply with `remark-preset-lint-recommended` will
be reported using squiggly lines in your editor and in the `Problems` pane.

### Formatting

This extension can be used as a formatter for markdown files.

To format a file, first press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>.
Search for and select `Format Document With…`.
Now select `remark`.

To make this the default formatter, add the following to your `settings.json`
(Open with <kbd>Ctrl</kbd> + <kbd>,</kbd>):

```json
{
  "[markdown]": {
    "editor.defaultFormatter": "unifiedjs.vscode-remark",
  }
}
```

Optionally enable format on save:

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

## Syntax

remark follows CommonMark, which standardizes the differences between markdown
implementations, by default.
Some syntax extensions are supported through plugins.

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, and 16.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

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

[MIT](license) © [Titus Wormer](https://wooorm.com)

<!-- Definitions -->

[build-badge]: https://github.com/remarkjs/vscode-remark/workflows/main/badge.svg

[build]: https://github.com/remarkjs/vscode-remark/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/remarkjs/vscode-remark.svg

[coverage]: https://codecov.io/github/remarkjs/vscode-remark

[downloads-badge]: https://img.shields.io/visual-studio-marketplace/d/unifiedjs.vscode-remark

[downloads]: https://marketplace.visualstudio.com/items?itemName=unifiedjs.vscode-remark

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/remarkjs/remark/discussions

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[health]: https://github.com/remarkjs/.github

[contributing]: https://github.com/remarkjs/.github/blob/main/contributing.md

[support]: https://github.com/remarkjs/.github/blob/main/support.md

[coc]: https://github.com/remarkjs/.github/blob/main/code-of-conduct.md

[collective]: https://opencollective.com/unified

[remark-lint]: https://github.com/remarkjs/remark-lint

[remark]: https://github.com/remarkjs/remark

[remark-cli]: https://github.com/remarkjs/remark/tree/main/packages/remark-cli

[list-of-plugins]: https://github.com/remarkjs/remark/blob/main/doc/plugins.md
