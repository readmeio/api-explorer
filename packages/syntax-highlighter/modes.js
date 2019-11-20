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
  asp: 'clike',
  bash: 'shell',
  c: 'clike',
  cplusplus: ['clike', 'text/x-c++src'],
  csharp: ['clike', 'text/x-csharp'],
  curl: 'shell',
  go: ['go', 'text/x-go'],
  html: 'htmlmixed',
  java: ['clike', 'text/x-java'],
  json: ['javascript', 'application/ld+json'],
  kotlin: ['clike', 'text/x-kotlin'],
  liquid: 'htmlmixed',
  markdown: 'gfm',
  mysql: 'sql',
  objectivec: ['clike', 'text/x-objectivec'],
  php: ['php', 'text/x-php'],
  scala: ['clike', 'text/x-scala'],
  scss: 'css',
  sql: ['sql', 'text/x-sql'],
  stylus: 'scss',
  text: ['null', 'text/plain'],
  typescript: ['javascript', 'text/typescript'],
};
