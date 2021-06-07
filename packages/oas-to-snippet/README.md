# @readme/oas-to-snippet

Transform an OpenAPI operation into a code snippet.

[![Build](https://github.com/readmeio/api-explorer/workflows/CI/badge.svg)](https://github.com/readmeio/api-explorer/tree/main/packages/oas-to-snippet)

[![](https://d3vv6lp55qjaqc.cloudfront.net/items/1M3C3j0I0s0j3T362344/Untitled-2.png)](https://readme.io)

This library was built with ReadMe's [API Explorer](https://github.com/readmeio/api-explorer) in mind, but it's built to support all OpenAPI use-cases.

## Installation

```sh
npm install --save @readme/oas-to-snippet
```

## Usage

```js
const Oas = require('oas');
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
//
// For supplying an alternative language target (like `axios` for `node`), you can do so by
// changing this variable to an array: `['node', 'axios']`. For the full list of alternative
// language targets that we support, see below.
const language = 'node';

// This URL parameter is only necessary when using the `node-simple` language and it should be an
// addressable URL for your operation so it can be used within ReadMe's OpenAPI auto SDK package.
// See https://www.npmjs.com/package/api for more information.
const url = 'https://example.com/petstore.json';

// This will return an object containing `code` and `highlightMode`. `code` is the generated code
// snippet, while `highlightMode` is the language mode you can use to render it for syntax
// highlighting (with @readme/syntax-highlighter, for example).
const { code, highlightMode } = generateSnippet(apiDefinition, operation, formData, auth, language, url);
```

## Supported Languages

Since this library uses [HTTP Snippet](https://github.com/Kong/httpsnippet), we support most of its languages, and their associated targets, which are the following:

* `c`
* `clojure`
* `cplusplus`
* `csharp`
  * `httpclient`
  * `restsharp`
* `curl`
* `go`
* `java`
  * `asynchttp`
  * `nethttp`
  * `okhttp`
  * `unirest`
* `javascript`
  * `axios`
  * `fetch`
  * `jquery`
  * `xhr`
* `kotlin`
  * `okhttp`
* `node`
  * `api`: This is our OpenAPI-powered SDK generation library; see https://npm.im/api for more info.
  * `axios`
  * `fetch`
  * `native`
  * `request`
* `node-simple`: This is a shortcut for supplying `['node', 'api']` as the `lang` argument.
* `objectivec`
* `ocaml`
* `php`
  * `curl`
* `powershell`
* `python`
  * `requests`
* `r`
* `ruby`
* `swift`
