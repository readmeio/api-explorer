# @readme/api-explorer

UI components for the API explorer

[![](https://d3vv6lp55qjaqc.cloudfront.net/items/1M3C3j0I0s0j3T362344/Untitled-2.png)](https://readme.io)

## Installation

```sh
npm install --save @readme/api-explorer
```

## Usage

```js
<ApiExplorer
  docs={Array}
  oasFiles={Object}
  flags={Object}
  oauth={Boolean}
  suggestedEdits={Boolean}
/>
```

- `docs` - an array of objects from ReadMe containing all of your pages
- `oasFiles` - an object of oas 3 files with the key being the `_id` of the apiSetting in readme e.g.

```js
{
  '5a205ad8c2de471d1c80dd22': <OAS 3 file>
}
```

- `flags` -  an object of project flags from readme. Changing these will modify how the API Explorer works.
- `oauth` - whether this project uses oauth or not
- `suggestedEdits` - whether suggested edits are enabled or not. This just toggles the button.

## Credits
[Dom Harrington](https://github.com/domharrington)

[Sanjeet Uppal](https://github.com/uppal101)

## License

ISC
