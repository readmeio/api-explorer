const codeTypes = {
  asp: 'ASP.NET',
  aspx: 'ASP.NET',
  bash: 'Bash',
  c: 'C',
  'c#': 'C#',
  'c++': 'C++',
  coffeescript: 'CoffeeScript',
  clojure: 'Clojure',
  cplusplus: 'C++',
  cpp: 'C++',
  cql: 'Cassandra',
  cs: 'C#',
  csharp: 'C#',
  css: 'CSS',
  curl: 'cURL',
  cypher: 'Cypher',
  d: 'D',
  dart: 'Dart',
  dockerfile: 'Dockerfile',
  ecmascript: 'ECMAScript',
  erlang: 'Erlang',
  go: 'Go',
  groovy: 'Groovy',
  handlebars: 'Handlebars',
  haml: 'HAML',
  haxe: 'Haxe',
  html: 'HTML',
  http: 'HTTP',
  java: 'Java',
  javascript: 'JavaScript',
  jinja2: 'Jinja2',
  jruby: 'JRuby',
  js: 'JavaScript',
  json: 'JSON',
  julia: 'Julia',
  kotlin: 'Kotlin',
  less: 'LESS',
  liquid: 'Liquid',
  lua: 'Lua',
  macruby: 'MacRuby',
  markdown: 'Markdown',
  mssql: 'SQL Server',
  mysql: 'MySQL',
  node: 'Node',
  objc: 'Objective-C',
  'objc++': 'Objective-C++',
  objectivec: 'Objective-C',
  objectivecplusplus: 'Objective-C++',
  perl: 'Perl',
  php: 'PHP',
  pgsql: 'PL/pgSQL',
  plsql: 'PL/SQL',
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  powershell: 'PowerShell',
  ps1: 'PowerShell',
  python: 'Python',
  r: 'R',
  rake: 'Rake',
  rbx: 'Rubinius',
  ruby: 'Ruby',
  rust: 'Rust',
  sass: 'SASS',
  scala: 'Scala',
  scss: 'SCSS',
  shell: 'Shell',
  smarty: 'Smarty',
  sql: 'SQL',
  sqlite: 'SQLite',
  stylus: 'Stylus',
  styl: 'Stylus',
  swift: 'Swift',
  text: 'Text',
  toml: 'TOML',
  twig: 'Twig',
  typescript: 'TypeScript',
  xhtml: 'XHTML',
  xml: 'XML',
  yaml: 'YAML',
  zsh: 'Zsh',
};

module.exports = function uppercase(language) {
  if (codeTypes[language]) return codeTypes[language];
  return language;
};
