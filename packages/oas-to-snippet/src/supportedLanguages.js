module.exports = {
  c: {
    highlight: 'text/x-csrc',
    httpsnippet: {
      lang: 'c',
      default: 'c',
      targets: {
        c: {},
      },
    },
  },
  clojure: {
    highlight: 'clojure',
    httpsnippet: {
      lang: 'clojure',
      default: 'clojure',
      targets: {
        clojure: {},
      },
    },
  },
  cplusplus: {
    highlight: 'text/x-c++src',
    httpsnippet: {
      lang: 'c',
      default: 'c',
      targets: {
        c: {},
      },
    },
  },
  csharp: {
    highlight: 'text/x-csharp',
    httpsnippet: {
      lang: 'csharp',
      default: 'restsharp',
      targets: {
        httpclient: {},
        restsharp: {},
      },
    },
  },
  curl: {
    highlight: 'shell',
    httpsnippet: {
      lang: 'shell',
      default: 'curl',
      targets: {
        curl: {},
      },
    },
  },
  go: {
    highlight: 'go',
    httpsnippet: {
      lang: 'go',
      default: 'native',
      targets: {
        native: {},
      },
    },
  },
  java: {
    highlight: 'java',
    httpsnippet: {
      lang: 'java',
      default: 'okhttp',
      targets: {
        asynchttp: {},
        nethttp: {},
        okhttp: {},
        unirest: {},
      },
    },
  },
  javascript: {
    highlight: 'javascript',
    httpsnippet: {
      lang: 'javascript',
      default: 'fetch',
      targets: {
        axios: {
          install: 'npm install axios --save',
        },
        fetch: {
          opts: { useObjectBody: true },
        },
        jquery: {},
        xhr: {},
      },
    },
  },
  kotlin: {
    highlight: 'java',
    httpsnippet: {
      lang: 'java',
      default: 'okhttp',
      targets: {
        okhttp: {},
      },
    },
  },
  node: {
    highlight: 'javascript',
    httpsnippet: {
      lang: 'node',
      default: 'fetch',
      targets: {
        api: {
          opts: {
            apiDefinition: null,
            apiDefinitionUri: null,
          },
          install: 'npm install api --save',
        },
        axios: {
          install: 'npm install axios --save',
        },
        fetch: {
          opts: { useObjectBody: true },
          install: 'npm install node-fetch --save',
        },
        native: {},
        request: {
          install: 'npm install request --save',
        },
      },
    },
  },
  objectivec: {
    highlight: 'objectivec',
    httpsnippet: {
      lang: 'objc',
      default: 'nsurlsession',
      targets: {
        nsurlsession: {},
      },
    },
  },
  ocaml: {
    highlight: 'ocaml',
    httpsnippet: {
      lang: 'ocaml',
      default: 'ocaml',
      targets: {
        ocaml: {},
      },
    },
  },
  php: {
    highlight: 'php',
    httpsnippet: {
      lang: 'php',
      default: 'curl',
      targets: {
        curl: {},
      },
    },
  },
  powershell: {
    highlight: 'powershell',
    httpsnippet: {
      lang: 'powershell',
      default: 'powershell',
      targets: {
        powershell: {},
      },
    },
  },
  python: {
    highlight: 'python',
    httpsnippet: {
      lang: 'python',
      default: 'requests',
      targets: {
        requests: {
          install: 'python -m pip install requests',
        },
      },
    },
  },
  r: {
    highlight: 'r',
    httpsnippet: {
      lang: 'r',
      default: 'r',
      targets: {
        r: {},
      },
    },
  },
  ruby: {
    highlight: 'ruby',
    httpsnippet: {
      lang: 'ruby',
      default: 'ruby',
      targets: {
        ruby: {},
      },
    },
  },
  swift: {
    highlight: 'swift',
    httpsnippet: {
      lang: 'swift',
      default: 'nsurlsession',
      targets: {
        nsurlsession: {},
      },
    },
  },
};
