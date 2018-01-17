# api-explorer

Open source components that make up ReadMe's API explorer

[![CircleCI](https://circleci.com/gh/readmeio/api-explorer.svg?style=svg&circle-token=2a91256819c6da2e388896859d4f7fbb34ec9d84)](https://circleci.com/gh/readmeio/api-explorer)

[![](https://d3vv6lp55qjaqc.cloudfront.net/items/1M3C3j0I0s0j3T362344/Untitled-2.png)](https://readme.io)

This repo consists of the following npm modules:

- [@readme/api-explorer](https://www.npmjs.com/package/@readme/api-explorer) - the React components that make up the explorer
- [@readme/syntax-highlighter](https://www.npmjs.com/package/@readme/syntax-highlighter) - the syntax highlighter in use on ReadMe
- [@readme/oas-extensions](https://www.npmjs.com/package/@readme/oas-extensions) - an exported object of our [OAS extensions](https://readme.readme.io/v2.0/docs/swagger-extensions)

## Installation

```sh
git clone git@github.com:readmeio/api-explorer.git
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
npx lerna publish
```

## Credits
[Dom Harrington](https://github.com/domharrington)

## License

ISC
