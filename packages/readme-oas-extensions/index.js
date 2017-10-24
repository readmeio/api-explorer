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
  [module.exports.EXPLORER_ENABLED]: true,
  [module.exports.SAMPLES_ENABLED]: true,
  [module.exports.SAMPLES_LANGUAGES]: ['curl', 'node', 'ruby', 'javascript', 'python'],
  [module.exports.PROXY_ENABLED]: true,
  [module.exports.HEADERS]: undefined,
  [module.exports.SEND_DEFAULTS]: false,
};
