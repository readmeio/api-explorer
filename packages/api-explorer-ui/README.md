# api-explorer-ui

UI components for the API explorer

[![build status](https://secure.travis-ci.org/readme/api-explorer-ui.svg)](http://travis-ci.org/readme/api-explorer-ui)
[![dependency status](https://david-dm.org/readme/api-explorer-ui.svg)](https://david-dm.org/readme/api-explorer-ui)

## Installation

```
npm install --save api-explorer-ui
```

## Usage

```
<ApiExplorer
  docs={Array}
  oasFiles={Object}
  flags={Object}
  oauthUrl={String}
  suggestedEdits={Boolean}
/>
```

- `docs` - an array of objects from ReadMe containing all of your pages
- `oasFiles` - an object of oas 3 files with the key being the `_id` of the apiSetting in readme e.g.

```
{
  '5a205ad8c2de471d1c80dd22': <OAS 3 file>
}
```

- `flags` -  an object of project flags from readme. Changing these will modify how the API Explorer works.
- `oauthUrl` - a URL containing the oauth login endpoint
- `suggestedEdits` - whether suggested edits are enabled or not. This just toggles the button.

## Credits
[Dom Harrington](https://github.com/domharrington/)

[Sanjeet Uppal](https://github.com/uppal101/)

## License

ISC
