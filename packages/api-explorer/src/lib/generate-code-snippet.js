const HTTPSnippet = require('httpsnippet');
const HTTPSnippetSimpleApiClient = require('httpsnippet-client-api');
const syntaxHighlighter = require('@readme/syntax-highlighter');
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

module.exports = (oas, oasUrl, operation, values, auth, lang) => {
  const har = generateHar(oas, operation, values, auth);

  const snippet = new HTTPSnippet(har);

  const language = supportedLanguages[lang];

  // Prevents errors if non-generated code snippet is selected and there isn't a way to generate a code snippet for it
  // (like for example `shell`).
  if (!language) {
    return { snippet: false, code: '' };
  }

  // API SDK client needs additional runtime information on the API definition we're showing the user so it can
  // generate an appropriate snippet.
  if (lang === 'node-simple') {
    HTTPSnippet.addTargetClient('node', HTTPSnippetSimpleApiClient);

    language.httpsnippet[2] = {
      apiDefinitionUri: oasUrl,
      apiDefinition: oas,
    };
  }

  const code = snippet.convert(...language.httpsnippet);

  return {
    snippet: syntaxHighlighter(code, language.highlight, { dark: true }),
    code,
  };
};

module.exports.getLangName = lang => {
  if (lang === 'node-simple') {
    return 'Node (simple)';
  }

  return uppercase(lang);
};
