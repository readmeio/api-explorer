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
 * @param {String} lang
 * @param {String} oasUrl
 */
module.exports = (oas, operation, values, auth, lang, oasUrl) => {
  const har = generateHar(oas, operation, values, auth);

  // API SDK client needs additional runtime information on the API definition we're showing the user so it can
  // generate an appropriate snippet.
  if (lang === 'node-simple') {
    try {
      HTTPSnippet.addTargetClient('node', HTTPSnippetSimpleApiClient);
    } catch (e) {
      if (!e.message.match(/already exists/)) {
        throw e;
      }
    }
  }

  const snippet = new HTTPSnippet(har, { escapeQueryStrings: false });

  const language = supportedLanguages[lang];

  // Prevents errors if non-generated code snippet is selected and there isn't a way to generate a code snippet for it
  // (like for example `shell`).
  if (!language) {
    return { code: '', highlightMode: false };
  }

  if (lang === 'node-simple') {
    language.httpsnippet[2] = {
      apiDefinitionUri: oasUrl,
      apiDefinition: oas,
    };
  }

  return {
    code: snippet.convert(...language.httpsnippet),
    highlightMode: language.highlight,
  };
};

module.exports.getLangName = lang => {
  if (lang === 'node-simple') {
    return 'Node (simple)';
  }

  return uppercase(lang);
};

module.exports.supportedLanguages = supportedLanguages;
