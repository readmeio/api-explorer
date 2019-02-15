// This is a mapping of potential languages
// that do not have a direct codemirror mode for them
// so we need to do a lookup to see what the appropriate
// mode is.
//
// There are 2 types of lookup, single and array.
// e.g. `html` needs to be rendered using `htmlmixed`, but
// `java`, needs to be rendered using the `clike` mode.
//
// We also have the mimeType to potentially in future load
// in new types dynamically
module.exports = {
  html: 'htmlmixed',
  json: ['javascript', 'application/ld+json'],
  text: ['null', 'text/plain'],
  markdown: 'gfm',
  stylus: 'scss',
  bash: 'shell',
  mysql: 'sql',
  sql: ['sql', 'text/x-sql'],
  curl: 'shell',
  asp: 'clike',
  csharp: ['clike', 'text/x-csharp'],
  cplusplus: ['clike', 'text/x-c++src'],
  c: 'clike',
  java: ['clike', 'text/x-java'],
  scala: ['clike', 'text/x-scala'],
  objectivec: ['clike', 'text/x-objectivec'],
  kotlin: ['clike', 'text/x-kotlin'],
  typescript: ['javascript', 'text/typescript'],
  liquid: 'htmlmixed',
  scss: 'css',
  php: ['php', 'text/x-php'],
  go: ['go', 'text/x-go'],
};
