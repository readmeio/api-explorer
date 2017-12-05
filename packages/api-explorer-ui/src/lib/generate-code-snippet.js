const HTTPSnippet = require('httpsnippet');
const generateHar = require('./oas-to-har');
const syntaxHighlighter = require('../../../readme-syntax-highlighter');

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
    httpsnippet: ['javascript', 'jq'],
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

module.exports = (oas, operation, values, lang) => {
  const har = generateHar(oas, operation, values);

  const snippet = new HTTPSnippet(har);

  const language = supportedLanguages[lang];
  return syntaxHighlighter(snippet.convert(...language.httpsnippet), language.highlight);
};

module.exports.getLangName = lang => supportedLanguages[lang] ? supportedLanguages[lang].name : lang;
