# @readme/syntax-highlighter

ReadMe's React-based syntax highlighter

[![Build](https://github.com/readmeio/api-explorer/workflows/CI/badge.svg)](https://github.com/readmeio/api-explorer/tree/master/packages/syntax-highlighter)

[![](https://d3vv6lp55qjaqc.cloudfront.net/items/1M3C3j0I0s0j3T362344/Untitled-2.png)](https://readme.io)

## Installation

```
npm install --save @readme/syntax-highlighter
```

## Usage

```js
const syntaxHighlighter = require('@readme/syntax-highlighter');
console.log(syntaxHighlighter('console.log("Hello, world!");', 'js'));
```

## Languages Supported
| Language | Available language mode(s) |
| :--- | :--- |
| ASP.NET | `asp`, `aspx` |
| C | `c` |
| C++ | `c++`, `cpp`, `cplusplus` |
| C# | `cs`, `csharp` |
| Clojure | `clj`, `cljc`, `cljx` `clojure` |
| CSS | `css`, `scss`, `styl`, `stylus` |
| cURL | `curl`, `shell` |
| Cypher | `cyp`, `cypher` |
| Dart | `dart` |
| Docker | `dockerfile` |
| Go | `go` |
| HTML/XML | `html`, `xhtml`, `xml` |
| Java | `java` |
| JavaScript | `ecmascript`, `javascript`, `js`, `node` |
| JSON | `json` |
| Kotlin | `kotlin`, `kt` |
| Liquid | `liquid` |
| Markdown | `markdown` |
| Objective-C | `objc`, `objectivec`,  |
| Objective-C++ | `objc++`, `objectivecpp`, `objectivecplusplus`,  |
| PHP | `php` |
| PowerShell | `powershell`, `ps1` |
| Python | `py`, `python` |
| Ruby | `jruby`, `macruby`, `r`, `rake`, `rb`, `rbx`, `ruby` |
| Scala | `scala` |
| Shell | `bash`, `sh`, `shell`, `zsh` |
| SQL | `cql`, `mssql`, `mysql`, `plsql`, `postgres`, `postgresql`, `pgsql`, `sql`, `sqlite` |
| Swift | `swift` |
| TypeScript | `typescript` |

## Contributing
### Adding support for a new language

To add a new language:

* Create a new directory in the fixtures directory for the language (for example): `__tests__/__fixtures__/yaml/`
* Add a `sample.yaml` file into `__tests__/__fixtures__yaml/` containing a code snippet of the language you're targeting
    * https://github.com/leachim6/hello-world/ is a helpful resource covering most every language
* Add a `index.js` file in `__tests__/__fixtures__yaml/` that matches the following structure:

```js
module.exports = {
  language: 'YAML', // This is the proper name of the language you're adding.
  mode: {
    primary: 'yaml', // This is the primary file extension
    aliases: {
      // Any additional extension modes that this language might utilize or be known under (SQL variantes for example).
      // Consult the CodeMirror meta file for this list.
      languageModeAlias: 'Language Name'
    },
  },
};
```

* Finally, update `uppercase.js` for any new language names, or aliases, you've added

## Credits
[Dom Harrington](https://github.com/domharrington/)

## License

ISC
