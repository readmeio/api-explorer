const rgx = /^(#+)([^\n]+)\n{1,}/;

function tokenizer(eat, value) {
  if (!rgx.test(value)) return true;

  const [match, hash, text] = rgx.exec(value);
  const block = this.tokenizeBlock([hash, text].join(' '), eat.now());
  return eat(match)(block[0]);
}

function parser() {
  const { Parser } = this;
  const tokenizers = Parser.prototype.blockTokenizers;
  const methods = Parser.prototype.blockMethods;

  tokenizers.compactHeading = tokenizer;
  methods.splice(methods.indexOf('newline'), 0, 'compactHeading');
}

module.exports = parser;

module.exports.sanitize = sanitizeSchema => {
  const tags = sanitizeSchema.tagNames;
  tags.push('compactHeading');
  return parser;
};
