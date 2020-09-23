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
  // if (operation[ext] === undefined && oas.paths[ext] === undefined && oas[ext] === undefined) {
  if (operation[ext] === undefined && oas[ext] === undefined) {
    return module.exports.defaults[ext];
  }

  // if (operation[ext]) {
  //   return operation[ext];
  // } else if (oas.path[ext]) {
  //   return oas.path[ext];
  // } else if (oas[ext]) {
  //   return oas[ext];
  // }

  return operation[ext] === undefined ? oas[ext] : operation[ext];
};

// module.exports.explorerEnabled = function (oas, operation) {
//   const explorerExt = module.exports.EXPLORER_ENABLED;

//   if (operation[explorerExt] === undefined && oas[explorerExt] === undefined) {
//     return module.exports.defaults['x-explorer-enabled'];
//   }

//   return operation[explorerExt] === undefined ? oas[explorerExt] : operation[explorerExt];
// };

// module.exports.samplesEnabled = function (oas, operation) {
//   const samplesExt = module.exports.SAMPLES_ENABLED;

//   if (operation[samplesExt] === undefined && oas[samplesExt] === undefined) {
//     return module.exports.defaults['x-samples-enabled'];
//   }

//   return operation[samplesExt] === undefined ? oas[samplesExt] : operation[samplesExt];
// };

// module.exports.samplesLanguages = function (oas, operation) {
//   const samplesLanguages = module.exports.SAMPLES_LANGUAGES;

//   if (operation[samplesLanguages] === undefined && oas[samplesLanguages] === undefined) {
//     return module.exports.defaults['x-samples-languages'];
//   }

//   return operation[samplesLanguages] === undefined ? oas[samplesLanguages] : operation[samplesLanguages];
// };
