# @readme/http-status-codes

Utility to lookup HTTP status codes.

[![Build](https://github.com/readmeio/api-explorer/workflows/CI/badge.svg)](https://github.com/readmeio/api-explorer/tree/master/packages/status-codes)

[![](https://d3vv6lp55qjaqc.cloudfront.net/items/1M3C3j0I0s0j3T362344/Untitled-2.png)](https://readme.io)

## Installation

```sh
npm install --save @readme/http-status-codes
```

## Usage

```js
const Oas = require('@readme/oas-tooling');
const oasToHar = require('@readme/oas-to-har');

const spec = new Oas('petstore.json');
console.log(oasToHar(spec));
```

## Credits
[Jon Ursenbach](https://github.com/erunion)

## License

MIT
