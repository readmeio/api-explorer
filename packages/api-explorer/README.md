<div align="center">

# @mia-platform/api-explorer

UI components for the API explorer

[![NPM version][npmjs-apiexplorer-svg]][npmjs-apiexplorer]

</div>

## Installation

```sh
npm install --save @mia-platform/api-explorer
```

## Usage

```js
<ApiExplorer
  docs={Array}
  oasFiles={Object}
  flags={Object}
  appearance={{
    referenceLayout: String,  
  }},
  oauth={Boolean}
  suggestedEdits={Boolean}
  tryItMetrics={function}
  variables={
    user: {
      keys: Array,
    },
    defaults: Array,
  }
  glossaryTerms={Array}
/>
```

- `docs` - an array of objects from ReadMe containing all of your pages
- `oasFiles` - an object of oas 3 files with the key being the `_id` of the apiSetting in readme e.g.

```js
{
  '5a205ad8c2de471d1c80dd22': <OAS 3 file>
}
```

- `flags` - an object of project flags from readme. Changing these will modify how the API Explorer works.
- `appearance.referenceLayout` - a string to determine the layout style, either `row` or `column`.
- `oauth` - whether this project uses oauth or not
- `suggestedEdits` - whether suggested edits are enabled or not. This just toggles the button.
- `tryItMetrics` - function to call when request is made
- `variables.user` - user specific variables, setup via JWT login to ReadMe
- `variables.defaults` - default project variables
- `glossaryTerms` - glossary terms defined in the ReadMe project

## License

ISC

[npmjs-apiexplorer-svg]: https://img.shields.io/npm/v/@mia-platform/api-explorer.svg?logo=npm
[npmjs-apiexplorer]: https://www.npmjs.com/package/@mia-platform/api-explorer