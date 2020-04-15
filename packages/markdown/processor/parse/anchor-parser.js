function tokenizer(eat, value) {
  return eat(value);
}

module.exports = function parser(data) {
  console.log(data);
  const { Parser } = this;
  const tokenizers = Parser.prototype.blockTokenizers;
  const methods = Parser.prototype.blockMethods;

  tokenizers.anchor = tokenizer;
  methods.splice(methods.indexOf('newline'), 0, 'anchor');
};
