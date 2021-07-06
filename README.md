> 🚨 With the release of ReadMe's reference guide redesign this repository and codebase has been deprecated.
>
> If you have issues with this legacy API Explorer or our current Reference guides, please email our support team at support@readme.io

# api-explorer

Open source components that make up ReadMe's API Explorer.

[![Build](https://github.com/readmeio/api-explorer/workflows/CI/badge.svg)](https://github.com/readmeio/api-explorer)

[![](https://d3vv6lp55qjaqc.cloudfront.net/items/1M3C3j0I0s0j3T362344/Untitled-2.png)](https://readme.io)

This repo consists of the following npm modules:

- [@readme/api-explorer](https://npm.im/@readme/api-explorer) — React components that make up the API Explorer
- [@readme/api-logs](https://npm.im/@readme/api-logs) — React components for ReadMe Metrics

## Installation

```sh
git clone git@github.com:readmeio/api-explorer.git
cd api-explorer
npm ci
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

## Fetching the latest stylesheet from ReadMe

```
# Fetch the latest
curl https://docs.readme.com/css/bundle-hub2.css -o example/bundle-hub2.css
```
