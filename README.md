# api-explorer

Open source components that make up ReadMe's API Explorer.

[![Build](https://github.com/readmeio/api-explorer/workflows/CI/badge.svg)](https://github.com/readmeio/api-explorer)

[![](https://d3vv6lp55qjaqc.cloudfront.net/items/1M3C3j0I0s0j3T362344/Untitled-2.png)](https://readme.io)

This repo consists of the following npm modules:

- [@readme/api-explorer](https://npm.im/@readme/api-explorer) — React components that make up the API Explorer
- [@readme/api-logs](https://npm.im/@readme/api-logs) — React components for ReadMe Metrics
- [@readme/markdown](https://npm.im/@readme/markdown) — ReadMe's Markdown parser
- [@readme/markdown-magic](https://npm.im/@readme/markdown-magic) — Our legacy "magic block"-based Markdown parser
- [@readme/oas-extensions](https://npm.im/@readme/oas-extensions) — An exported object of our [OpenAPI extensions](https://docs.readme.com/docs/swagger-extensions)
- [@readme/oas-to-har](https://npm.im/@readme/oas-to-har) — Utility to transform an OpenAPI operation into a HAR representation
- [@readme/oas-to-snippet](https://npm.im/@readme/oas-to-snippet) — Utility to transform an OpenAPI operation into a code snippet
- [@readme/syntax-highlighter](https://npm.im/@readme/syntax-highlighter) — The syntax highlighter in use on ReadMe
- [@readme/variable](https://npm.im/@readme/variable) — React components for ReadMe custom variables

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

## Fetching the latest stylesheet from ReadMe (for the demo site)

```
# Fetch the latest
curl https://docs.readme.com/css/bundle-hub2.css -o example/bundle-hub2.css

# Remove relative paths for gh-pages
sed -i '' 's/\.\.\///g' example/bundle-hub2.css
```
