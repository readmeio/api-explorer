# @readme/oas-to-har

Utility to transform an OAS operation into a HAR representation

[![](https://d3vv6lp55qjaqc.cloudfront.net/items/1M3C3j0I0s0j3T362344/Untitled-2.png)](https://readme.io)

## Installation

```sh
npm install --save oas @readme/oas-to-har
```

## Usage

```js
const Oas = require('oas');
const oasToHar = require('@readme/oas-to-har');

const spec = new Oas('petstore.json');
console.log(oasToHar(spec));
```

## Credits
[Jon Ursenbach](https://github.com/erunion))

## License

ISC
