# api-explorer

Open source components that make up ReadMe's API explorer.

[![Build](https://github.com/readmeio/api-explorer/workflows/CI/badge.svg)](https://github.com/readmeio/api-explorer)

[![](https://d3vv6lp55qjaqc.cloudfront.net/items/1M3C3j0I0s0j3T362344/Untitled-2.png)](https://readme.io)

This repo consists of the following npm modules:

- [@readme/api-explorer](https://npm.im/@readme/api-explorer) - the React components that make up the explorer
- [@readme/markdown](https://npm.im/@readme/markdown) - the markdown parser
- [@readme/markdown-magic](https://npm.im/@readme/markdown-magic) - the legacy "magic block"-based markdown parser
- [@readme/oas-extensions](https://npm.im/@readme/oas-extensions) - an exported object of our [OAS extensions](https://docs.readme.com/docs/swagger-extensions)
- [@readme/oas-to-har](https://npm.im/@readme/oas-to-har) - utility to transform an OAS operation into a HAR representation
- [@readme/syntax-highlighter](https://npm.im/@readme/syntax-highlighter) - the syntax highlighter in use on ReadMe

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
npm run publish
```

## Fetching the latest stylesheet from ReadMe (for the demo site)
```
# Fetch the latest
curl https://readme.readme.io/css/bundle-hub2.css -o example/bundle-hub2.css

# Remove relative paths for gh-pages
sed -i '' 's/\.\.\///g' example/bundle-hub2.css
```

## Credits
[Dom Harrington](https://github.com/domharrington)

## License

ISC
