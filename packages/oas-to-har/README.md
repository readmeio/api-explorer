# @readme/oas-to-har

Utility to transform an OAS operation into a [HAR](http://www.softwareishard.com/blog/har-12-spec/) representation

[![Build](https://github.com/readmeio/api-explorer/workflows/CI/badge.svg)](https://github.com/readmeio/api-explorer/tree/main/packages/oas-to-har)

[![](https://d3vv6lp55qjaqc.cloudfront.net/items/1M3C3j0I0s0j3T362344/Untitled-2.png)](https://readme.io)

## Installation

```sh
npm install --save @readme/oas-to-har
```

## Usage

```js
const Oas = require('oas');
const oasToHar = require('@readme/oas-to-har');

const spec = new Oas('petstore.json');
console.log(oasToHar(spec, { path: '/pets', method: 'post'}));
```

### `oasToHar(har, operationSchema, values, auth, opts) => Object`

- `oas` *{Oas}*: Instance of our [oas/tooling](https://npm.im/oas) class.
- `operationSchema` *{Object\|Operation}*: Can either be an object with `path` and `method` properties (that exist in the supplied OAS), or an instance of our `Operation` class from [oas/tooling](https://npm.im/oas) - accessed through `new Oas(spec).operation(path, method)`.
- `values` *{Object}*: A object of payload data, with key-value data therein, that should be used to construct the request. Available data you can define here:
  - `path`
  - `query`
  - `body`
  - `cookie`
  - `formData`
  - `header`
  - `server` &mdash; If the supplied OAS has multiple severs or server variables you can use this to set which server and variables to use. Shape of it should be: `{ selected: Integer, variables: { ...key-values }}`. `selected` should coorespond to index of the `servers` array in your OAS.
- `auth` *{Object}*: Authentication information for the request.
- `opts.proxyUrl` *{Boolean}*: Boolean to toggle if composed HAR objects should have their `url` be sent through our CORS-friendly proxy. Defaults to `false`.

## Credits
[Jon Ursenbach](https://github.com/erunion)

## License

ISC
