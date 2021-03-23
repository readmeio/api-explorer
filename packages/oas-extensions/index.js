// Make sure you document any changes on here:
// https://readme.readme.io/v2.0/docs/swagger-extensions

module.exports = {
  EXPLORER_ENABLED: 'explorer-enabled',
  HEADERS: 'headers',
  PROXY_ENABLED: 'proxy-enabled',
  SAMPLES_ENABLED: 'samples-enabled',
  SAMPLES_LANGUAGES: 'samples-languages',
  SEND_DEFAULTS: 'send-defaults',
};

module.exports.defaults = {
  'explorer-enabled': true,
  headers: undefined,
  'proxy-enabled': true,
  'samples-enabled': true,
  'samples-languages': ['curl', 'node', 'ruby', 'javascript', 'python'],
  'send-defaults': false,
};

/**
 * With one of our custom OAS extensions, look for it in either an OAS representation or an instance of our Operation
 * class (see `oas/tooling` in https://npm.im/oas).
 *
 * Our custom extensions can either be nestled inside of an `x-readme` object or at the root level with an `x-` prefix.
 *
 * @param {String} ext
 * @param {Oas} oas
 * @param {Operation|null} operation
 * @returns mixed
 */
module.exports.getExtension = (extension, oas, operation = null) => {
  if (operation !== null) {
    if (operation.schema['x-readme'] !== undefined && operation.schema['x-readme'][extension] !== undefined) {
      return operation.schema['x-readme'][extension];
    } else if (operation.schema[`x-${extension}`] !== undefined) {
      return operation.schema[`x-${extension}`];
    }
  }

  if (oas['x-readme'] !== undefined && oas['x-readme'][extension] !== undefined) {
    return oas['x-readme'][extension];
  } else if (oas[`x-${extension}`] !== undefined) {
    return oas[`x-${extension}`];
  }

  return module.exports.defaults[extension];
};
