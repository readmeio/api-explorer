<div align="center">

# API Explorer

[![Build Status][travis-svg]][travis-link]
[![lerna][lerna-svg]][lerna-link]

</div>

<!-- This repo consists of the following npm modules:
- [@readme/api-explorer](https://www.npmjs.com/package/@readme/api-explorer) - the React components that make up the explorer
- [@readme/markdown](https://www.npmjs.com/package/@readme/markdown) - the markdown parser
- [@readme/syntax-highlighter](https://www.npmjs.com/package/@readme/syntax-highlighter) - the syntax highlighter in use on ReadMe
- [@readme/oas-extensions](https://www.npmjs.com/package/@readme/oas-extensions) - an exported object of our [OAS extensions](https://readme.readme.io/v2.0/docs/swagger-extensions) -->

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
<!-- 
## Fetching the latest stylesheet from ReadMe (for the demo site)
```
# Fetch the latest
curl https://readme.readme.io/css/bundle-hub2.css -o example/bundle-hub2.css

# Remove relative paths for gh-pages
sed -i '' 's/\.\.\///g' example/bundle-hub2.css
``` -->

## License

MIT


<!-- Links -->
[travis-svg]: https://travis-ci.org/mia-platform/api-explorer.svg?branch=master
[travis-link]: https://travis-ci.org/mia-platform/api-explorer
[lerna-svg]: https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg
[lerna-link]: https://lerna.js.org/
