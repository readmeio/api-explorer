# api-explorer-ui

UI components for the API explorer

[![build status](https://secure.travis-ci.org/readme/api-explorer-ui.svg)](http://travis-ci.org/readme/api-explorer-ui)
[![dependency status](https://david-dm.org/readme/api-explorer-ui.svg)](https://david-dm.org/readme/api-explorer-ui)

## Installation

```
npm install --save api-explorer-ui
```

## Usage

### `<ApiExplorer docs={this.state.docs} oasFiles={{
    'api-setting': Object.assign(extensions.defaults, this.state.oas),
  }} flags={{ correctnewlines: false, stripe: true }} oauthUrl={this.props.oauthUrl} /> `

- `docs` is an array of objects of each endpoint's path, method, and title.
- `oasFiles` is an object of swagger extensions(https://readme.readme.io/v2.0/docs/swagger-extensions) that modify the display of components within ApiExplorer or  the AJAX request itself. The object also includes the documentation file of all endpoints.
- `flags` is  an object of specified settings from readme that affect the display of ApiExplorer. The two main ones are correctnewlines -[docs](#correctnewlines) and stripe -[docs](#stripe).
- `oauthUrl` is a string utilized for response result body to determine authentication for the response of the endpoint.

### `correctnewlines`
- `correctnewlines` is an object with a boolean value if false it adds line breaks. This can be seen when an image is embedded with a caption.

### `stripe`
- `stripe` is an object with a boolean value it affects that changes the theme of the layout to show a stripe effect.


## Credits
[Dom Harrington](https://github.com/readme/)

## License

ISC
