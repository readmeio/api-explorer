// Make sure you document any changes on here:
// https://readme.readme.io/v2.0/docs/swagger-extensions
module.exports = {
  EXPLORER_ENABLED: 'x-explorer-enabled',
  SAMPLES_ENABLED: 'x-samples-enabled',
  SAMPLES_LANGUAGES: 'x-samples-languages',
  PROXY_ENABLED: 'x-proxy-enabled',
  HEADERS: 'x-headers',
  SEND_DEFAULTS: 'x-send-defaults',
};

module.exports.defaults = {
  'x-explorer-enabled': true,
  'x-samples-enabled': true,
  'x-samples-languages': ['curl', 'node', 'ruby', 'javascript', 'python'],
  'x-proxy-enabled': true,
  'x-headers': undefined,
  'x-send-defaults': false,
};

// add these functions to OAS class on packages/tooling/src/oas.js
module.exports.extensionEnabled = function (oas, operation, ext) {
  if (operation[ext] === undefined && oas[ext] === undefined) {
    return module.exports.defaults[ext];
  }

  return operation[ext] === undefined ? oas[ext] : operation[ext];
};
