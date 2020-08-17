const HTTPSnippet = require('@readme/httpsnippet');
const HTTPSnippetSimpleApiClient = require('httpsnippet-client-api');
const uppercase = require('@readme/syntax-highlighter/uppercase');
const generateHar = require('@readme/oas-to-har');

const supportedLanguages = {
  c: {
    httpsnippet: ['c'],
    highlight: 'text/x-csrc',
  },
  cplusplus: {
    httpsnippet: ['c'],
    highlight: 'text/x-c++src',
  },
  csharp: {
    httpsnippet: ['csharp', 'restsharp'],
    highlight: 'text/x-csharp',
  },
  curl: {
    httpsnippet: ['shell', 'curl'],
    highlight: 'shell',
  },
  go: {
    httpsnippet: ['go', 'native'],
    highlight: 'go',
  },
  java: {
    httpsnippet: ['java', 'okhttp'],
    highlight: 'java',
  },
  javascript: {
    httpsnippet: ['javascript', 'xhr', { cors: false }],
    highlight: 'javascript',
  },
  kotlin: {
    httpsnippet: ['java', 'okhttp'],
    highlight: 'java',
  },
  node: {
    httpsnippet: ['node', 'request'],
    highlight: 'javascript',
  },
  'node-simple': {
    httpsnippet: ['node', 'api'],
    highlight: 'javascript',
  },
  objectivec: {
    httpsnippet: ['objc', 'NSURLSession'],
    highlight: 'objectivec',
  },
  php: {
    httpsnippet: ['php', 'curl'],
    highlight: 'php',
  },
  powershell: {
    httpsnippet: ['powershell'],
    highlight: 'powershell',
  },
  python: {
    httpsnippet: ['python', 'requests'],
    highlight: 'python',
  },
  ruby: {
    httpsnippet: ['ruby'],
    highlight: 'ruby',
  },
  swift: {
    httpsnippet: ['swift', 'nsurlsession'],
    highlight: 'swift',
  },
};

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
    HTTPSnippet.addTargetClient('node', HTTPSnippetSimpleApiClient);
  }

  const snippet = new HTTPSnippet(har);

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
