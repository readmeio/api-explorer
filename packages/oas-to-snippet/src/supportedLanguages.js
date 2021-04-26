const supportedLanguages = {
  c: {
    httpsnippet: ['c'],
    highlight: 'text/x-csrc',
  },
  clojure: {
    httpsnippet: ['clojure'],
    highlight: 'clojure',
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
    httpsnippet: ['javascript', 'fetch', { useObjectBody: true }],
    highlight: 'javascript',
  },
  kotlin: {
    httpsnippet: ['java', 'okhttp'],
    highlight: 'java',
  },
  node: {
    httpsnippet: ['node', 'fetch', { useObjectBody: true }],
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
  ocaml: {
    httpsnippet: ['ocaml'],
    highlight: 'ocaml',
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
  r: {
    httpsnippet: ['r'],
    highlight: 'r',
  },
  swift: {
    httpsnippet: ['swift', 'nsurlsession'],
    highlight: 'swift',
  },
};

module.exports = supportedLanguages;
