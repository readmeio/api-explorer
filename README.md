<div align="center">

# API Explorer

[![Build Status][travis-svg]][travis-link]
[![Coverage Status][coverall-svg]][coverall-io]

[![NPM version][npmjs-apiexplorer-svg]][npmjs-apiexplorer]
[![NPM version][npmjs-markdown-svg]][npmjs-markdown]

[![NPM version][npmjs-syntaxhighlighter-svg]][npmjs-syntaxhighlighter]
[![NPM version][npmjs-oasextensions-svg]][npmjs-oasextensions]


[![lerna][lerna-svg]][lerna-link]

</div>

This repo consists of the following npm modules:
- [@mia-platform/api-explorer][npmjs-apiexplorer] - the React components that make up the explorer;
- [@mia-platform/markdown][npmjs-markdown] - the markdown parser;
- [@mia-platform/syntax-highlighter][npmjs-syntaxhighlighter] - the syntax highlighter in use on ReadMe;
- [@mia-platform/oas-extensions][npmjs-oasextensions] - an exported object of Readme.io's [OAS extensions](https://readme.readme.io/v2.0/docs/swagger-extensions).

## Installation

```sh
git clone git@github.com:mia-platform/api-explorer.git
cd api-explorer
npm install
npx lerna bootstrap
```

## Running the tests

```sh
npm test
```

## Usage

To spin up an example server:

```sh
npm start
```

To build the packages for production:

```sh
npm run build
```

To deploy the latest example to gh-pages:

```sh
npm run deploy
```

To publish all modules to npm:

```sh
npm run publish
```

## License

MIT

<!-- Links -->
[travis-svg]: https://travis-ci.org/mia-platform/api-explorer.svg?branch=master
[travis-link]: https://travis-ci.org/mia-platform/api-explorer
[lerna-svg]: https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg
[lerna-link]: https://lerna.js.org
[coverall-svg]: https://coveralls.io/repos/github/mia-platform/api-explorer/badge.svg
[coverall-io]: https://coveralls.io/github/mia-platform/api-explorer

[npmjs-apiexplorer-svg]: https://img.shields.io/npm/v/@mia-platform/api-explorer.svg?logo=npm
[npmjs-apiexplorer]: https://www.npmjs.com/package/@mia-platform/api-explorer
[npmjs-markdown-svg]: https://img.shields.io/npm/v/@mia-platform/markdown.svg?logo=npm
[npmjs-markdown]: https://www.npmjs.com/package/@mia-platform/markdown
[npmjs-syntaxhighlighter-svg]: https://img.shields.io/npm/v/@mia-platform/syntax-highlighter.svg?logo=npm
[npmjs-syntaxhighlighter]: https://www.npmjs.com/package/@mia-platform/syntax-highlighter
[npmjs-oasextensions-svg]: https://img.shields.io/npm/v/@mia-platform/oas-extensions.svg?logo=npm
[npmjs-oasextensions]: https://www.npmjs.com/package/@mia-platform/oas-extensions
