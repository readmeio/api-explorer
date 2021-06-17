// Make sure you document any changes on here:
// https://docs.readme.com/docs/openapi-extensions

const CODE_SAMPLES = 'code-samples';
const EXPLORER_ENABLED = 'explorer-enabled';
const HEADERS = 'headers';
const PROXY_ENABLED = 'proxy-enabled';
const SAMPLES_ENABLED = 'samples-enabled';
const SAMPLES_LANGUAGES = 'samples-languages';
const SEND_DEFAULTS = 'send-defaults';
const SIMPLE_MODE = 'simple-mode';

module.exports = {
  CODE_SAMPLES,
  EXPLORER_ENABLED,
  HEADERS,
  PROXY_ENABLED,
  SAMPLES_ENABLED,
  SAMPLES_LANGUAGES,
  SEND_DEFAULTS,
  SIMPLE_MODE,
};

module.exports.defaults = {
  [CODE_SAMPLES]: undefined,
  [EXPLORER_ENABLED]: true,
  [HEADERS]: undefined,
  [PROXY_ENABLED]: true,
  [SAMPLES_ENABLED]: true,
  [SAMPLES_LANGUAGES]: ['curl', 'node', 'ruby', 'php', 'python'],
  [SEND_DEFAULTS]: false,
  [SIMPLE_MODE]: true,
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

/**
 * With one of our custom OAS extensions, determine if it's valid on a given OAS.
 *
 * @todo add support for validating on operations.
 *
 * @param {String} ext
 * @param {Oas} oas
 * @returns void
 */
module.exports.validateExtension = (extension, oas) => {
  if (oas['x-readme'] !== undefined) {
    if (typeof oas['x-readme'] !== 'object' || Array.isArray(oas['x-readme']) || oas['x-readme'] === null) {
      throw new TypeError('"x-readme" must be of type "Object"');
    }

    if (oas['x-readme'][extension] !== undefined) {
      if ([CODE_SAMPLES, HEADERS, SAMPLES_LANGUAGES].includes(extension)) {
        if (!Array.isArray(oas['x-readme'][extension])) {
          throw new TypeError(`"x-readme.${extension}" must be of type "Array"`);
        }
      } else if (typeof oas['x-readme'][extension] !== 'boolean') {
        throw new TypeError(`"x-readme.${extension}" must be of type "Boolean"`);
      }
    }
  }

  // If the extension isn't grouped under `x-readme`, we need to look for them with `x-` prefixes.
  if (oas[`x-${extension}`] !== undefined) {
    if ([CODE_SAMPLES, HEADERS, SAMPLES_LANGUAGES].includes(extension)) {
      if (!Array.isArray(oas[`x-${extension}`])) {
        throw new TypeError(`"x-${extension}" must be of type "Array"`);
      }
    } else if (typeof oas[`x-${extension}`] !== 'boolean') {
      throw new TypeError(`"x-${extension}" must be of type "Boolean"`);
    }
  }
};
