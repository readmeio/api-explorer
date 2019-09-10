/* eslint-disable */
const RGXP = /```[^```]+(?=```\n```)[^]+```/.source;

function tokenize(eat, value, silent) {
  let [match, type, json] = new RegExp(`^${RGXP}`).exec(value) || [];

  if (!match) return
  
  match = match.trim();

  return eat(match)({
    type: 'multi-code',
    children: this.tokenizeBlock(match, eat.now())
  });
}

function parser() {
  const { Parser } = this;
  // console.log(Parser.prototype)
  const tokenizers = Parser.prototype.blockTokenizers;
  const methods = Parser.prototype.blockMethods;
  
  tokenizers.multiCodeBlock = tokenize;
  methods.splice(methods.indexOf('newline'), 0, 'multiCodeBlock');
}

module.exports = parser;

module.exports.sanitize = sanitizeSchema => {
  sanitizeSchema.tagNames.push('multi-code');
  // sanitizeSchema.attributes['multi-code'] = ['variable'];

  return parser;
};
