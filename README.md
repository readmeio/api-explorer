<div align="center">

# API Explorer

[![Build Status][travis-svg]][travis-link]
[![Coverage Status][coverall-svg]][coverall-io]

[![NPM version][npmjs-apiexplorer-svg]][npmjs-apiexplorer]
[![NPM version][npmjs-apilogs-svg]][npmjs-apilogs]
[![NPM version][npmjs-markdown-svg]][npmjs-markdown]

[![NPM version][npmjs-syntaxhighlighter-svg]][npmjs-syntaxhighlighter]
[![NPM version][npmjs-oasextensions-svg]][npmjs-oasextensions]
[![NPM version][npmjs-variable-svg]][npmjs-variable]


[![lerna][lerna-svg]][lerna-link]

</div>

This repo consists of the following npm modules:
- [@mia-platform/api-explorer][npmjs-apiexplorer]: the React components that make up the explorer;
- [@mia-platform/markdown][npmjs-markdown]: the markdown parser;
- [@mia-platform/syntax-highlighter][npmjs-syntaxhighlighter]: the syntax highlighter in use on ReadMe;
- [@mia-platform/oas-extensions][npmjs-oasextensions]: an exported object of Readme.io's [OAS extensions](https://readme.readme.io/v2.0/docs/swagger-extensions);
- [@mia-platform/variable][npmjs-variable].

## Installation

```sh
git clone git@github.com:mia-platform/api-explorer.git
cd api-explorer
npm install
npm run boot # Installs all packages using lerna
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

### Tag a new version of the packages use:

```sh
npx lerna version
```
and select the desired version tag (major/minor/patch/etc...)

### Build the packages for production:

```sh
npm run build
```

### Deploy the latest example to gh-pages:

```sh
npm run deploy
```

### Publish all modules to npm:

```sh
npx lerna publish
```

if publish fails with error `Current HEAD is already released` it's generally due to the fact that a version has already been tagged and there's no new change; in order to make sure it's published use 

```sh
npx lerna publish from-git
```

so that lerna will not try to create a new version tag and publish the current version from the tag in the git repository.

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

[npmjs-apilogs-svg]: https://img.shields.io/npm/v/@mia-platform/api-logs.svg?logo=npm
[npmjs-apilogs]: https://www.npmjs.com/package/@mia-platform/api-logs

[npmjs-markdown-svg]: https://img.shields.io/npm/v/@mia-platform/markdown.svg?logo=npm
[npmjs-markdown]: https://www.npmjs.com/package/@mia-platform/markdown

[npmjs-syntaxhighlighter-svg]: https://img.shields.io/npm/v/@mia-platform/syntax-highlighter.svg?logo=npm
[npmjs-syntaxhighlighter]: https://www.npmjs.com/package/@mia-platform/syntax-highlighter

[npmjs-oasextensions-svg]: https://img.shields.io/npm/v/@mia-platform/oas-extensions.svg?logo=npm
[npmjs-oasextensions]: https://www.npmjs.com/package/@mia-platform/oas-extensions

[npmjs-variable-svg]: https://img.shields.io/npm/v/@mia-platform/variable.svg?logo=npm
[npmjs-variable]: https://www.npmjs.com/package/@mia-platform/variable
