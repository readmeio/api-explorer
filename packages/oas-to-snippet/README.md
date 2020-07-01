# @readme/oas-to-snippet

Transform an OpenAPI operation into a code snippet.

[![Build](https://github.com/readmeio/api-explorer/workflows/CI/badge.svg)](https://github.com/readmeio/api-explorer/tree/master/packages/oas-to-snippet)

[![](https://d3vv6lp55qjaqc.cloudfront.net/items/1M3C3j0I0s0j3T362344/Untitled-2.png)](https://readme.io)

This library was built with ReadMe's [API Explorer](https://github.com/readmeio/api-explorer) in mind, but it's built to support all OpenAPI use-cases.

## Installation

```sh
npm install --save @readme/oas-to-snippet
```

## Usage

```js
const Oas = require('@readme/oas-tooling');
const generateSnippet = require('@readme/oas-to-snippet');

const apiDefinition = new Oas('petstore.json');
const operation = apiDefinition.operation('/pets', 'get');

// This is a keyed object containing formData for your operation. Available keys are: path,
// query, cookie, header, formData, and body.
const formData = {
  query: { sort: 'desc' },
};

// This is a keyed object containing authentication credentials for the operation. The keys for
// this object should match up with the `securityScheme` on the operation you're accessing, and
// its value should either be a String, or an Object containing `user` and/or `pass` (for Basic
// auth schemes).
const auth = {
  'oauth2': 'bearerToken',
}

// This is the language to generate a snippet to. See below for supported languages.
const language = 'node';

// This URL parameter is only necessary when using the `node-simple` language and it should be an
// addressable URL for your operation so it can be used within ReadMe's OpenAPI auto SDK package.
// See https://www.npmjs.com/package/api for more information.
const url = 'https://example.com/petstore.json';

// This will return an object containing `snippet` and `code`. `snippet` is a syntax-highlighted
// React element containing the generated code snippet, while `code` is the plaintext version of the
// same.
const { code, snippet } = generateSnippet(apiDefinition, operation, formData, auth, language, url);
```

## Supported Languages

Since this library uses [HTTP Snippet](https://github.com/Kong/httpsnippet), we support most languages that does which are the following:

* `c`
* `cplusplus`
* `csharp`
* `curl`
* `go`
* `java`
* `javascript`
* `kotlin`
* `node`
* `objectivec`
* `php`
* `powershell`
* `python`
* `ruby`
* `swift`

We also support `node-simple`, which is a custom Node snippet wrapper we have for our [api](https://www.npmjs.com/package/api) package that facilitates the easy usage of calling an API from an OpenAPI definition.
