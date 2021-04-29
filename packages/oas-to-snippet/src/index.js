const HTTPSnippet = require('@readme/httpsnippet');
const HTTPSnippetSimpleApiClient = require('httpsnippet-client-api');
const { uppercase } = require('@readme/syntax-highlighter');
const generateHar = require('@readme/oas-to-har');
const supportedLanguages = require('./supportedLanguages');

/**
 * @param {Oas} oas
 * @param {Operation} operation
 * @param {Object} values
 * @param {Object} auth
 * @param {String|Array} lang
 * @param {String} oasUrl
 * @param {Object|undefined} harOverride
 */
module.exports = (oas, operation, values, auth, lang, oasUrl, harOverride) => {
  let config;
  let language;
  let target;

  // If `lang` is an array, then it's a mixture of language and targets like `[php, guzzle]` or `[javascript, axios]` so
  // we need to a bit of work to pull out the necessary information needed to build the snippet. For backwards
  // compatibility sake we still need to support supplying `node-simple` as the language even though `node-simple` does
  // not exist within the list of `supportedLanguages`.
  if (lang === 'node-simple') {
    config = supportedLanguages.node;
    language = 'node';
    target = 'api';
  } else if (Array.isArray(lang)) {
    if (lang[0] in supportedLanguages) {
      if (lang[1] in supportedLanguages[lang[0]].httpsnippet.targets) {
        config = supportedLanguages[lang[0]];
        language = config.httpsnippet.lang;
        target = lang[1];
      }
    }
  } else if (lang in supportedLanguages) {
    config = supportedLanguages[lang];
    language = config.httpsnippet.lang;
    target = config.httpsnippet.default;
  }

  // Prevents errors if non-generated code snippet is selected and there isn't a way to generate a code snippet for it
  // (like for example `shell`).
  if (!language || !target) {
    return { code: '', highlightMode: false };
  }

  const har = harOverride || generateHar(oas, operation, values, auth);
  const snippet = new HTTPSnippet(har, { escapeQueryStrings: false });

  const targetOpts = config.httpsnippet.targets[target].opts || {};
  const highlightMode = config.highlight;

  // API SDK client needs additional runtime information on the API definition we're showing the user so it can
  // generate an appropriate snippet.
  if (language === 'node' && target === 'api') {
    try {
      HTTPSnippet.addTargetClient('node', HTTPSnippetSimpleApiClient);
    } catch (e) {
      if (!e.message.match(/already exists/)) {
        throw e;
      }
    }

    targetOpts.apiDefinition = oas;
    targetOpts.apiDefinitionUri = oasUrl;
  }

  return {
    code: snippet.convert(language, target, targetOpts),
    highlightMode,
  };
};

module.exports.getLangName = lang => {
  if (lang === 'node-simple') {
    return 'Node (simple)';
  }

  return uppercase(lang);
};

module.exports.supportedLanguages = supportedLanguages;
