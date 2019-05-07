const HTTPSnippet = require('httpsnippet');
const generateHar = require('./oas-to-har');
const syntaxHighlighter = require('@mia-platform/syntax-highlighter');

const supportedLanguages = {
  node: {
    httpsnippet: ['node', 'request'],
    highlight: 'javascript',
    name: 'Node',
  },
  curl: {
    httpsnippet: ['shell', 'curl'],
    highlight: 'shell',
    name: 'cURL',
  },
  ruby: {
    httpsnippet: ['ruby'],
    highlight: 'ruby',
    name: 'Ruby',
  },
  javascript: {
    httpsnippet: ['javascript', 'xhr', { cors: false }],
    highlight: 'javascript',
    name: 'JavaScript',
  },
  objectivec: {
    httpsnippet: ['objc', 'NSURLSession'],
    highlight: 'objectivec',
    name: 'Objective-C',
  },
  python: {
    httpsnippet: ['python', 'requests'],
    highlight: 'python',
    name: 'Python',
  },
  java: {
    httpsnippet: ['java', 'okhttp'],
    highlight: 'java',
    name: 'Java',
  },
  php: {
    httpsnippet: ['php', 'curl'],
    highlight: 'php',
    name: 'PHP',
  },
  csharp: {
    httpsnippet: ['csharp', 'restsharp'],
    highlight: 'text/x-csharp',
    name: 'C#',
  },
  swift: {
    httpsnippet: ['swift', 'nsurlsession'],
    highlight: 'swift',
    name: 'Swift',
  },
  go: {
    httpsnippet: ['go', 'native'],
    highlight: 'go',
    name: 'Go',
  },
};

module.exports = (oas, operation, values, auth, lang, contentType) => {
  const har = generateHar(oas, operation, values, auth, undefined, contentType);
  // har Reference: http://www.softwareishard.com/blog/har-12-spec/
  const snippet = new HTTPSnippet(har);

  const language = supportedLanguages[lang];

  // Prevents errors if non-generated code snippet is selected
  // and there isn't a way to generate a code snippet for it
  // ex) shell
  if (!language) {
    return { snippet: false, code: '' };
  }

  const code = snippet.convert(...language.httpsnippet);

  return { snippet: syntaxHighlighter(code, language.highlight, { dark: true }), code };
};

module.exports.getLangName = lang =>
  supportedLanguages[lang] ? supportedLanguages[lang].name : lang;
